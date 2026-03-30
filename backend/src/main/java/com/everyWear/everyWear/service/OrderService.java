package com.everyWear.everyWear.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.everyWear.everyWear.DAO.CouponDAO;
import com.everyWear.everyWear.DAO.ItemDAO;
import com.everyWear.everyWear.DAO.OrdersDAO;
import com.everyWear.everyWear.DAO.StockDAO;
import com.everyWear.everyWear.dto.order.OrderDetailResponse;
import com.everyWear.everyWear.dto.order.OrderItemResponse;
import com.everyWear.everyWear.dto.order.OrderItemRequest;
import com.everyWear.everyWear.dto.order.OrderSummaryResponse;
import com.everyWear.everyWear.dto.order.OrderUpsertRequest;
import com.everyWear.everyWear.exception.BadRequestException;
import com.everyWear.everyWear.exception.ResourceNotFoundException;
import com.everyWear.everyWear.model.Coupon;
import com.everyWear.everyWear.model.OrderDetail;
import com.everyWear.everyWear.model.Item;
import com.everyWear.everyWear.model.Orders;
import com.everyWear.everyWear.model.PromotionCategory;
import com.everyWear.everyWear.model.OrderStatus;
import com.everyWear.everyWear.model.Stock;

@Service
@Transactional
public class OrderService {

	private final OrdersDAO ordersDAO;
	private final ItemDAO itemDAO;
	private final CouponDAO couponDAO;
	private final StockDAO stockDAO;

	public OrderService(OrdersDAO ordersDAO, ItemDAO itemDAO, CouponDAO couponDAO, StockDAO stockDAO) {
		this.ordersDAO = ordersDAO;
		this.itemDAO = itemDAO;
		this.couponDAO = couponDAO;
		this.stockDAO = stockDAO;
	}

	private record ItemSizeKey(Integer itemId, String size) {
	}

	@Transactional(readOnly = true)
	public List<OrderSummaryResponse> getAllOrders() {
		return ordersDAO.findAllOrderByCreatedAtDesc()
				.stream()
				.map(this::toSummaryResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public OrderDetailResponse getOrderDetailById(Integer id) {
		Orders orders = ordersDAO.findByIdWithDetails(id)
				.orElseThrow(() -> new ResourceNotFoundException("Order with id " + id + " was not found"));
		return toDetailResponse(orders);
	}

	public OrderDetailResponse recalculateOrder(Integer id) {
		Orders orders = ordersDAO.findByIdWithDetails(id)
				.orElseThrow(() -> new ResourceNotFoundException("Order with id " + id + " was not found"));
		recalculateTotals(orders);
		return toDetailResponse(ordersDAO.save(orders));
	}

	public int recalculateAllOrders() {
		List<Orders> ordersList = ordersDAO.findAllWithDetails();
		for (Orders orders : ordersList) {
			recalculateTotals(orders);
		}
		ordersDAO.saveAll(ordersList);
		return ordersList.size();
	}

	public OrderDetailResponse createOrder(OrderUpsertRequest request) {
		Orders orders = new Orders();
		orders.setStatus(OrderStatus.ACTIVE);
		applyUpsertRequest(orders, request, true);
		applyStockDelta(Map.of(), summarizeOrderDetails(orders.getOrderDetails()));
		Orders saved = ordersDAO.save(orders);
		deactivateCouponIfPresent(saved.getCoupon());
		return toDetailResponse(saved);
	}

	public OrderDetailResponse updateOrder(Integer id, OrderUpsertRequest request) {
		Orders orders = ordersDAO.findByIdWithDetails(id)
				.orElseThrow(() -> new ResourceNotFoundException("Order with id " + id + " was not found"));
		if (orders.getStatus() == null) {
			orders.setStatus(OrderStatus.ACTIVE);
		}
		if (orders.getStatus() == OrderStatus.CANCELLED) {
			throw new BadRequestException("Cannot update a cancelled order");
		}

		Map<ItemSizeKey, Integer> before = summarizeOrderDetails(orders.getOrderDetails());
		applyUpsertRequest(orders, request, false);
		Map<ItemSizeKey, Integer> after = summarizeOrderDetails(orders.getOrderDetails());
		applyStockDelta(before, after);
		Orders saved = ordersDAO.save(orders);
		deactivateCouponIfPresent(saved.getCoupon());
		return toDetailResponse(saved);
	}

	public void deleteOrder(Integer id) {
		cancelOrder(id);
	}

	public void cancelOrder(Integer id) {
		Orders orders = ordersDAO.findByIdWithDetails(id)
				.orElseThrow(() -> new ResourceNotFoundException("Order with id " + id + " was not found"));
		if (orders.getStatus() == OrderStatus.CANCELLED) {
			return;
		}
		applyStockDelta(summarizeOrderDetails(orders.getOrderDetails()), Map.of());
		orders.setStatus(OrderStatus.CANCELLED);
		ordersDAO.save(orders);
	}

	private OrderSummaryResponse toSummaryResponse(Orders orders) {
		OrderSummaryResponse response = new OrderSummaryResponse();
		response.setId(orders.getId());
		response.setStatus(orders.getStatus() == null ? OrderStatus.ACTIVE.name() : orders.getStatus().name());
		response.setOrderDate(toLocalDateTime(orders.getOrderDate()));
		response.setTotalPrice(orders.getTotalPrice());
		response.setDiscountAmount(orders.getDiscountAmount());
		response.setNetValue(orders.getNetValue());
		return response;
	}

	private OrderDetailResponse toDetailResponse(Orders orders) {
		OrderDetailResponse response = new OrderDetailResponse();
		response.setId(orders.getId());
		response.setStatus(orders.getStatus() == null ? OrderStatus.ACTIVE.name() : orders.getStatus().name());
		response.setCouponId(orders.getCoupon() == null ? null : orders.getCoupon().getId());
		response.setCouponCode(orders.getCoupon() == null ? null : orders.getCoupon().getCode());
		response.setOrderDate(toLocalDateTime(orders.getOrderDate()));
		response.setCreatedAt(toLocalDateTime(orders.getCreatedAt()));
		response.setTotalPrice(orders.getTotalPrice());
		response.setDiscountAmount(orders.getDiscountAmount());
		response.setNetValue(orders.getNetValue());

			for (OrderDetail detail : orders.getOrderDetails()) {
				OrderItemResponse itemResponse = new OrderItemResponse();
				itemResponse.setItemId(detail.getItem() == null ? null : detail.getItem().getId());
				itemResponse.setItemName(detail.getItem() == null ? null : detail.getItem().getName());
				itemResponse.setSize(detail.getSize());
				itemResponse.setQuantity(detail.getQuantity());
				itemResponse.setUnitPrice(detail.getPrice());
				itemResponse.setLineTotal(calculateLineTotal(detail.getPrice(), detail.getQuantity()));
				response.getItems().add(itemResponse);
			}

		return response;
	}

	private void applyUpsertRequest(Orders orders, OrderUpsertRequest request, boolean isCreate) {
		if (orders.getStatus() == null) {
			orders.setStatus(OrderStatus.ACTIVE);
		}

		Coupon coupon;
		if (isCreate) {
			coupon = resolveCoupon(request.getCouponId(), request.getCouponCode());
		} else {
			coupon = enforceCouponUnchanged(orders.getCoupon(), request.getCouponId(), request.getCouponCode());
		}
		orders.setCoupon(coupon);

		if (isCreate && orders.getCreatedAt() == null) {
			orders.setCreatedAt(new Date());
		}

		if (request.getOrderDate() != null) {
			orders.setOrderDate(Timestamp.valueOf(request.getOrderDate()));
		} else if (isCreate && orders.getOrderDate() == null) {
			orders.setOrderDate(orders.getCreatedAt());
		}

			Set<OrderDetail> details = new HashSet<>();
			for (OrderItemRequest itemRequest : request.getItems()) {
				Item item = itemDAO.findById(itemRequest.getItemId())
						.orElseThrow(() -> new ResourceNotFoundException(
								"Item with id " + itemRequest.getItemId() + " was not found"));

			BigDecimal unitPrice = itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : item.getPrice();
			if (unitPrice == null) {
				throw new BadRequestException("Item price is required (itemId=" + item.getId() + ")");
			}

				OrderDetail detail = new OrderDetail();
				detail.setOrders(orders);
				detail.setItem(item);
				detail.setSize(itemRequest.getSize() == null ? null : itemRequest.getSize().trim());
				detail.setQuantity(itemRequest.getQuantity());
				detail.setPrice(unitPrice);
				details.add(detail);
			}

		orders.getOrderDetails().clear();
		orders.getOrderDetails().addAll(details);

		BigDecimal totalPrice = calculateTotalPrice(details);
		BigDecimal eligibleSubtotal = calculateEligibleSubtotal(coupon, details);
		BigDecimal discountAmount = coupon == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
				: calculateDiscountAmount(coupon, eligibleSubtotal);
		BigDecimal netValue = totalPrice.subtract(discountAmount);

		orders.setTotalPrice(totalPrice);
		orders.setDiscountAmount(discountAmount);
			orders.setNetValue(netValue);
		}

	private Map<ItemSizeKey, Integer> summarizeOrderDetails(Set<OrderDetail> details) {
		Map<ItemSizeKey, Integer> summary = new HashMap<>();
		if (details == null || details.isEmpty()) {
			return summary;
		}

		for (OrderDetail detail : details) {
			if (detail == null || detail.getItem() == null || detail.getItem().getId() == null) {
				continue;
			}
			Integer itemId = detail.getItem().getId();
			String size = detail.getSize() == null ? null : detail.getSize().trim();
			if (size == null || size.isEmpty()) {
				continue;
			}
			int quantity = detail.getQuantity();
			if (quantity <= 0) {
				continue;
			}
			ItemSizeKey key = new ItemSizeKey(itemId, size);
			summary.merge(key, quantity, Integer::sum);
		}

		return summary;
	}

	private void applyStockDelta(Map<ItemSizeKey, Integer> before, Map<ItemSizeKey, Integer> after) {
		Set<ItemSizeKey> keys = new HashSet<>();
		keys.addAll(before.keySet());
		keys.addAll(after.keySet());

		for (ItemSizeKey key : keys) {
			int oldQty = before.getOrDefault(key, 0);
			int newQty = after.getOrDefault(key, 0);
			int diff = newQty - oldQty;
			if (diff == 0) {
				continue;
			}
			if (diff > 0) {
				consumeStock(key, diff);
			} else {
				releaseStock(key, -diff);
			}
		}
	}

	private void consumeStock(ItemSizeKey key, int amount) {
		if (amount <= 0) {
			return;
		}

		Stock stock = stockDAO.findForUpdateByItemIdAndSize(key.itemId(), key.size())
				.orElseThrow(() -> new BadRequestException(
						"Stock not found for itemId=" + key.itemId() + ", size=" + key.size()));

		int available = stock.getQuantity();
		if (available < amount) {
			throw new BadRequestException(
					"Insufficient stock for itemId=" + key.itemId() + ", size=" + key.size()
							+ " (available=" + available + ", requested=" + amount + ")");
		}

		stock.setQuantity(available - amount);
		stock.setUpdatedAt(new Date());
		stockDAO.save(stock);
	}

	private void releaseStock(ItemSizeKey key, int amount) {
		if (amount <= 0) {
			return;
		}

		Stock stock = stockDAO.findForUpdateByItemIdAndSize(key.itemId(), key.size())
				.orElseGet(() -> {
					Item item = itemDAO.findById(key.itemId()).orElseThrow(
							() -> new ResourceNotFoundException("Item with id " + key.itemId() + " was not found"));
					Stock created = new Stock();
					created.setItem(item);
					created.setSize(key.size());
					created.setQuantity(0);
					created.setUpdatedAt(new Date());
					return created;
				});

		stock.setQuantity(stock.getQuantity() + amount);
		stock.setUpdatedAt(new Date());
		stockDAO.save(stock);
	}

	private Coupon enforceCouponUnchanged(Coupon existingCoupon, Integer requestCouponId, String requestCouponCode) {
		Integer existingId = existingCoupon == null ? null : existingCoupon.getId();
		String existingCode = existingCoupon == null ? null : existingCoupon.getCode();
		String normalizedRequestCode = requestCouponCode == null ? null : requestCouponCode.trim();
		String normalizedExistingCode = existingCode == null ? null : existingCode.trim();

		boolean requestHasCode = normalizedRequestCode != null && !normalizedRequestCode.isEmpty();

		if (existingCoupon == null) {
			if (requestCouponId != null || requestHasCode) {
				throw new BadRequestException("Cannot add or change coupon on an existing order");
			}
			return null;
		}

		// If request does not include coupon fields, keep existing coupon.
		if (requestCouponId == null && !requestHasCode) {
			return existingCoupon;
		}

		if (requestCouponId != null && !requestCouponId.equals(existingId)) {
			throw new BadRequestException("Cannot change coupon on an existing order");
		}
		if (requestHasCode && (normalizedExistingCode == null
				|| !normalizedExistingCode.equalsIgnoreCase(normalizedRequestCode))) {
			throw new BadRequestException("Cannot change coupon on an existing order");
		}

		// NOTE: Do not validate usability here. Coupons can become inactive after first use,
		// but we still allow editing the same order that already consumed the coupon.
		return existingCoupon;
	}

	private void deactivateCouponIfPresent(Coupon coupon) {
		if (coupon == null) {
			return;
		}
		if (!coupon.isIsActive()) {
			return;
		}
		coupon.setIsActive(false);
		couponDAO.save(coupon);
	}

	private void recalculateTotals(Orders orders) {
		if (orders.getStatus() == null) {
			orders.setStatus(OrderStatus.ACTIVE);
		}

		Set<OrderDetail> details = orders.getOrderDetails() == null ? Set.of() : orders.getOrderDetails();
		Coupon coupon = orders.getCoupon();

		BigDecimal totalPrice = calculateTotalPrice(details);
		BigDecimal eligibleSubtotal = calculateEligibleSubtotal(coupon, details);
		BigDecimal discountAmount = coupon == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
				: calculateDiscountAmount(coupon, eligibleSubtotal);
		BigDecimal netValue = totalPrice.subtract(discountAmount);

		orders.setTotalPrice(totalPrice);
		orders.setDiscountAmount(discountAmount);
		orders.setNetValue(netValue);
	}

	private BigDecimal calculateEligibleSubtotal(Coupon coupon, Set<OrderDetail> details) {
		if (coupon == null || coupon.getPromotion() == null) {
			return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
		}

		Set<PromotionCategory> promotionCategories = coupon.getPromotion().getPromotionCategories();
		if (promotionCategories == null || promotionCategories.isEmpty()) {
			return calculateTotalPrice(details);
		}

		Set<Integer> allowedCategoryIds = promotionCategories.stream()
				.map(pc -> pc.getCategory() == null ? null : pc.getCategory().getId())
				.filter(id -> id != null)
				.collect(java.util.stream.Collectors.toSet());

		if (allowedCategoryIds.isEmpty()) {
			return calculateTotalPrice(details);
		}

		BigDecimal eligibleTotal = BigDecimal.ZERO;
		for (OrderDetail detail : details) {
			if (detail.getItem() == null || detail.getItem().getCategory() == null
					|| detail.getItem().getCategory().getId() == null) {
				continue;
			}
			Integer categoryId = detail.getItem().getCategory().getId();
			if (!allowedCategoryIds.contains(categoryId)) {
				continue;
			}

			BigDecimal lineTotal = calculateLineTotal(detail.getPrice(), detail.getQuantity());
			if (lineTotal != null) {
				eligibleTotal = eligibleTotal.add(lineTotal);
			}
		}

		return eligibleTotal.setScale(2, RoundingMode.HALF_UP);
	}

	private Coupon resolveCoupon(Integer couponId, String couponCode) {
		if (couponId != null) {
			Coupon coupon = couponDAO.findById(couponId)
					.orElseThrow(() -> new ResourceNotFoundException("Coupon with id " + couponId + " was not found"));
			validateCouponUsable(coupon);
			return coupon;
		}
		if (couponCode == null || couponCode.trim().isEmpty()) {
			return null;
		}

		String normalized = couponCode.trim();
		Coupon coupon = couponDAO.findByCode(normalized)
				.orElseThrow(() -> new ResourceNotFoundException("Coupon with code " + normalized + " was not found"));
		validateCouponUsable(coupon);
		return coupon;
	}

	private void validateCouponUsable(Coupon coupon) {
		if (coupon == null) {
			return;
		}
		Date now = new Date();

		if (!coupon.isIsActive()) {
			throw new BadRequestException("Coupon is inactive");
		}
		if (coupon.getExpireDate() != null && coupon.getExpireDate().before(now)) {
			throw new BadRequestException("Coupon is expired");
		}
		if (coupon.getPromotion() != null) {
			if (!coupon.getPromotion().isIsActive()) {
				throw new BadRequestException("Promotion is inactive");
			}
			if (coupon.getPromotion().getStartAt() != null && coupon.getPromotion().getStartAt().after(now)) {
				throw new BadRequestException("Promotion has not started");
			}
			if (coupon.getPromotion().getEndAt() != null && coupon.getPromotion().getEndAt().before(now)) {
				throw new BadRequestException("Promotion has ended");
			}
		}
	}

	private BigDecimal calculateTotalPrice(Set<OrderDetail> details) {
		BigDecimal total = BigDecimal.ZERO;
		for (OrderDetail detail : details) {
			BigDecimal lineTotal = calculateLineTotal(detail.getPrice(), detail.getQuantity());
			if (lineTotal != null) {
				total = total.add(lineTotal);
			}
		}
		return total.setScale(2, RoundingMode.HALF_UP);
	}

	private BigDecimal calculateDiscountAmount(Coupon coupon, BigDecimal totalPrice) {
		if (coupon == null || coupon.getPromotion() == null || coupon.getPromotion().getDiscountValue() == null) {
			return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
		}

		BigDecimal discountPercent = coupon.getPromotion().getDiscountValue();
		if (discountPercent.compareTo(BigDecimal.ZERO) <= 0) {
			return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
		}

		BigDecimal maxPercent = new BigDecimal("100");
		if (discountPercent.compareTo(maxPercent) > 0) {
			discountPercent = maxPercent;
		}

		BigDecimal discount = totalPrice.multiply(discountPercent)
				.divide(maxPercent, 4, RoundingMode.HALF_UP);
		return discount.min(totalPrice).setScale(2, RoundingMode.HALF_UP);
	}

	private BigDecimal calculateLineTotal(BigDecimal unitPrice, int quantity) {
		if (unitPrice == null) {
			return null;
		}
		return unitPrice.multiply(BigDecimal.valueOf(quantity));
	}

	private LocalDateTime toLocalDateTime(Date value) {
		if (value == null) {
			return null;
		}
		return new Timestamp(value.getTime()).toLocalDateTime();
	}
}

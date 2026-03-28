package com.everyWear.everyWear.service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.everyWear.everyWear.DAO.OrdersDAO;
import com.everyWear.everyWear.dto.order.OrderDetailResponse;
import com.everyWear.everyWear.dto.order.OrderItemResponse;
import com.everyWear.everyWear.dto.order.OrderSummaryResponse;
import com.everyWear.everyWear.exception.ResourceNotFoundException;
import com.everyWear.everyWear.model.OrderDetail;
import com.everyWear.everyWear.model.Orders;

@Service
@Transactional
public class OrderService {

	private final OrdersDAO ordersDAO;

	public OrderService(OrdersDAO ordersDAO) {
		this.ordersDAO = ordersDAO;
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

	private OrderSummaryResponse toSummaryResponse(Orders orders) {
		OrderSummaryResponse response = new OrderSummaryResponse();
		response.setId(orders.getId());
		response.setOrderDate(toLocalDateTime(orders.getOrderDate()));
		response.setTotalPrice(orders.getTotalPrice());
		response.setDiscountAmount(orders.getDiscountAmount());
		response.setNetValue(orders.getNetValue());
		return response;
	}

	private OrderDetailResponse toDetailResponse(Orders orders) {
		OrderDetailResponse response = new OrderDetailResponse();
		response.setId(orders.getId());
		response.setOrderDate(toLocalDateTime(orders.getOrderDate()));
		response.setCreatedAt(toLocalDateTime(orders.getCreatedAt()));
		response.setTotalPrice(orders.getTotalPrice());
		response.setDiscountAmount(orders.getDiscountAmount());
		response.setNetValue(orders.getNetValue());

		for (OrderDetail detail : orders.getOrderDetails()) {
			OrderItemResponse itemResponse = new OrderItemResponse();
			itemResponse.setItemId(detail.getItem() == null ? null : detail.getItem().getId());
			itemResponse.setItemName(detail.getItem() == null ? null : detail.getItem().getName());
			itemResponse.setQuantity(detail.getQuantity());
			itemResponse.setUnitPrice(detail.getPrice());
			itemResponse.setLineTotal(calculateLineTotal(detail.getPrice(), detail.getQuantity()));
			response.getItems().add(itemResponse);
		}

		return response;
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

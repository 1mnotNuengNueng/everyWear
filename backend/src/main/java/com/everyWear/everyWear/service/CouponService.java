package com.everyWear.everyWear.service;

import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.everyWear.everyWear.DAO.CouponDAO;
import com.everyWear.everyWear.DAO.OrdersDAO;
import com.everyWear.everyWear.DAO.PromotionCategoryDAO;
import com.everyWear.everyWear.DAO.PromotionDAO;
import com.everyWear.everyWear.dto.coupon.CouponCategoryResponse;
import com.everyWear.everyWear.dto.coupon.CouponCategorySummary;
import com.everyWear.everyWear.dto.coupon.CouponCodeValidationRequest;
import com.everyWear.everyWear.dto.coupon.CouponRequest;
import com.everyWear.everyWear.dto.coupon.CouponResponse;
import com.everyWear.everyWear.dto.coupon.CouponStatusUpdateRequest;
import com.everyWear.everyWear.dto.coupon.CouponValidationResponse;
import com.everyWear.everyWear.exception.BadRequestException;
import com.everyWear.everyWear.exception.ResourceNotFoundException;
import com.everyWear.everyWear.model.Coupon;
import com.everyWear.everyWear.model.Promotion;
import com.everyWear.everyWear.model.PromotionCategory;

@Service
@Transactional
public class CouponService {

	private static final String COUPON_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	private static final int COUPON_CODE_LENGTH = 10;
	private static final int MAX_CODE_GENERATION_ATTEMPTS = 20;
	private static final int PARTNER_PROMOTION_ID = 1;
	private static final int PARTNER_COUPON_EXPIRE_DAYS = 30;

	private final CouponDAO couponDAO;
	private final PromotionDAO promotionDAO;
	private final PromotionCategoryDAO promotionCategoryDAO;
	private final OrdersDAO ordersDAO;
	private final SecureRandom secureRandom = new SecureRandom();

	public CouponService(
			CouponDAO couponDAO,
			PromotionDAO promotionDAO,
			PromotionCategoryDAO promotionCategoryDAO,
			OrdersDAO ordersDAO) {
		this.couponDAO = couponDAO;
		this.promotionDAO = promotionDAO;
		this.promotionCategoryDAO = promotionCategoryDAO;
		this.ordersDAO = ordersDAO;
	}

	public CouponResponse createCoupon(CouponRequest request) {
		Promotion promotion = getPromotionById(request.getPromotionId());
		Coupon coupon = new Coupon();
		applyRequestToCoupon(coupon, request, promotion, generateUniqueCouponCode());
		coupon.setCreatedAt(new Date());

		return toResponse(couponDAO.save(coupon));
	}

	@Transactional(readOnly = true)
	public List<CouponResponse> getAllCoupons() {
		return couponDAO.findAllWithPromotionCategories()
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public CouponResponse getCouponById(Integer id) {
		return toResponse(getCouponEntityById(id));
	}

	@Transactional(readOnly = true)
	public CouponResponse getCouponByCode(String code) {
		return toResponse(getCouponEntityByCode(code));
	}

	@Transactional(readOnly = true)
	public CouponValidationResponse validateCouponCode(CouponCodeValidationRequest request) {
		Coupon coupon = getCouponEntityByCode(request.getCode());
		validateCouponUsable(coupon);

		CouponResponse couponResponse = toResponse(coupon);
		CouponValidationResponse response = new CouponValidationResponse();
		response.setCoupon(couponResponse);
		response.setCategories(mapCouponCategories(couponResponse));
		return response;
	}

	public CouponResponse updateCoupon(Integer id, CouponRequest request) {
		Coupon coupon = getCouponEntityById(id);
		Promotion promotion = getPromotionById(request.getPromotionId());
		String code = resolveCouponCodeForUpdate(coupon, request.getCode(), id);
		applyRequestToCoupon(coupon, request, promotion, code);

		return toResponse(couponDAO.save(coupon));
	}

	public CouponResponse updateCouponStatus(Integer id, CouponStatusUpdateRequest request) {
		Coupon coupon = getCouponEntityById(id);
		coupon.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
		return toResponse(couponDAO.save(coupon));
	}

	public void deleteCoupon(Integer id) {
		Coupon coupon = getCouponEntityById(id);
		couponDAO.delete(coupon);
	}

	public CouponResponse createPartnerCoupon() {
		Promotion promotion = getPromotionById(PARTNER_PROMOTION_ID);
		Coupon coupon = new Coupon();
		coupon.setPromotion(promotion);
		coupon.setCode(generateUniqueCouponCode());
		coupon.setExpireDate(Timestamp.valueOf(LocalDateTime.now().plusDays(PARTNER_COUPON_EXPIRE_DAYS)));
		coupon.setIsActive(true);
		coupon.setCreatedAt(new Date());

		return toResponse(couponDAO.save(coupon));
	}

	@Transactional(readOnly = true)
	public List<CouponResponse> getAllCouponsByPromotionId(Integer promotionId) {
		getPromotionById(promotionId);
		return couponDAO.findDetailedByPromotionId(promotionId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	private void applyRequestToCoupon(Coupon coupon, CouponRequest request, Promotion promotion, String code) {
		coupon.setPromotion(promotion);
		coupon.setCode(code);
		coupon.setExpireDate(Timestamp.valueOf(request.getExpireDate()));
		coupon.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
	}

	private Coupon getCouponEntityById(Integer id) {
		return couponDAO.findDetailedById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Coupon with id " + id + " was not found"));
	}

	private Coupon getCouponEntityByCode(String code) {
		String normalizedCode = normalizeCode(code);
		return couponDAO.findDetailedByCode(normalizedCode)
				.orElseThrow(() -> new ResourceNotFoundException("Coupon with code " + normalizedCode + " was not found"));
	}

	private Promotion getPromotionById(Integer id) {
		Promotion promotion = promotionDAO.getPromotionById(id);
		if (promotion == null) {
			throw new ResourceNotFoundException("Promotion with id " + id + " was not found");
		}
		return promotion;
	}

	private void validateUniqueCode(String code, Integer couponId) {
		String normalizedCode = normalizeCode(code);
		boolean exists = couponId == null
				? couponDAO.existsByCode(normalizedCode)
				: couponDAO.existsByCodeAndIdNot(normalizedCode, couponId);

		if (exists) {
			throw new BadRequestException("Coupon code already exists");
		}
	}

	private String resolveCouponCodeForUpdate(Coupon coupon, String requestedCode, Integer couponId) {
		if (requestedCode == null || requestedCode.trim().isEmpty()) {
			return coupon.getCode();
		}

		validateUniqueCode(requestedCode, couponId);
		return normalizeCode(requestedCode);
	}

	private String generateUniqueCouponCode() {
		for (int attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
			String code = randomCode();
			if (!couponDAO.existsByCode(code)) {
				return code;
			}
		}
		throw new BadRequestException("Unable to generate a unique coupon code right now");
	}

	private String randomCode() {
		StringBuilder builder = new StringBuilder(COUPON_CODE_LENGTH);
		for (int index = 0; index < COUPON_CODE_LENGTH; index++) {
			int randomIndex = secureRandom.nextInt(COUPON_CODE_CHARACTERS.length());
			builder.append(COUPON_CODE_CHARACTERS.charAt(randomIndex));
		}
		return builder.toString();
	}

	private String normalizeCode(String code) {
		if (code == null || code.trim().isEmpty()) {
			throw new BadRequestException("Coupon code is required");
		}
		return code.trim().toUpperCase();
	}

	private CouponResponse toResponse(Coupon coupon) {
		CouponResponse response = new CouponResponse();
		response.setId(coupon.getId());
		response.setCode(coupon.getCode());
		response.setExpireDate(toLocalDateTime(coupon.getExpireDate()));
		response.setActive(coupon.isIsActive());
		response.setCreatedAt(toLocalDateTime(coupon.getCreatedAt()));
		response.setPromotionId(coupon.getPromotion().getId());
		response.setPromotionName(coupon.getPromotion().getName());
		response.setDiscountValue(coupon.getPromotion().getDiscountValue());
		response.setUsedOrderIds(resolveUsedOrderIds(coupon));

		List<CouponCategorySummary> allowedCategories = resolveAllowedCategories(coupon);
		if (!allowedCategories.isEmpty()) {
			response.setAllowedCategories(allowedCategories);
			response.setAllowedCategoryIds(
					allowedCategories.stream().map(CouponCategorySummary::getId).toList());
		}

		return response;
	}

	private List<Integer> resolveUsedOrderIds(Coupon coupon) {
		if (coupon.getId() == null) {
			return List.of();
		}
		return ordersDAO.findOrderIdsByCouponId(coupon.getId());
	}

	private List<CouponCategorySummary> resolveAllowedCategories(Coupon coupon) {
		if (coupon.getPromotion() == null || coupon.getPromotion().getId() == null) {
			return List.of();
		}

		List<PromotionCategory> promotionCategories = promotionCategoryDAO.getByPromotionId(coupon.getPromotion().getId());
		if (promotionCategories.isEmpty()) {
			return List.of();
		}

		return promotionCategories.stream()
				.map(PromotionCategory::getCategory)
				.filter(category -> category != null && category.getId() != null)
				.collect(java.util.stream.Collectors.toMap(
						category -> category.getId(),
						category -> category,
						(first, second) -> first))
				.values()
				.stream()
				.map(category -> {
					CouponCategorySummary summary = new CouponCategorySummary();
					summary.setId(category.getId());
					summary.setName(category.getName());
					return summary;
				})
				.toList();
	}

	private List<CouponCategoryResponse> mapCouponCategories(CouponResponse couponResponse) {
		if (couponResponse.getAllowedCategories() == null || couponResponse.getAllowedCategories().isEmpty()) {
			return List.of();
		}

		return couponResponse.getAllowedCategories()
				.stream()
				.map(category -> {
					CouponCategoryResponse response = new CouponCategoryResponse();
					response.setId(category.getId());
					response.setName(category.getName());
					return response;
				})
				.toList();
	}

	private void validateCouponUsable(Coupon coupon) {
		if (coupon == null) {
			return;
		}

		Date now = new Date();

		if (!coupon.isIsActive()) {
			throw new BadRequestException("Coupon has already been used");
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

	private LocalDateTime toLocalDateTime(Date value) {
		if (value == null) {
			return null;
		}
		return new Timestamp(value.getTime()).toLocalDateTime();
	}
}

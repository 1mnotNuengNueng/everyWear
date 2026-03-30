package com.everyWear.everyWear.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.everyWear.everyWear.DAO.CouponDAO;
import com.everyWear.everyWear.DAO.PromotionDAO;
import com.everyWear.everyWear.dto.coupon.CouponRequest;
import com.everyWear.everyWear.dto.coupon.CouponResponse;
import com.everyWear.everyWear.exception.BadRequestException;
import com.everyWear.everyWear.exception.ResourceNotFoundException;
import com.everyWear.everyWear.model.Coupon;
import com.everyWear.everyWear.model.Promotion;
import com.everyWear.everyWear.model.PromotionCategory;

@Service
@Transactional
public class CouponService {

	private final CouponDAO couponDAO;
	private final PromotionDAO promotionDAO;

	public CouponService(CouponDAO couponDAO, PromotionDAO promotionDAO) {
		this.couponDAO = couponDAO;
		this.promotionDAO = promotionDAO;
	}

	public CouponResponse createCoupon(CouponRequest request) {
		validateUniqueCode(request.getCode(), null);

		Promotion promotion = getPromotionById(request.getPromotionId());
		Coupon coupon = new Coupon();
		applyRequestToCoupon(coupon, request, promotion);
		coupon.setCreatedAt(new Date());

		return toResponse(couponDAO.save(coupon));
	}

	@Transactional(readOnly = true)
	public List<CouponResponse> getAllCoupons() {
		return couponDAO.findAll()
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public CouponResponse getCouponById(Integer id) {
		return toResponse(getCouponEntityById(id));
	}

	public CouponResponse updateCoupon(Integer id, CouponRequest request) {
		Coupon coupon = getCouponEntityById(id);
		validateUniqueCode(request.getCode(), id);

		Promotion promotion = getPromotionById(request.getPromotionId());
		applyRequestToCoupon(coupon, request, promotion);

		return toResponse(couponDAO.save(coupon));
	}

	public void deleteCoupon(Integer id) {
		Coupon coupon = getCouponEntityById(id);
		couponDAO.delete(coupon);
	}

	private void applyRequestToCoupon(Coupon coupon, CouponRequest request, Promotion promotion) {
		coupon.setPromotion(promotion);
		coupon.setCode(request.getCode().trim());
		coupon.setExpireDate(Timestamp.valueOf(request.getExpireDate()));
		coupon.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
	}

	private Coupon getCouponEntityById(Integer id) {
		return couponDAO.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Coupon with id " + id + " was not found"));
	}

	private Promotion getPromotionById(Integer id) {
		return promotionDAO.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Promotion with id " + id + " was not found"));
	}

	private void validateUniqueCode(String code, Integer couponId) {
		String normalizedCode = code.trim();
		boolean exists = couponId == null
				? couponDAO.existsByCode(normalizedCode)
				: couponDAO.existsByCodeAndIdNot(normalizedCode, couponId);

		if (exists) {
			throw new BadRequestException("Coupon code already exists");
		}
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

		Set<PromotionCategory> promotionCategories = coupon.getPromotion().getPromotionCategories();
		if (promotionCategories != null && !promotionCategories.isEmpty()) {
			List<Integer> allowedCategoryIds = promotionCategories.stream()
					.map(pc -> pc.getCategory() == null ? null : pc.getCategory().getId())
					.filter(id -> id != null)
					.distinct()
					.toList();
			if (!allowedCategoryIds.isEmpty()) {
				response.setAllowedCategoryIds(allowedCategoryIds);
			}
		}

		return response;
	}

	private LocalDateTime toLocalDateTime(Date value) {
		if (value == null) {
			return null;
		}
		return new Timestamp(value.getTime()).toLocalDateTime();
	}
}

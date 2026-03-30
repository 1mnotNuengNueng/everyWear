package com.everyWear.everyWear.service;

import java.security.SecureRandom;
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
import com.everyWear.everyWear.dto.coupon.CouponStatusUpdateRequest;
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
<<<<<<< HEAD
	private static final int PARTNER_PROMOTION_ID = 1;
	private static final int PARTNER_COUPON_EXPIRE_DAYS = 30;
=======
>>>>>>> 7f7923f565874ced6b51b1c4c187dbddc7595d60

	private final CouponDAO couponDAO;
	private final PromotionDAO promotionDAO;
	private final SecureRandom secureRandom = new SecureRandom();

	public CouponService(CouponDAO couponDAO, PromotionDAO promotionDAO) {
		this.couponDAO = couponDAO;
		this.promotionDAO = promotionDAO;
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
		return couponDAO.findAll()
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

<<<<<<< HEAD
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
		return couponDAO.findByPromotion_Id(promotionId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

=======
>>>>>>> 7f7923f565874ced6b51b1c4c187dbddc7595d60
	private void applyRequestToCoupon(Coupon coupon, CouponRequest request, Promotion promotion, String code) {
		coupon.setPromotion(promotion);
		coupon.setCode(code);
		coupon.setExpireDate(Timestamp.valueOf(request.getExpireDate()));
		coupon.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
	}

	private Coupon getCouponEntityById(Integer id) {
		return couponDAO.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Coupon with id " + id + " was not found"));
	}

	private Coupon getCouponEntityByCode(String code) {
		String normalizedCode = normalizeCode(code);
		return couponDAO.findByCode(normalizedCode)
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


public CouponResponse createPartnerCoupon(CouponRequest request) {
        // 1. บังคับเซ็ต Promotion ID เป็น 1 สำหรับ Partner เสมอ
        request.setPromotionId(1);
        
        // 2. บังคับเซ็ตวันหมดอายุ เป็นเวลาปัจจุบัน + 30 วัน
        request.setExpireDate(LocalDateTime.now().plusDays(30));

        // 3. ดึง Promotion (ระบบจะดึง ID 1 มาให้เสมอตามที่เซ็ตไว้)     
        Promotion promotion = getPromotionById(request.getPromotionId());
        
        Coupon coupon = new Coupon();
        
        applyRequestToCoupon(coupon, request, promotion, generateUniqueCouponCode());
        coupon.setCreatedAt(new Date());

        return toResponse(couponDAO.save(coupon));
    }

// เปลี่ยน Parameter เป็นรับแค่ ID และคืนค่าเป็น List
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCouponsByPromotionId(Integer promotionId) {
        
        // เช็คก่อนว่ามี Promotion นี้อยู่จริงไหม
        Promotion promotion = getPromotionById(promotionId);

        // คุณต้องไปเพิ่มคำสั่ง findByPromotion_Id(promotionId) ใน CouponDAO ก่อนนะครับ
        return couponDAO.findByPromotion_Id(promotionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

}

package com.everyWear.everyWear.dto.coupon;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CouponResponse {

	private Integer id;
	private String code;
	private LocalDateTime expireDate;
	private boolean isActive;
	private LocalDateTime createdAt;
	private Integer promotionId;
	private String promotionName;
	private BigDecimal discountValue;
	private List<Integer> allowedCategoryIds;
	private List<CouponCategorySummary> allowedCategories;
	private List<Integer> usedOrderIds;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public LocalDateTime getExpireDate() {
		return expireDate;
	}

	public void setExpireDate(LocalDateTime expireDate) {
		this.expireDate = expireDate;
	}

	public boolean isActive() {
		return isActive;
	}

	public void setActive(boolean active) {
		isActive = active;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Integer getPromotionId() {
		return promotionId;
	}

	public void setPromotionId(Integer promotionId) {
		this.promotionId = promotionId;
	}

	public String getPromotionName() {
		return promotionName;
	}

	public void setPromotionName(String promotionName) {
		this.promotionName = promotionName;
	}

	public BigDecimal getDiscountValue() {
		return discountValue;
	}

	public void setDiscountValue(BigDecimal discountValue) {
		this.discountValue = discountValue;
	}

	public List<Integer> getAllowedCategoryIds() {
		return allowedCategoryIds;
	}

	public void setAllowedCategoryIds(List<Integer> allowedCategoryIds) {
		this.allowedCategoryIds = allowedCategoryIds;
	}

	public List<CouponCategorySummary> getAllowedCategories() {
		return allowedCategories;
	}

	public void setAllowedCategories(List<CouponCategorySummary> allowedCategories) {
		this.allowedCategories = allowedCategories;
	}

	public List<Integer> getUsedOrderIds() {
		return usedOrderIds;
	}

	public void setUsedOrderIds(List<Integer> usedOrderIds) {
		this.usedOrderIds = usedOrderIds;
	}
}

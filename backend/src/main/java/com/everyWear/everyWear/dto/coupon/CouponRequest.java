package com.everyWear.everyWear.dto.coupon;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CouponRequest {

	@NotNull(message = "promotionId is required")
	private Integer promotionId;

	@NotBlank(message = "code is required")
	@Size(max = 50, message = "code must not exceed 50 characters")
	private String code;

	@NotNull(message = "expireDate is required")
	@Future(message = "expireDate must be in the future")
	private LocalDateTime expireDate;

	@NotNull(message = "isActive is required")
	private Boolean isActive;

	public Integer getPromotionId() {
		return promotionId;
	}

	public void setPromotionId(Integer promotionId) {
		this.promotionId = promotionId;
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

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}
}

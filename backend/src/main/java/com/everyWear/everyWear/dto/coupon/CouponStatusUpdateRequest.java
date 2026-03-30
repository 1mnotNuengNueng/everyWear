package com.everyWear.everyWear.dto.coupon;

import jakarta.validation.constraints.NotNull;

public class CouponStatusUpdateRequest {

	@NotNull(message = "isActive is required")
	private Boolean isActive;

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}
}

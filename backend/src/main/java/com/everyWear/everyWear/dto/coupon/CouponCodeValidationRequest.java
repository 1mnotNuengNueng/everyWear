package com.everyWear.everyWear.dto.coupon;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CouponCodeValidationRequest {

	@NotBlank(message = "code is required")
	@Size(max = 50, message = "code must not exceed 50 characters")
	private String code;

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}
}

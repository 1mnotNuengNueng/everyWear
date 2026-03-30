package com.everyWear.everyWear.dto.coupon;

import java.util.ArrayList;
import java.util.List;

public class CouponValidationResponse {

	private CouponResponse coupon;
	private List<CouponCategoryResponse> categories = new ArrayList<>();

	public CouponResponse getCoupon() {
		return coupon;
	}

	public void setCoupon(CouponResponse coupon) {
		this.coupon = coupon;
	}

	public List<CouponCategoryResponse> getCategories() {
		return categories;
	}

	public void setCategories(List<CouponCategoryResponse> categories) {
		this.categories = categories;
	}
}

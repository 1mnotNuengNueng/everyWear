package com.everyWear.everyWear.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.everyWear.everyWear.dto.coupon.CouponRequest;
import com.everyWear.everyWear.dto.coupon.CouponResponse;
import com.everyWear.everyWear.service.CouponService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/coupons")
public class CouponController {

	private final CouponService couponService;

	public CouponController(CouponService couponService) {
		this.couponService = couponService;
	}

	@PostMapping
	public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(couponService.createCoupon(request));
	}

	@GetMapping
	public ResponseEntity<List<CouponResponse>> getAllCoupons() {
		return ResponseEntity.ok(couponService.getAllCoupons());
	}

	@GetMapping("/{id}")
	public ResponseEntity<CouponResponse> getCouponById(@PathVariable Integer id) {
		return ResponseEntity.ok(couponService.getCouponById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<CouponResponse> updateCoupon(@PathVariable Integer id, @Valid @RequestBody CouponRequest request) {
		return ResponseEntity.ok(couponService.updateCoupon(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCoupon(@PathVariable Integer id) {
		couponService.deleteCoupon(id);
		return ResponseEntity.noContent().build();
	}
}

package com.everyWear.everyWear.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.everyWear.everyWear.dto.coupon.CouponRequest;
import com.everyWear.everyWear.dto.coupon.CouponResponse;
import com.everyWear.everyWear.dto.coupon.CouponCodeValidationRequest;
import com.everyWear.everyWear.dto.coupon.CouponStatusUpdateRequest;
import com.everyWear.everyWear.dto.coupon.CouponValidationResponse;
import com.everyWear.everyWear.service.CouponService;

import jakarta.validation.Valid;

/**
 * NOTE: Friend-owned area (Coupons API) — waiting to be extended/maintained by the teammate responsible for Coupons.
 *
 * Endpoints:
 * - POST /api/coupons : create coupon
 * - GET /api/coupons : list coupons
 * - GET /api/coupons/{id} : get coupon by id
 * - PUT /api/coupons/{id} : update coupon
 * - DELETE /api/coupons/{id} : delete coupon
 */

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

	@GetMapping("/code/{code}")
	public ResponseEntity<CouponResponse> getCouponByCode(@PathVariable String code) {
		return ResponseEntity.ok(couponService.getCouponByCode(code));
	}

	@PostMapping("/validate")
	public ResponseEntity<CouponValidationResponse> validateCouponCode(
			@Valid @RequestBody CouponCodeValidationRequest request) {
		return ResponseEntity.ok(couponService.validateCouponCode(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<CouponResponse> updateCoupon(@PathVariable Integer id, @Valid @RequestBody CouponRequest request) {
		return ResponseEntity.ok(couponService.updateCoupon(id, request));
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<CouponResponse> updateCouponStatus(
			@PathVariable Integer id,
			@Valid @RequestBody CouponStatusUpdateRequest request) {
		return ResponseEntity.ok(couponService.updateCouponStatus(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCoupon(@PathVariable Integer id) {
		couponService.deleteCoupon(id);
		return ResponseEntity.noContent().build();
	}


	@PostMapping("/partner")
	public ResponseEntity<CouponResponse> createPartnerCoupon() {
		return ResponseEntity.status(HttpStatus.CREATED).body(couponService.createPartnerCoupon());
	}

	@GetMapping("/promotions/{id}")
	public ResponseEntity<List<CouponResponse>> getAllCouponsByPromotionId(@PathVariable Integer id) {
		return ResponseEntity.ok(couponService.getAllCouponsByPromotionId(id));
	}

}

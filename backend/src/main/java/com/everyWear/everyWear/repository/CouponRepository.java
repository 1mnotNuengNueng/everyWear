package com.everyWear.everyWear.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.everyWear.everyWear.model.Coupon;

public interface CouponRepository extends JpaRepository<Coupon, Integer> {

	Optional<Coupon> findByCode(String code);

	boolean existsByCode(String code);

	boolean existsByCodeAndIdNot(String code, Integer id);
}

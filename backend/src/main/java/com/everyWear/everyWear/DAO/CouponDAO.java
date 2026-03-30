package com.everyWear.everyWear.DAO;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.everyWear.everyWear.model.Coupon;

public interface CouponDAO extends JpaRepository<Coupon, Integer> {

	Optional<Coupon> findByCode(String code);

	// เพิ่มบรรทัดนี้ลงไปใน CouponDAO
    List<Coupon> findByPromotion_Id(Integer promotionId);

	boolean existsByCode(String code);

	boolean existsByCodeAndIdNot(String code, Integer id);
}

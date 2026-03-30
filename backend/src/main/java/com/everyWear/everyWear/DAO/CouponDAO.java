package com.everyWear.everyWear.DAO;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.everyWear.everyWear.model.Coupon;

public interface CouponDAO extends JpaRepository<Coupon, Integer> {

	Optional<Coupon> findByCode(String code);

	@Query("""
			select distinct c
			from Coupon c
			join fetch c.promotion p
			left join fetch p.promotionCategories pc
			left join fetch pc.category
			where upper(c.code) = upper(:code)
			""")
	Optional<Coupon> findDetailedByCode(@Param("code") String code);

	@Query("""
			select distinct c
			from Coupon c
			join fetch c.promotion p
			left join fetch p.promotionCategories pc
			left join fetch pc.category
			where c.id = :id
			""")
	Optional<Coupon> findDetailedById(@Param("id") Integer id);

	@Query("""
			select distinct c
			from Coupon c
			join fetch c.promotion p
			left join fetch p.promotionCategories pc
			left join fetch pc.category
			""")
	List<Coupon> findAllWithPromotionCategories();

	@Query("""
			select distinct c
			from Coupon c
			join fetch c.promotion p
			left join fetch p.promotionCategories pc
			left join fetch pc.category
			where p.id = :promotionId
			""")
	List<Coupon> findDetailedByPromotionId(@Param("promotionId") Integer promotionId);

	boolean existsByCode(String code);

	boolean existsByCodeAndIdNot(String code, Integer id);
}

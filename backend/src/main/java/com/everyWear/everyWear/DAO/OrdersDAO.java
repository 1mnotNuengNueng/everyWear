package com.everyWear.everyWear.DAO;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.everyWear.everyWear.model.Orders;

public interface OrdersDAO extends JpaRepository<Orders, Integer> {

	@Query("""
			select distinct o
			from Orders o
			left join fetch o.orderDetails od
			left join fetch od.item i
			where o.id = :id
			""")
	Optional<Orders> findByIdWithDetails(@Param("id") Integer id);

	@Query("""
			select o
			from Orders o
			order by o.createdAt desc
			""")
	List<Orders> findAllOrderByCreatedAtDesc();
}


package com.everyWear.everyWear.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import com.everyWear.everyWear.model.OrderDetail;

public interface OrderDetailDAO extends JpaRepository<OrderDetail, Integer> {
}


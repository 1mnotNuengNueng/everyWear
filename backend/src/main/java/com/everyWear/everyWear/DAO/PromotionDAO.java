package com.everyWear.everyWear.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import com.everyWear.everyWear.model.Promotion;

public interface PromotionDAO extends JpaRepository<Promotion, Integer> {
}

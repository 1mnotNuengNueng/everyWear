package com.everyWear.everyWear.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.everyWear.everyWear.model.Promotion;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
}

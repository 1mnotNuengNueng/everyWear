package com.everyWear.everyWear.DAO;

import org.springframework.data.jpa.repository.JpaRepository;

import com.everyWear.everyWear.model.Category;

public interface CategoryDAO extends JpaRepository<Category, Integer> {

    boolean existsByName(String name);
}
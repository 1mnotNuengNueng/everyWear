package com.everyWear.everyWear.DAO;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.everyWear.everyWear.model.Item;

public interface ItemDAO extends JpaRepository<Item, Integer> {

    List<Item> findByIsActiveTrue();

    boolean existsByName(String name);

    List<Item> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    List<Item> findByCategory_IdAndIsActiveTrue(Integer categoryId);
}
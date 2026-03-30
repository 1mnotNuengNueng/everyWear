package com.everyWear.everyWear.controller;

import com.everyWear.everyWear.dto.promotion.PromotionCategoryRequest;
import com.everyWear.everyWear.dto.promotion.PromotionCategoryResponse;
import com.everyWear.everyWear.service.PromotionCategoryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotion-categories")
public class PromotionCategoryController {

    private final PromotionCategoryService promotionCategoryService;

    public PromotionCategoryController(PromotionCategoryService promotionCategoryService) {
        this.promotionCategoryService = promotionCategoryService;
    }

    @PostMapping
    public ResponseEntity<String> addCategoryToPromotion(@RequestBody PromotionCategoryRequest request) {
        promotionCategoryService.addCategoryToPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("เพิ่มหมวดหมู่เข้าโปรโมชั่นสำเร็จ");
    }

    @GetMapping("/promotion/{promotionId}")
    public ResponseEntity<List<PromotionCategoryResponse>> getCategoriesByPromotionId(@PathVariable int promotionId) {
        return ResponseEntity.ok(promotionCategoryService.getCategoriesByPromotionId(promotionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeCategoryFromPromotion(@PathVariable int id) {
        promotionCategoryService.removeCategoryFromPromotion(id);
        return ResponseEntity.ok("ถอดหมวดหมู่ออกจากโปรโมชั่นสำเร็จ");
    }
}
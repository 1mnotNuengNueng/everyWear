package com.everyWear.everyWear.controller;

import com.everyWear.everyWear.dto.promotion.PromotionRequest;
import com.everyWear.everyWear.dto.promotion.PromotionResponse;
import com.everyWear.everyWear.service.PromotionService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService; 
    }

    @PostMapping
    public ResponseEntity<String> createPromotion(@RequestBody PromotionRequest request) { 
        promotionService.createPromotion(request); 
        return ResponseEntity.status(HttpStatus.CREATED).body("เพิ่มโปรโมชั่นสำเร็จ"); 
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionResponse> getPromotion(@PathVariable int id) {
        return ResponseEntity.ok(promotionService.getPromotionById(id));
    }

    @GetMapping
    public ResponseEntity<List<PromotionResponse>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    // ใช้ @PatchMapping อย่างเดียวเลยครับ
    @PatchMapping("/{id}")
    public ResponseEntity<String> updatePromotion(@PathVariable int id, @RequestBody PromotionRequest request) {
        promotionService.updatePromotionPartial(id, request);
        return ResponseEntity.ok("อัปเดตโปรโมชั่นสำเร็จ");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePromotion(@PathVariable int id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok("ลบโปรโมชั่นสำเร็จ");
    }
}
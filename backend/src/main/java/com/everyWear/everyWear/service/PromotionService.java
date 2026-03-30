package com.everyWear.everyWear.service;

import com.everyWear.everyWear.DAO.PromotionCategoryDAO;
import com.everyWear.everyWear.DAO.PromotionDAO;
import com.everyWear.everyWear.dto.promotion.PromotionRequest;
import com.everyWear.everyWear.dto.promotion.PromotionResponse;
import com.everyWear.everyWear.exception.BadRequestException;
import com.everyWear.everyWear.exception.ResourceNotFoundException;
import com.everyWear.everyWear.model.Category;
import com.everyWear.everyWear.model.Promotion;
import com.everyWear.everyWear.model.PromotionCategory;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PromotionService {

    private final PromotionDAO promotionDAO;
    private final PromotionCategoryDAO promotionCategoryDAO; // เพิ่ม DAO นี้เข้ามา

    @PersistenceContext
    private EntityManager entityManager;

    public PromotionService(PromotionDAO promotionDAO, PromotionCategoryDAO promotionCategoryDAO) {
        this.promotionDAO = promotionDAO;
        this.promotionCategoryDAO = promotionCategoryDAO;
    }

    public Integer createPromotion(PromotionRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("กรุณาระบุชื่อโปรโมชั่น");
        }
        if (request.getDiscountValue() == null) {
            throw new BadRequestException("กรุณาระบุมูลค่าส่วนลด");
        }

        Integer promoId = promotionDAO.createPromotion(request);
        if (promoId == null) {
            throw new RuntimeException("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
        return promoId;
    }

    public PromotionResponse getPromotionById(int id) {
        Promotion promotion = promotionDAO.getPromotionById(id);
        if (promotion == null) {
            throw new ResourceNotFoundException("ไม่พบโปรโมชั่นหมายเลข: " + id);
        }
        return mapToResponse(promotion);
    }

    public List<PromotionResponse> getAllPromotions() {
        return promotionDAO.getAllPromotions().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public void updatePromotionPartial(int id, PromotionRequest request) {
        if (request.getName() != null && request.getName().trim().isEmpty()) {
            throw new BadRequestException("ชื่อโปรโมชั่นต้องไม่เป็นค่าว่าง");
        }

        // 1. อัปเดตข้อมูลทั่วไปของโปรโมชั่น
        boolean isUpdated = promotionDAO.updatePromotionPartial(id, request);
        if (!isUpdated) {
            throw new ResourceNotFoundException("ไม่พบโปรโมชั่นหมายเลข " + id + " ให้แก้ไข");
        }

        // 2. จัดการอัปเดตหมวดหมู่ที่เข้าร่วม (ตารางเชื่อม promotion_category)
        if (request.getCategoryIds() != null) {
            Promotion promotion = entityManager.find(Promotion.class, id);
            
            // 2.1 ดึงรายการจับคู่เก่าออกมาลบทิ้งให้หมด
            List<PromotionCategory> oldLinks = promotionCategoryDAO.getByPromotionId(id);
            for (PromotionCategory oldLink : oldLinks) {
                promotionCategoryDAO.deletePromotionCategory(oldLink);
            }

            // 2.2 วนลูปสร้างการจับคู่ใหม่เข้าไป
            for (Integer categoryId : request.getCategoryIds()) {
                Category category = entityManager.find(Category.class, categoryId);
                if (category != null) {
                    PromotionCategory newLink = new PromotionCategory();
                    newLink.setPromotion(promotion);
                    newLink.setCategory(category);
                    promotionCategoryDAO.addPromotionCategory(newLink);
                }
            }
        }
    }

    public void deletePromotion(int id) {
        // เมื่อลบโปรโมชั่น ควรกำจัดข้อมูลในตารางเชื่อมทิ้งก่อนด้วยเพื่อป้องกัน Foreign Key Error
        List<PromotionCategory> links = promotionCategoryDAO.getByPromotionId(id);
        for (PromotionCategory link : links) {
            promotionCategoryDAO.deletePromotionCategory(link);
        }

        boolean isDeleted = promotionDAO.deletePromotion(id);
        if (!isDeleted) {
            throw new ResourceNotFoundException("ไม่พบโปรโมชั่นหมายเลข " + id + " ให้ลบ");
        }
    }

    // Helper: แปลง Entity -> DTO
    private PromotionResponse mapToResponse(Promotion promotion) {
        PromotionResponse response = new PromotionResponse();
        response.setId(promotion.getId());
        response.setName(promotion.getName());
        response.setDescription(promotion.getDescription());
        response.setDiscountValue(promotion.getDiscountValue());
        response.setActive(promotion.isIsActive());

        if (promotion.getStartAt() != null) response.setStartAt(promotion.getStartAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        if (promotion.getEndAt() != null) response.setEndAt(promotion.getEndAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        if (promotion.getCreatedAt() != null) response.setCreatedAt(promotion.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());

        if (promotion.getPromotionCategories() != null) {
            response.setCategoryIds(promotion.getPromotionCategories().stream().map(pc -> pc.getCategory().getId()).collect(Collectors.toList()));
        }
        return response;
    }
}
package com.everyWear.everyWear.service;

import com.everyWear.everyWear.DAO.PromotionDAO;
import com.everyWear.everyWear.dto.promotion.PromotionRequest;
import com.everyWear.everyWear.dto.promotion.PromotionResponse;
import com.everyWear.everyWear.exception.BadRequestException;
import com.everyWear.everyWear.exception.ResourceNotFoundException;
import com.everyWear.everyWear.model.Promotion;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PromotionService {

    private final PromotionDAO promotionDAO;

    public PromotionService(PromotionDAO promotionDAO) {
        this.promotionDAO = promotionDAO;
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

    // มีแค่ PATCH ตามที่ขอครับ
    public void updatePromotionPartial(int id, PromotionRequest request) {
        if (request.getName() != null && request.getName().trim().isEmpty()) {
            throw new BadRequestException("ชื่อโปรโมชั่นต้องไม่เป็นค่าว่าง");
        }
        boolean isUpdated = promotionDAO.updatePromotionPartial(id, request);
        if (!isUpdated) {
            throw new ResourceNotFoundException("ไม่พบโปรโมชั่นหมายเลข " + id + " ให้แก้ไข");
        }
    }

    public void deletePromotion(int id) {
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
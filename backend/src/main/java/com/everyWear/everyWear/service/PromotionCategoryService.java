package com.everyWear.everyWear.service;

import com.everyWear.everyWear.DAO.PromotionCategoryDAO;
import com.everyWear.everyWear.dto.promotion.PromotionCategoryRequest;
import com.everyWear.everyWear.dto.promotion.PromotionCategoryResponse;
import com.everyWear.everyWear.exception.BadRequestException;
import com.everyWear.everyWear.exception.ResourceNotFoundException;
import com.everyWear.everyWear.model.Category;
import com.everyWear.everyWear.model.Promotion;
import com.everyWear.everyWear.model.PromotionCategory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PromotionCategoryService {

    private final PromotionCategoryDAO promotionCategoryDAO;

    @PersistenceContext
    private EntityManager entityManager;

    public PromotionCategoryService(PromotionCategoryDAO promotionCategoryDAO) {
        this.promotionCategoryDAO = promotionCategoryDAO;
    }

    public void addCategoryToPromotion(PromotionCategoryRequest request) {
        if (request.getPromotionId() == null || request.getCategoryId() == null) {
            throw new BadRequestException("กรุณาระบุ Promotion ID และ Category ID");
        }

        Promotion promotion = entityManager.find(Promotion.class, request.getPromotionId());
        Category category = entityManager.find(Category.class, request.getCategoryId());

        if (promotion == null) throw new ResourceNotFoundException("ไม่พบโปรโมชั่นหมายเลข: " + request.getPromotionId());
        if (category == null) throw new ResourceNotFoundException("ไม่พบหมวดหมู่หมายเลข: " + request.getCategoryId());

        PromotionCategory promoCat = new PromotionCategory();
        promoCat.setPromotion(promotion);
        promoCat.setCategory(category);
        promotionCategoryDAO.addPromotionCategory(promoCat);
    }

    public List<PromotionCategoryResponse> getCategoriesByPromotionId(int promotionId) {
        List<PromotionCategory> promoCats = promotionCategoryDAO.getByPromotionId(promotionId);
        return promoCats.stream().map(pc -> {
            PromotionCategoryResponse response = new PromotionCategoryResponse();
            response.setId(pc.getId());
            if (pc.getPromotion() != null) {
                response.setPromotionId(pc.getPromotion().getId());
                response.setPromotionName(pc.getPromotion().getName());
            }
            if (pc.getCategory() != null) {
                response.setCategoryId(pc.getCategory().getId());
                response.setCategoryName(pc.getCategory().getName());
            }
            return response;
        }).collect(Collectors.toList());
    }

    public void removeCategoryFromPromotion(int id) {
        PromotionCategory promoCat = promotionCategoryDAO.getById(id);
        if (promoCat == null) throw new ResourceNotFoundException("ไม่พบรายการจับคู่หมายเลข: " + id);
        promotionCategoryDAO.deletePromotionCategory(promoCat);
    }
}
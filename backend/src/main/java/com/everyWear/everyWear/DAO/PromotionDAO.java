package com.everyWear.everyWear.DAO;

import com.everyWear.everyWear.model.Category;
import com.everyWear.everyWear.model.Promotion;
import com.everyWear.everyWear.model.PromotionCategory;
import com.everyWear.everyWear.dto.promotion.PromotionRequest;

import org.springframework.stereotype.Repository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class PromotionDAO {

    @PersistenceContext
    private EntityManager entityManager;

    public Integer createPromotion(PromotionRequest request) {
        Promotion promotion = new Promotion();
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setStartAt(Timestamp.valueOf(request.getStartAt()));
        promotion.setEndAt(Timestamp.valueOf(request.getEndAt()));
        promotion.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        promotion.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        entityManager.persist(promotion);
        entityManager.flush();

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            for (Integer catId : request.getCategoryIds()) {
                Category category = entityManager.find(Category.class, catId);
                if (category != null) {
                    PromotionCategory promoCat = new PromotionCategory();
                    promoCat.setPromotion(promotion);
                    promoCat.setCategory(category);
                    entityManager.persist(promoCat);
                }
            }
        }
        return promotion.getId();
    }

    public Promotion getPromotionById(int id) {
        String hql = "SELECT DISTINCT p FROM Promotion p " +
                     "LEFT JOIN FETCH p.promotionCategories pc " +
                     "LEFT JOIN FETCH pc.category " +
                     "WHERE p.id = :id";
        try {
            return entityManager.createQuery(hql, Promotion.class).setParameter("id", id).getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    public List<Promotion> getAllPromotions() {
        String hql = "SELECT p FROM Promotion p ORDER BY p.id ASC";
        return entityManager.createQuery(hql, Promotion.class).getResultList();
    }

    // PATCH Update: อัปเดตเฉพาะค่าที่ไม่ใช่ null
    public boolean updatePromotionPartial(int id, PromotionRequest request) {
        Promotion promotion = entityManager.find(Promotion.class, id);
        if (promotion == null) return false;

        if (request.getName() != null) promotion.setName(request.getName());
        if (request.getDescription() != null) promotion.setDescription(request.getDescription());
        if (request.getDiscountValue() != null) promotion.setDiscountValue(request.getDiscountValue());
        if (request.getStartAt() != null) promotion.setStartAt(Timestamp.valueOf(request.getStartAt()));
        if (request.getEndAt() != null) promotion.setEndAt(Timestamp.valueOf(request.getEndAt()));
        if (request.getIsActive() != null) promotion.setIsActive(request.getIsActive());
        
        entityManager.merge(promotion);

        // จัดการ Category เฉพาะตอนที่มีการส่ง array มา
        if (request.getCategoryIds() != null) {
            String deleteHql = "DELETE FROM PromotionCategory pc WHERE pc.promotion.id = :promoId";
            entityManager.createQuery(deleteHql).setParameter("promoId", id).executeUpdate();

            if (!request.getCategoryIds().isEmpty()) {
                for (Integer catId : request.getCategoryIds()) {
                    Category category = entityManager.find(Category.class, catId);
                    if (category != null) {
                        PromotionCategory promoCat = new PromotionCategory();
                        promoCat.setPromotion(promotion);
                        promoCat.setCategory(category);
                        entityManager.persist(promoCat);
                    }
                }
            }
        }
        return true;
    }

    public boolean deletePromotion(int id) {
        Promotion promotion = entityManager.find(Promotion.class, id);
        if (promotion != null) {
            String deleteHql = "DELETE FROM PromotionCategory pc WHERE pc.promotion.id = :promoId";
            entityManager.createQuery(deleteHql).setParameter("promoId", id).executeUpdate();
            entityManager.remove(promotion);
            return true;
        }
        return false;
    }
}
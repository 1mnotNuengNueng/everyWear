package com.everyWear.everyWear.DAO;

import com.everyWear.everyWear.model.PromotionCategory;
import org.springframework.stereotype.Repository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Repository
public class PromotionCategoryDAO {

    @PersistenceContext
    private EntityManager entityManager;

    public void addPromotionCategory(PromotionCategory promotionCategory) {
        entityManager.persist(promotionCategory);
    }

    public List<PromotionCategory> getByPromotionId(int promotionId) {
        String hql = "SELECT pc FROM PromotionCategory pc JOIN FETCH pc.category WHERE pc.promotion.id = :promoId";
        return entityManager.createQuery(hql, PromotionCategory.class).setParameter("promoId", promotionId).getResultList();
    }

    public PromotionCategory getById(int id) {
        return entityManager.find(PromotionCategory.class, id);
    }

    public void deletePromotionCategory(PromotionCategory promotionCategory) {
        entityManager.remove(promotionCategory);
    }
}
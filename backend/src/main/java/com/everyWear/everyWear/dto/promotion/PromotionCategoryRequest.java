package com.everyWear.everyWear.dto.promotion;

public class PromotionCategoryRequest {
    private Integer promotionId;
    private Integer categoryId;

    public Integer getPromotionId() { return promotionId; }
    public void setPromotionId(Integer promotionId) { this.promotionId = promotionId; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
}
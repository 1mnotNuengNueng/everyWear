package com.everyWear.everyWear.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "promotion_category")
public class PromotionCategory implements java.io.Serializable {

    private Integer id;
    private Category category;
    private Promotion promotion;

    public PromotionCategory() {}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer getId() { return this.id; }
    public void setId(Integer id) { this.id = id; }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    public Category getCategory() { return this.category; }
    public void setCategory(Category category) { this.category = category; }

    @JsonIgnore 
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "promotion_id", nullable = false)
    public Promotion getPromotion() { return this.promotion; }
    public void setPromotion(Promotion promotion) { this.promotion = promotion; }
}
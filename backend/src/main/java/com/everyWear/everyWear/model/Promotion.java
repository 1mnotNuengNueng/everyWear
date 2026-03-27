package com.everyWear.everyWear.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;

@Entity
@Table(name = "promotion")
public class Promotion implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "description")
	private String description;

	@Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
	private BigDecimal discountValue;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "start_at", nullable = false)
	private Date startAt;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "end_at", nullable = false)
	private Date endAt;

	@Column(name = "is_active", nullable = false)
	private boolean isActive;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "created_at", nullable = false)
	private Date createdAt;

	@Transient
	private Set<?> coupons = new HashSet<>(0);

	@Transient
	private Set<?> promotionCategories = new HashSet<>(0);

	public Promotion() {
	}

	public Promotion(String name, BigDecimal discountValue, Date startAt, Date endAt, boolean isActive,
			Date createdAt) {
		this.name = name;
		this.discountValue = discountValue;
		this.startAt = startAt;
		this.endAt = endAt;
		this.isActive = isActive;
		this.createdAt = createdAt;
	}

	public Promotion(String name, String description, BigDecimal discountValue, Date startAt, Date endAt,
			boolean isActive, Date createdAt, Set<?> coupons, Set<?> promotionCategories) {
		this.name = name;
		this.description = description;
		this.discountValue = discountValue;
		this.startAt = startAt;
		this.endAt = endAt;
		this.isActive = isActive;
		this.createdAt = createdAt;
		this.coupons = coupons;
		this.promotionCategories = promotionCategories;
	}

	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BigDecimal getDiscountValue() {
		return this.discountValue;
	}

	public void setDiscountValue(BigDecimal discountValue) {
		this.discountValue = discountValue;
	}

	public Date getStartAt() {
		return this.startAt;
	}

	public void setStartAt(Date startAt) {
		this.startAt = startAt;
	}

	public Date getEndAt() {
		return this.endAt;
	}

	public void setEndAt(Date endAt) {
		this.endAt = endAt;
	}

	public boolean isIsActive() {
		return this.isActive;
	}

	public void setIsActive(boolean isActive) {
		this.isActive = isActive;
	}

	public Date getCreatedAt() {
		return this.createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public Set<?> getCoupons() {
		return this.coupons;
	}

	public void setCoupons(Set<?> coupons) {
		this.coupons = coupons;
	}

	public Set<?> getPromotionCategories() {
		return this.promotionCategories;
	}

	public void setPromotionCategories(Set<?> promotionCategories) {
		this.promotionCategories = promotionCategories;
	}
}

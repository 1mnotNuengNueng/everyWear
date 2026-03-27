package com.everyWear.everyWear.model;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;

@Entity
@Table(name = "coupon")
public class Coupon implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "promotion_id", nullable = false)
	private Promotion promotion;

	@Column(name = "code", nullable = false, unique = true, length = 50)
	private String code;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "expire_date", nullable = false)
	private Date expireDate;

	@Column(name = "is_active", nullable = false)
	private boolean isActive;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "created_at", nullable = false)
	private Date createdAt;

	@Transient
	private Set<?> orderses = new HashSet<>(0);

	public Coupon() {
	}

	public Coupon(Promotion promotion, String code, Date expireDate, boolean isActive, Date createdAt) {
		this.promotion = promotion;
		this.code = code;
		this.expireDate = expireDate;
		this.isActive = isActive;
		this.createdAt = createdAt;
	}

	public Coupon(Promotion promotion, String code, Date expireDate, boolean isActive, Date createdAt, Set<?> orderses) {
		this.promotion = promotion;
		this.code = code;
		this.expireDate = expireDate;
		this.isActive = isActive;
		this.createdAt = createdAt;
		this.orderses = orderses;
	}

	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Promotion getPromotion() {
		return this.promotion;
	}

	public void setPromotion(Promotion promotion) {
		this.promotion = promotion;
	}

	public String getCode() {
		return this.code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public Date getExpireDate() {
		return this.expireDate;
	}

	public void setExpireDate(Date expireDate) {
		this.expireDate = expireDate;
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

	public Set<?> getOrderses() {
		return this.orderses;
	}

	public void setOrderses(Set<?> orderses) {
		this.orderses = orderses;
	}
}

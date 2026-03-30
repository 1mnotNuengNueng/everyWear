package com.everyWear.everyWear.model;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;

@Entity
@Table(name = "item")
public class Item implements java.io.Serializable {

	private Integer id;
	private Category category;
	private String name;
	private String description;
	private BigDecimal price;
	private boolean isActive;
	private Date createdAt;
	private Date updatedAt;

	// ❗ ใส่ Generic กัน warning
	private Set<Object> orderDetails = new HashSet<>();
	private Set<Object> stocks = new HashSet<>();

	public Item() {}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id")
	public Category getCategory() {
		return this.category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	@Column(name = "name", nullable = false)
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "description", columnDefinition = "TEXT")
	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Column(name = "price", nullable = false, precision = 10, scale = 2)
	public BigDecimal getPrice() {
		return this.price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	@Column(name = "is_active", nullable = false)
	public boolean isIsActive() {
		return this.isActive;
	}

	public void setIsActive(boolean isActive) {
		this.isActive = isActive;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "created_at", nullable = false)
	public Date getCreatedAt() {
		return this.createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "updated_at", nullable = false)
	public Date getUpdatedAt() {
		return this.updatedAt;
	}

	public void setUpdatedAt(Date updatedAt) {
		this.updatedAt = updatedAt;
	}

	@Transient
	public Set<Object> getOrderDetails() {
		return this.orderDetails;
	}

	public void setOrderDetails(Set<Object> orderDetails) {
		this.orderDetails = orderDetails;
	}

	@Transient
	public Set<Object> getStocks() {
		return this.stocks;
	}

	public void setStocks(Set<Object> stocks) {
		this.stocks = stocks;
	}

	// ✅ FIX INSERT
	@PrePersist
	protected void onCreate() {
		Date now = new Date();

		if (this.createdAt == null) {
			this.createdAt = now;
		}

		if (this.updatedAt == null) {
			this.updatedAt = now;
		}
	}

	// ✅ FIX UPDATE
	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = new Date();
	}
}
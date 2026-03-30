package com.everyWear.everyWear.model;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;

@Entity
@Table(name = "category")
public class Category implements java.io.Serializable {

	private Integer id;
	private String name;
	private String description;
	private Date createdAt;

	// ❗ ใส่ Generic กัน warning
	private Set<Object> items = new HashSet<>();
	private Set<Object> promotionCategories = new HashSet<>();

	public Category() {}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	@Column(name = "name", length = 100, nullable = false)
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "description")
	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "created_at", nullable = false)
	public Date getCreatedAt() {
		return this.createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	@Transient
	public Set<Object> getItems() {
		return this.items;
	}

	public void setItems(Set<Object> items) {
		this.items = items;
	}

	@Transient
	public Set<Object> getPromotionCategories() {
		return this.promotionCategories;
	}

	public void setPromotionCategories(Set<Object> promotionCategories) {
		this.promotionCategories = promotionCategories;
	}

	// ✅ สำคัญ (แก้ bug insert ไม่เข้า DB)
	@PrePersist
	protected void onCreate() {
		if (this.createdAt == null) {
			this.createdAt = new Date();
		}
	}
}
package com.everyWear.everyWear.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class OrderStatusConverter implements AttributeConverter<OrderStatus, String> {

	@Override
	public String convertToDatabaseColumn(OrderStatus attribute) {
		return (attribute == null ? OrderStatus.ACTIVE : attribute).name();
	}

	@Override
	public OrderStatus convertToEntityAttribute(String dbData) {
		if (dbData == null || dbData.isBlank()) {
			return OrderStatus.ACTIVE;
		}
		try {
			return OrderStatus.valueOf(dbData.trim().toUpperCase());
		} catch (IllegalArgumentException ex) {
			return OrderStatus.ACTIVE;
		}
	}
}


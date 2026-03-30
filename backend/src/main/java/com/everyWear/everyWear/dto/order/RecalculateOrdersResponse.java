package com.everyWear.everyWear.dto.order;

public class RecalculateOrdersResponse {

	private int updatedCount;

	public RecalculateOrdersResponse() {
	}

	public RecalculateOrdersResponse(int updatedCount) {
		this.updatedCount = updatedCount;
	}

	public int getUpdatedCount() {
		return updatedCount;
	}

	public void setUpdatedCount(int updatedCount) {
		this.updatedCount = updatedCount;
	}
}


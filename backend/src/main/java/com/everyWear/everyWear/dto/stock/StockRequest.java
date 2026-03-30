package com.everyWear.everyWear.dto.stock;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StockRequest {

    @NotNull
    private Integer itemId;

    @NotBlank
    @Size(max = 10)
    private String size;

    @Min(0)
    @NotNull
    private Integer quantity;

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
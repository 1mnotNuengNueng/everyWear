package com.everyWear.everyWear.dto.stock;

import java.util.Date;

public class StockResponse {

    private Integer id;
    private String size;
    private Integer itemId;
    private String itemName;
    private Integer quantity;
    private Date updatedAt;

    public StockResponse() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
package com.everyWear.everyWear.service;

import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.everyWear.everyWear.DAO.ItemDAO;
import com.everyWear.everyWear.DAO.StockDAO;
import com.everyWear.everyWear.dto.stock.StockRequest;
import com.everyWear.everyWear.dto.stock.StockResponse;
import com.everyWear.everyWear.exception.BadRequestException;
import com.everyWear.everyWear.exception.ResourceNotFoundException;
import com.everyWear.everyWear.model.Item;
import com.everyWear.everyWear.model.Stock;

@Service
@Transactional
public class StockService {

    private final StockDAO stockDAO;
    private final ItemDAO itemDAO;

    public StockService(StockDAO stockDAO, ItemDAO itemDAO) {
        this.stockDAO = stockDAO;
        this.itemDAO = itemDAO;
    }

    private StockResponse toResponse(Stock s) {
        StockResponse res = new StockResponse();
        res.setId(s.getId());
        res.setSize(s.getSize());
        res.setItemId(s.getItem() == null ? null : s.getItem().getId());
        res.setItemName(s.getItem() == null ? null : s.getItem().getName());
        res.setQuantity(s.getQuantity());
        res.setUpdatedAt(s.getUpdatedAt());
        return res;
    }

    @Transactional(readOnly = true)
    public List<StockResponse> getAllStock() {
        return stockDAO.findAllWithItem()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StockResponse getStockById(Integer id) {
        Stock stock = stockDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock with id " + id + " was not found"));
        return toResponse(stock);
    }

    @Transactional(readOnly = true)
    public List<StockResponse> getStockByItemId(Integer itemId) {
        return stockDAO.findByItemId(itemId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public StockResponse createStock(StockRequest req) {
    Item item = itemDAO.findById(req.getItemId())
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Item with id " + req.getItemId() + " was not found"));

    // ถ้ามีอยู่แล้ว ให้บวกจำนวนเพิ่ม
    var existing = stockDAO.findByItemIdAndSize(req.getItemId(), req.getSize());
    if (existing.isPresent()) {
        Stock stock = existing.get();
        stock.setQuantity(stock.getQuantity() + req.getQuantity());
        stock.setUpdatedAt(new Date());
        return toResponse(stockDAO.save(stock));
    }

    // ยังไม่มี ให้สร้างใหม่
    Stock stock = new Stock();
    stock.setItem(item);
    stock.setSize(req.getSize());
    stock.setQuantity(req.getQuantity());
    stock.setUpdatedAt(new Date());

    return toResponse(stockDAO.save(stock));
}

    public StockResponse updateStock(Integer id, StockRequest req) {
        Stock stock = stockDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Stock with id " + id + " was not found"));

        if (req.getQuantity() != null) stock.setQuantity(req.getQuantity());
        if (req.getSize() != null)     stock.setSize(req.getSize());
        stock.setUpdatedAt(new Date());

        return toResponse(stockDAO.save(stock));
    }

    public void deleteStock(Integer id) {
        if (!stockDAO.existsById(id)) {
            throw new ResourceNotFoundException("Stock with id " + id + " was not found");
        }
        stockDAO.deleteById(id);
    }
}
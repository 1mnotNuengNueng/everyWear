package com.everyWear.everyWear.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.everyWear.everyWear.dto.stock.StockRequest;
import com.everyWear.everyWear.dto.stock.StockResponse;
import com.everyWear.everyWear.service.StockService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    // GET /api/stock
    @GetMapping
    public ResponseEntity<List<StockResponse>> getAllStock() {
        return ResponseEntity.ok(stockService.getAllStock());
    }

    // GET /api/stock/{id}
    @GetMapping("/{id}")
    public ResponseEntity<StockResponse> getStockById(@PathVariable Integer id) {
        return ResponseEntity.ok(stockService.getStockById(id));
    }

    // GET /api/stock/item/{itemId}
    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<StockResponse>> getStockByItem(@PathVariable Integer itemId) {
        return ResponseEntity.ok(stockService.getStockByItemId(itemId));
    }

    // POST /api/stock
    @PostMapping
    public ResponseEntity<StockResponse> createStock(@Valid @RequestBody StockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.createStock(request));
    }

    // PUT /api/stock/{id}
    @PutMapping("/{id}")
    public ResponseEntity<StockResponse> updateStock(
            @PathVariable Integer id,
            @Valid @RequestBody StockRequest request) {
        return ResponseEntity.ok(stockService.updateStock(id, request));
    }

    // DELETE /api/stock/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Integer id) {
        stockService.deleteStock(id);
        return ResponseEntity.noContent().build();
    }
}
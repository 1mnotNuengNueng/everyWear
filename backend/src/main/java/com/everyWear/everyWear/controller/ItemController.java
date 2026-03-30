package com.everyWear.everyWear.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.everyWear.everyWear.DAO.CategoryDAO;
import com.everyWear.everyWear.DAO.ItemDAO;
import com.everyWear.everyWear.dto.item.ItemSummaryResponse;
import com.everyWear.everyWear.model.Item;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
public class ItemController {

    private final ItemDAO itemDAO;
    private final CategoryDAO categoryDAO;

    public ItemController(ItemDAO itemDAO, CategoryDAO categoryDAO) {
        this.itemDAO = itemDAO;
        this.categoryDAO = categoryDAO;
    }

    @GetMapping
    public ResponseEntity<List<ItemSummaryResponse>> getAllItems() {
        List<ItemSummaryResponse> items = itemDAO.findByIsActiveTrue()
                .stream()
                .map(item -> {
                    ItemSummaryResponse res = new ItemSummaryResponse();
                    res.setId(item.getId());
                    res.setName(item.getName());
                    res.setPrice(item.getPrice());

                    if (item.getCategory() != null) {
                        res.setCategoryId(item.getCategory().getId());
                        res.setCategoryName(item.getCategory().getName());
                    }

                    return res;
                })
                .toList();

        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
public ResponseEntity<?> getItemById(@PathVariable Integer id) {
    return itemDAO.findById(id)
            .filter(Item::isIsActive) // กัน soft delete
            .map(item -> {
                ItemSummaryResponse res = new ItemSummaryResponse();
                res.setId(item.getId());
                res.setName(item.getName());
                res.setPrice(item.getPrice());

                if (item.getCategory() != null) {
                    res.setCategoryId(item.getCategory().getId());
                    res.setCategoryName(item.getCategory().getName());
                }

                return ResponseEntity.ok(res);
            })
            .orElse(ResponseEntity.notFound().build());
}

    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody Item item) {

        if (item.getCategory() == null) {
            return ResponseEntity.badRequest().body("ต้องเลือกหมวดหมู่");
        }

        if (!categoryDAO.existsById(item.getCategory().getId())) {
            return ResponseEntity.badRequest().body("หมวดหมู่ไม่ถูกต้อง");
        }

        if (item.getPrice().doubleValue() <= 0) {
            return ResponseEntity.badRequest().body("ราคาต้องมากกว่า 0");
        }

        if (itemDAO.existsByName(item.getName())) {
            return ResponseEntity.badRequest().body("ชื่อสินค้านี้มีแล้ว");
        }

        item.setIsActive(true);

        return ResponseEntity.ok(itemDAO.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Integer id, @RequestBody Item newItem) {

        return itemDAO.findById(id)
                .map(item -> {

                    if (newItem.getPrice().doubleValue() <= 0) {
                        return ResponseEntity.badRequest().body("ราคาต้องมากกว่า 0");
                    }

                    item.setName(newItem.getName());
                    item.setDescription(newItem.getDescription());
                    item.setPrice(newItem.getPrice());
                    item.setCategory(newItem.getCategory());

                    return ResponseEntity.ok(itemDAO.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Soft Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Integer id) {

        return itemDAO.findById(id)
                .map(item -> {
                    item.setIsActive(false);
                    itemDAO.save(item);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔍 search name
    @GetMapping("/search")
    public List<Item> search(@RequestParam String name) {
        return itemDAO.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }

    // 🔍 filter category
    @GetMapping("/category/{id}")
    public List<Item> byCategory(@PathVariable Integer id) {
        return itemDAO.findByCategory_IdAndIsActiveTrue(id);
    }
}
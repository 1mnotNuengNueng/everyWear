package com.everyWear.everyWear.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.everyWear.everyWear.DAO.ItemDAO;
import com.everyWear.everyWear.dto.item.ItemSummaryResponse;
import com.everyWear.everyWear.model.Item;

/**
 * NOTE: Friend-owned area (Items API) — waiting to be extended/maintained by the teammate responsible for Items.
 *
 * Endpoints:
 * - GET /api/items : list items (id/name/price/category)
 */
@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemDAO itemDAO;

    public ItemController(ItemDAO itemDAO) {
        this.itemDAO = itemDAO;
    }

    @GetMapping
    public ResponseEntity<List<ItemSummaryResponse>> getAllItems() {
        List<ItemSummaryResponse> items = itemDAO.findAll()
                .stream()
                .map(item -> {
                    ItemSummaryResponse response = new ItemSummaryResponse();
                    response.setId(item.getId());
                    response.setName(item.getName());
                    response.setPrice(item.getPrice());
                    if (item.getCategory() != null) {
                        response.setCategoryId(item.getCategory().getId());
                        response.setCategoryName(item.getCategory().getName());
                    }
                    return response;
                })
                .toList();

        return ResponseEntity.ok(items);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Integer id) {
        return itemDAO.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Item createItem(@RequestBody Item item) {
        return itemDAO.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Integer id, @RequestBody Item newItem) {

        return itemDAO.findById(id)
                .map(item -> {
                    item.setName(newItem.getName());
                    item.setDescription(newItem.getDescription());
                    item.setPrice(newItem.getPrice());
                    item.setIsActive(newItem.isIsActive());
                    item.setCategory(newItem.getCategory());

                    return ResponseEntity.ok(itemDAO.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Integer id) {

        return itemDAO.findById(id)
                .map(item -> {
                    itemDAO.delete(item);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
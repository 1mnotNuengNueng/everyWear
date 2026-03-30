package com.everyWear.everyWear.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.everyWear.everyWear.DAO.CategoryDAO;
import com.everyWear.everyWear.DAO.ItemDAO;
import com.everyWear.everyWear.model.Category;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {

    private final CategoryDAO categoryDAO;
    private final ItemDAO itemDAO;

    public CategoryController(CategoryDAO categoryDAO, ItemDAO itemDAO) {
        this.categoryDAO = categoryDAO;
        this.itemDAO = itemDAO;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryDAO.findAll();
    }

    @GetMapping("/{id}")
public ResponseEntity<?> getCategoryById(@PathVariable Integer id) {
    return categoryDAO.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {

        if (categoryDAO.existsByName(category.getName())) {
            return ResponseEntity.badRequest().body("ชื่อหมวดหมู่นี้มีแล้ว");
        }

        return ResponseEntity.ok(categoryDAO.save(category));
    }

    @PutMapping("/{id}")
public ResponseEntity<?> updateCategory(@PathVariable Integer id, @RequestBody Category newCategory) {

    // เช็คชื่อซ้ำ (ยกเว้นตัวเอง)
    boolean duplicate = categoryDAO.findAll()
            .stream()
            .anyMatch(c ->
                c.getName().equalsIgnoreCase(newCategory.getName())
                && !c.getId().equals(id)
            );

    if (duplicate) {
        return ResponseEntity.badRequest().body("ชื่อหมวดหมู่นี้มีแล้ว");
    }

    return categoryDAO.findById(id)
            .map(category -> {
                category.setName(newCategory.getName());
                category.setDescription(newCategory.getDescription());
                return ResponseEntity.ok(categoryDAO.save(category));
            })
            .orElse(ResponseEntity.notFound().build());
}

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer id) {

        boolean hasItems = itemDAO.findByIsActiveTrue()
                .stream()
                .anyMatch(i -> i.getCategory() != null && i.getCategory().getId().equals(id));

        if (hasItems) {
            return ResponseEntity.badRequest().body("ลบไม่ได้! หมวดหมู่นี้มีสินค้าอยู่");
        }

        return categoryDAO.findById(id)
                .map(category -> {
                    categoryDAO.delete(category);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
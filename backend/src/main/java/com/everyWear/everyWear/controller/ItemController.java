package com.everyWear.everyWear.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.everyWear.everyWear.DAO.ItemDAO;
import com.everyWear.everyWear.dto.item.ItemSummaryResponse;

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
}

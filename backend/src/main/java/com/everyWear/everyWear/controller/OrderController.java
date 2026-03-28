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

import com.everyWear.everyWear.dto.order.OrderDetailResponse;
import com.everyWear.everyWear.dto.order.OrderSummaryResponse;
import com.everyWear.everyWear.dto.order.OrderUpsertRequest;
import com.everyWear.everyWear.service.OrderService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@GetMapping
	public ResponseEntity<List<OrderSummaryResponse>> getAllOrders() {
		return ResponseEntity.ok(orderService.getAllOrders());
	}

	@GetMapping("/{id}")
	public ResponseEntity<OrderDetailResponse> getOrderDetail(@PathVariable Integer id) {
		return ResponseEntity.ok(orderService.getOrderDetailById(id));
	}

	@PostMapping
	public ResponseEntity<OrderDetailResponse> createOrder(@Valid @RequestBody OrderUpsertRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<OrderDetailResponse> updateOrder(@PathVariable Integer id,
			@Valid @RequestBody OrderUpsertRequest request) {
		return ResponseEntity.ok(orderService.updateOrder(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
		orderService.deleteOrder(id);
		return ResponseEntity.noContent().build();
	}
}

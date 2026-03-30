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
import com.everyWear.everyWear.dto.order.RecalculateOrdersResponse;
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

	@PutMapping("/{id}/recalculate")
	public ResponseEntity<OrderDetailResponse> recalculateOrder(@PathVariable Integer id) {
		return ResponseEntity.ok(orderService.recalculateOrder(id));
	}

	@PutMapping("/recalculate")
	public ResponseEntity<RecalculateOrdersResponse> recalculateAllOrders() {
		int updatedCount = orderService.recalculateAllOrders();
		return ResponseEntity.ok(new RecalculateOrdersResponse(updatedCount));
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

	@PutMapping("/{id}/cancel")
	public ResponseEntity<Void> cancelOrder(@PathVariable Integer id) {
		orderService.cancelOrder(id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
		orderService.cancelOrder(id);
		return ResponseEntity.noContent().build();
	}
}

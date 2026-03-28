package com.everyWear.everyWear.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.everyWear.everyWear.dto.order.OrderDetailResponse;
import com.everyWear.everyWear.dto.order.OrderSummaryResponse;
import com.everyWear.everyWear.service.OrderService;

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
}


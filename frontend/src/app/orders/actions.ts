"use server";

import { redirect } from "next/navigation";

import { apiUrl } from "@/lib/api";

async function backendJsonRequest<TResponse>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<TResponse> {
  const url = apiUrl(path);
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Backend request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export async function createOrderAction(formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "{}");
  const payload = JSON.parse(payloadText) as unknown;

  const result = await backendJsonRequest<{ id: number }>("/api/orders", {
    method: "POST",
    body: payload,
  });

  redirect(`/orders/${result.id}`);
}

export async function updateOrderAction(orderId: number, formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "{}");
  const payload = JSON.parse(payloadText) as unknown;

  const result = await backendJsonRequest<{ id: number }>(`/api/orders/${orderId}`, {
    method: "PUT",
    body: payload,
  });

  redirect(`/orders/${result.id}`);
}

export async function deleteOrderAction(orderId: number, _formData: FormData) {
  const cancelPath = `/api/orders/${orderId}/cancel`;
  const cancelUrl = apiUrl(cancelPath);
  const cancelResponse = await fetch(cancelUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!cancelResponse.ok) {
    if (cancelResponse.status === 404 || cancelResponse.status === 405) {
      await backendJsonRequest<void>(`/api/orders/${orderId}`, { method: "DELETE" });
    } else {
      const text = await cancelResponse.text().catch(() => "");
      throw new Error(
        `Backend request failed: ${cancelResponse.status} ${cancelResponse.statusText}${text ? ` - ${text}` : ""}`,
      );
    }
  }

  redirect("/orders");
}

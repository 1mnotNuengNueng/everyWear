"use server";

import { revalidatePath } from "next/cache"; // 👈 1. Import ตัวนี้เข้ามา
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";

// ฟังก์ชัน generic สำหรับส่ง request ไป backend
async function backendJsonRequest<TResponse>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: string }, // body เป็น string
): Promise<TResponse> {
  const url = apiUrl(path);
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: init.body, // รับ string ตรง ๆ
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

// สร้าง order
export async function createOrderAction(formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "{}");
  const payload = JSON.parse(payloadText);

  const result = await backendJsonRequest<{ id: number }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload), // แปลง object → string
  });

  // 👈 2. ล้าง Cache ของหน้ารวมออเดอร์ เผื่อว่ากลับไปหน้าแรกจะได้เห็นออเดอร์ใหม่ทันที
  revalidatePath("/orders"); 
  redirect(`/orders/${result.id}`);
}

// อัปเดต order
export async function updateOrderAction(orderId: number, formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "{}");
  const payload = JSON.parse(payloadText);

  const result = await backendJsonRequest<{ id: number }>(`/api/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(payload), // แปลง object → string
  });

  // 👈 3. ล้าง Cache ของหน้ารวม และ หน้ารายละเอียดออเดอร์นั้นๆ
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  
  redirect(`/orders/${result.id}`);
}

// ลบ order
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
      await backendJsonRequest<void>(`/api/orders/${orderId}`, { method: "DELETE", body: undefined });
    } else {
      const text = await cancelResponse.text().catch(() => "");
      throw new Error(
        `Backend request failed: ${cancelResponse.status} ${cancelResponse.statusText}${text ? ` - ${text}` : ""}`,
      );
    }
  }

  redirect("/orders");
}
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 1. 🌟 จัดการ URL ให้ถูกต้อง
 * ดึงค่าจาก NEXT_PUBLIC_API_BASE_URL ใน .env.local
 * ทำการลบ / ที่อาจติดมาตอนท้ายออก และเติม /api เข้าไปให้โดยอัตโนมัติ
 */
const getApiUrl = (path: string) => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  // ลบเครื่องหมาย / ที่อาจติดมาท้าย URL ออก เพื่อไม่ให้เกิด // ใน path
  const baseUrl = rawBaseUrl.replace(/\/$/, ""); 
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * ฟังก์ชันกลางสำหรับส่ง Request (มาตรฐานเดียวกับระบบ Orders)
 */
async function backendRequest(path: string, init: RequestInit) {
  const url = getApiUrl(path);
  
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown Error");
    throw new Error(`Backend Error (${res.status}): ${errorText}`);
  }

  return res;
}

// 1. สร้างโปรโมชั่นใหม่ (POST)
export async function createPromotionAction(formData: FormData) {
  const payloadStr = formData.get("payload") as string;
  const payload = JSON.parse(payloadStr);

  await backendRequest("/api/promotions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/promotions");
  redirect("/promotions");
}

// 2. อัปเดตโปรโมชั่น (PATCH)
export async function updatePromotionAction(id: number, formData: FormData) {
  const payloadStr = formData.get("payload") as string;
  const payload = JSON.parse(payloadStr);

  await backendRequest(`/api/promotions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  revalidatePath("/promotions");
  revalidatePath(`/promotions/${id}`);
  redirect("/promotions");
}

// 3. ลบโปรโมชั่น (DELETE)
export async function deletePromotionAction(id: number) {
  await backendRequest(`/api/promotions/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/promotions");
}
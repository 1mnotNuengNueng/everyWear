"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API_BASE_URL = "http://localhost:8080/api";

// 1. สร้างโปรโมชั่นใหม่ (POST)
export async function createPromotionAction(formData: FormData) {
  // รับค่า JSON String จากฟอร์ม
  const payloadStr = formData.get("payload") as string;
  const payload = JSON.parse(payloadStr);

  const res = await fetch(`${API_BASE_URL}/promotions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการสร้างโปรโมชั่น");

  // สั่งให้รีเฟรชหน้า /promotions แล้วเด้งกลับไป
  revalidatePath("/promotions");
  redirect("/promotions");
}

// 2. อัปเดตโปรโมชั่น (PATCH)
export async function updatePromotionAction(id: number, formData: FormData) {
  const payloadStr = formData.get("payload") as string;
  const payload = JSON.parse(payloadStr);

  const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการอัปเดตโปรโมชั่น");

  revalidatePath("/promotions");
  redirect("/promotions");
}

// 3. ลบโปรโมชั่น (DELETE)
export async function deletePromotionAction(id: number) {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการลบโปรโมชั่น");

  // ลบเสร็จให้รีเฟรชหน้าปัจจุบัน (เพื่อให้ Card หายไป)
  revalidatePath("/promotions");
}
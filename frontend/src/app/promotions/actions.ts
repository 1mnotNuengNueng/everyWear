"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. 🌟 ดึง URL จาก .env ถ้าไม่มีให้ใช้ localhost (สำหรับรันในเครื่อง)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// 1. สร้างโปรโมชั่นใหม่ (POST)
export async function createPromotionAction(formData: FormData) {
  const payloadStr = formData.get("payload") as string;
  const payload = JSON.parse(payloadStr);

  const res = await fetch(`${API_BASE_URL}/promotions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการสร้างโปรโมชั่น");

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

  // 2. 🌟 ล้าง Cache ทั้งหน้ารวม และ หน้ารายละเอียดโปรโมชั่นนั้นๆ
  revalidatePath("/promotions");
  revalidatePath(`/promotions/${id}`);
  
  redirect("/promotions");
}

// 3. ลบโปรโมชั่น (DELETE)
export async function deletePromotionAction(id: number) {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการลบโปรโมชั่น");

  revalidatePath("/promotions");
  
  // หมายเหตุ: ถ้าคุณเรียกใช้ Action นี้จากหน้ารายละเอียด (PromotionDetailPage) 
  // การใส่ redirect จะช่วยให้มันเด้งกลับหน้ารวมอัตโนมัติครับ
  // แต่ถ้าคุณลบจากหน้าที่มี Client Component ที่จัดการ Router.push เองอยู่แล้ว ตรงนี้ไม่ต้องใส่ก็ได้ครับ
}
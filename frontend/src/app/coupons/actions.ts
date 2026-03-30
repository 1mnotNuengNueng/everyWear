"use server";

import { revalidatePath } from "next/cache"; // 👈 1. เพิ่ม import ตัวนี้
import { redirect } from "next/navigation";

import { apiRequestJson } from "@/lib/api";

export async function createCouponAction(formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "{}");
  const payload = JSON.parse(payloadText) as unknown;

  await apiRequestJson("/api/coupons", {
    method: "POST",
    body: payload,
  });

  revalidatePath("/coupons"); // 👈 2. สั่งล้าง Cache ของหน้า /coupons
  redirect("/coupons");
}

export async function updateCouponAction(couponId: number, formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "{}");
  const payload = JSON.parse(payloadText) as unknown;

  await apiRequestJson(`/api/coupons/${couponId}`, {
    method: "PUT",
    body: payload,
  });

  revalidatePath("/coupons"); // 👈 สั่งล้าง Cache
  redirect("/coupons");
}

export async function updateCouponStatusAction(couponId: number, isActive: boolean) {
  await apiRequestJson(`/api/coupons/${couponId}/status`, {
    method: "PATCH",
    body: { isActive },
  });

  revalidatePath("/coupons"); // 👈 สั่งล้าง Cache
  
  // หมายเหตุ: สำหรับการเปลี่ยนสถานะ (เปิด/ปิด) ปกติเราอาจจะไม่อยากให้มันเด้งโหลดหน้าใหม่
  // ถ้าปุ่มเปิด/ปิดอยู่ในหน้า /coupons อยู่แล้ว คุณสามารถลบ redirect() บรรทัดล่างทิ้งได้เลยครับ
  // แค่ revalidatePath() ข้อมูลในหน้าก็จะอัปเดตให้เอง
  redirect("/coupons"); 
}

export async function deleteCouponAction(couponId: number) {
  await apiRequestJson(`/api/coupons/${couponId}`, {
    method: "DELETE",
  });

  revalidatePath("/coupons"); // 👈 สั่งล้าง Cache
  // เช่นกันครับ ถ้ากดปุ่มลบจากหน้ารวมเลย จะลบ redirect ออกก็ได้
  redirect("/coupons");
}
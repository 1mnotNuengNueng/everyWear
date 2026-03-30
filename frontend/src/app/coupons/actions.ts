"use server";

import { redirect } from "next/navigation";

import { apiRequestJson } from "@/lib/api";

export async function createCouponAction(formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "{}");
  const payload = JSON.parse(payloadText) as unknown;

  await apiRequestJson("/api/coupons", {
    method: "POST",
    body: payload,
  });

  redirect("/coupons");
}

export async function updateCouponAction(couponId: number, formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "{}");
  const payload = JSON.parse(payloadText) as unknown;

  await apiRequestJson(`/api/coupons/${couponId}`, {
    method: "PUT",
    body: payload,
  });

  redirect("/coupons");
}

export async function updateCouponStatusAction(couponId: number, isActive: boolean) {
  await apiRequestJson(`/api/coupons/${couponId}/status`, {
    method: "PATCH",
    body: { isActive },
  });

  redirect("/coupons");
}

export async function deleteCouponAction(couponId: number) {
  await apiRequestJson(`/api/coupons/${couponId}`, {
    method: "DELETE",
  });

  redirect("/coupons");
}

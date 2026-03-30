"use server";

import { revalidatePath } from "next/cache"; // 👈 1. Import ตัวนี้เข้ามา
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";

type CouponStatusUpdateRequest = {
  isActive: boolean;
};

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
function getValidatedPayload(formData: FormData) {
  const payloadText = String(formData.get("payload") ?? "");
  let payload: any;

  try {
    payload = JSON.parse(payloadText);
  } catch {
    throw new Error("ข้อมูลฟอร์มไม่ถูกต้อง (payload parse failed)");
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (items.length === 0) {
    throw new Error("กรุณาเลือกสินค้าอย่างน้อย 1 รายการก่อนบันทึก");
  }

  for (const line of items) {
    const itemId = Number(line?.itemId);
    const quantity = Number(line?.quantity);
    if (!Number.isFinite(itemId) || itemId <= 0) {
      throw new Error("กรุณาเลือกสินค้าให้ครบถ้วนก่อนบันทึก");
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error("กรุณากรอกจำนวนสินค้าให้ถูกต้องก่อนบันทึก");
    }
  }

  return payload;
}

export async function createOrderAction(formData: FormData) {
  const payload = getValidatedPayload(formData);

  const result = await backendJsonRequest<{ id: number }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload), // แปลง object → string
  });

  try {
    const couponIdRaw = payload?.couponId;
    const couponCodeRaw = payload?.couponCode;

    if (Number.isFinite(Number(couponIdRaw)) && Number(couponIdRaw) > 0) {
      await deactivateCouponById(Number(couponIdRaw));
    } else if (typeof couponCodeRaw === "string" && couponCodeRaw.trim() !== "") {
      const coupon = await backendJsonRequest<{ id: number }>(
        `/api/coupons/code/${encodeURIComponent(couponCodeRaw.trim())}`,
        { method: "GET" },
      );
      if (coupon?.id) {
        await deactivateCouponById(coupon.id);
      }
    }
  } catch {
    // best-effort: order has been created already
  }

  redirect(`/orders/${result.id}`);
}

// อัปเดต order
export async function updateOrderAction(orderId: number, formData: FormData) {
  const payload = getValidatedPayload(formData);

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

async function deactivateCouponById(couponId: number) {
  const payload: CouponStatusUpdateRequest = { isActive: false };
  await backendJsonRequest(`/api/coupons/${couponId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

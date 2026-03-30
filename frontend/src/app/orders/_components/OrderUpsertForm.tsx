"use client";

import { useEffect, useMemo, useState } from "react";

type ItemOption = {
  id: number;
  name: string;
  price: string | number | null;
  categoryId: number | null;
  categoryName: string | null;
};

type CouponApiResponse = {
  id: number;
  code: string;
  expireDate: string | null;
  active: boolean;
  createdAt: string | null;
  promotionId: number | null;
  promotionName: string | null;
  discountValue: string | number | null;
  allowedCategoryIds?: number[] | null;
};

type PromotionApiResponse = {
  id: number;
  name: string;
  description: string;
  discountValue: string | number | null;
  startAt: string | null;
  endAt: string | null;
  isActive: boolean;
  createdAt: string | null;
  categoryIds?: number[] | null;
};

type InitialOrder = {
  id: number;
  couponId: number | null;
  couponCode: string | null;
  items: Array<{
    itemId: number | null;
    quantity: number;
    unitPrice: string | number | null;
  }>;
};

type OrderLine = {
  itemId: number | "";
  quantity: number;
};

function formatMoney(value: string | number | null) {
  if (value === null || value === undefined) return "-";
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numberValue)) return String(value);
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(numberValue);
}

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numberValue)) return null;
  return numberValue;
}

function parseBackendDateTime(value: string | null | undefined) {
  if (!value) return null;
  if (value.includes("T")) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

async function localGetJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
    );
  }
  return (await response.json()) as T;
}

export default function OrderUpsertForm(props: {
  mode: "create" | "edit";
  items: ItemOption[];
  initial?: InitialOrder;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>(
    props.initial?.couponCode ?? "",
  );
  const [couponCheckMessage, setCouponCheckMessage] = useState<string | null>(
    null,
  );
  const [couponCheckLoading, setCouponCheckLoading] = useState(false);
  const [couponCheckTone, setCouponCheckTone] = useState<
    "info" | "warning" | "error"
  >("info");
  const [couponCheckResult, setCouponCheckResult] = useState<{
    coupon: CouponApiResponse;
    promotion: PromotionApiResponse;
  } | null>(null);

  const [lines, setLines] = useState<OrderLine[]>(() => {
    const initialLines = props.initial?.items ?? [];
    if (initialLines.length === 0) {
      return [{ itemId: "", quantity: 1 }];
    }

    return initialLines.map((line) => ({
      itemId: line.itemId ?? "",
      quantity: line.quantity ?? 1,
    }));
  });

  const normalizedCouponCode = useMemo(() => {
    return couponCode.trim().toUpperCase();
  }, [couponCode]);

  const payloadJson = useMemo(() => {
    const normalizedItems = lines
      .filter((line) => line.itemId !== "")
      .map((line) => {
        return {
          itemId: Number(line.itemId),
          quantity: Number(line.quantity),
        };
      });

    if (props.mode === "edit") {
      return JSON.stringify({
        couponId: null,
        couponCode: null,
        orderDate: null,
        items: normalizedItems,
      });
    }

    const resolvedCouponId = couponCheckResult?.coupon.id ?? null;

    return JSON.stringify({
      couponId: resolvedCouponId,
      couponCode:
        resolvedCouponId !== null
          ? null
          : normalizedCouponCode !== ""
            ? normalizedCouponCode
            : null,
      orderDate: null,
      items: normalizedItems,
    });
  }, [couponCheckResult, normalizedCouponCode, lines, props.mode]);

  const isValid = useMemo(() => {
    const hasAtLeastOneItem = lines.some((line) => line.itemId !== "");
    const allQuantitiesValid = lines
      .filter((line) => line.itemId !== "")
      .every((line) => Number.isFinite(line.quantity) && line.quantity >= 1);
    return hasAtLeastOneItem && allQuantitiesValid;
  }, [lines]);

  const calculatedSubtotal = useMemo(() => {
    let total = 0;
    for (const line of lines) {
      if (line.itemId === "") continue;
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const item = props.items.find((it) => it.id === Number(line.itemId));
      const itemPrice =
        item?.price === null || item?.price === undefined
          ? null
          : typeof item.price === "string"
            ? Number(item.price)
            : item.price;
      if (itemPrice !== null && Number.isFinite(itemPrice)) {
        total += itemPrice * qty;
      }
    }
    return total;
  }, [lines, props.items]);

  const discountInfo = useMemo(() => {
    const coupon = couponCheckResult?.coupon ?? null;
    const promotion = couponCheckResult?.promotion ?? null;

    if (!coupon) {
      return {
        eligibleSubtotal: 0,
        discountAmount: 0,
        netValue: calculatedSubtotal,
        discountPercent: null as number | null,
        hasCategoryLimit: false,
        allowedCategoryIds: null as ReadonlySet<number> | null,
      };
    }

    const allowedCategoryIdsRaw =
      (coupon.allowedCategoryIds ?? null) ?? (promotion?.categoryIds ?? null);
    const allowedCategoryIds =
      Array.isArray(allowedCategoryIdsRaw) && allowedCategoryIdsRaw.length > 0
        ? new Set(allowedCategoryIdsRaw)
        : null;

    let eligibleSubtotal = 0;
    for (const line of lines) {
      if (line.itemId === "") continue;
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const item = props.items.find((it) => it.id === Number(line.itemId));
      if (!item) continue;

      if (allowedCategoryIds) {
        const categoryId = item.categoryId ?? null;
        if (categoryId === null || !allowedCategoryIds.has(categoryId)) {
          continue;
        }
      }

      const itemPrice =
        item.price === null || item.price === undefined
          ? null
          : typeof item.price === "string"
            ? Number(item.price)
            : item.price;
      if (itemPrice !== null && Number.isFinite(itemPrice)) {
        eligibleSubtotal += itemPrice * qty;
      }
    }

    const discountPercent =
      (promotion ? toNumber(promotion.discountValue) : null) ??
      toNumber(coupon.discountValue);
    const percent = discountPercent ?? 0;
    const discountAmount =
      percent <= 0
        ? 0
        : Math.min(eligibleSubtotal, (eligibleSubtotal * percent) / 100);
    const netValue = Math.max(0, calculatedSubtotal - discountAmount);

    return {
      eligibleSubtotal,
      discountAmount,
      netValue,
      discountPercent: discountPercent,
      hasCategoryLimit: allowedCategoryIds !== null,
      allowedCategoryIds,
    };
  }, [calculatedSubtotal, couponCheckResult, lines, props.items]);

  const couponIssues = useMemo(() => {
    if (!discountInfo.allowedCategoryIds) return [];

    const excludedNames = new Set<string>();
    for (const line of lines) {
      if (line.itemId === "") continue;
      const item = props.items.find((it) => it.id === Number(line.itemId));
      if (!item) continue;

      const categoryId = item.categoryId ?? null;
      if (
        categoryId === null ||
        !discountInfo.allowedCategoryIds.has(categoryId)
      ) {
        excludedNames.add(item.name);
      }
    }

    return Array.from(excludedNames).map(
      (name) => `สินค้า “${name}” ไม่เข้าเงื่อนไขหมวดหมู่`,
    );
  }, [discountInfo.allowedCategoryIds, lines, props.items]);

  const calculatedDiscount = discountInfo.discountAmount;
  const calculatedNet = discountInfo.netValue;

  async function handleCheckCoupon() {
    const normalized = normalizedCouponCode;
    if (!normalized) {
      setCouponCheckTone("error");
      setCouponCheckMessage("กรุณากรอกโค้ดคูปองก่อนกดตรวจสอบ");
      setCouponCheckResult(null);
      return;
    }

    setCouponCheckLoading(true);
    setCouponCheckTone("warning");
    setCouponCheckMessage("กำลังตรวจสอบคูปองและโปรโมชัน...");
    setCouponCheckResult(null);

    try {
      const coupon = await localGetJson<CouponApiResponse>(
        `/api/coupons/code/${encodeURIComponent(normalized)}`,
      );

      if (!coupon.promotionId) {
        setCouponCheckTone("error");
        setCouponCheckMessage("คูปองนี้ไม่มีโปรโมชันผูกอยู่");
        return;
      }

      const promotion = await localGetJson<PromotionApiResponse>(
        `/api/promotions/${coupon.promotionId}`,
      );

      const now = new Date();
      const issues: string[] = [];

      if (!coupon.active) {
        issues.push("คูปองถูกปิดใช้งาน");
      }

      const expireAt = parseBackendDateTime(coupon.expireDate);
      if (expireAt && expireAt.getTime() <= now.getTime()) {
        issues.push("คูปองหมดอายุแล้ว");
      }

      if (!promotion.isActive) {
        issues.push("โปรโมชันถูกปิดใช้งาน");
      }

      const startAt = parseBackendDateTime(promotion.startAt);
      if (startAt && startAt.getTime() > now.getTime()) {
        issues.push("โปรโมชันยังไม่เริ่ม");
      }

      const endAt = parseBackendDateTime(promotion.endAt);
      if (endAt && endAt.getTime() < now.getTime()) {
        issues.push("โปรโมชันสิ้นสุดแล้ว");
      }

      if (issues.length > 0) {
        setCouponCheckTone("error");
        setCouponCheckMessage(issues.join(" • "));
        return;
      }

      setCouponCheckResult({ coupon, promotion });
      setCouponCheckTone("info");

      const percent =
        toNumber(promotion.discountValue) ?? toNumber(coupon.discountValue);
      const percentText = percent === null ? "" : ` ลด ${percent}%`;
      const categoryText =
        coupon.allowedCategoryIds && coupon.allowedCategoryIds.length > 0
          ? ` (เฉพาะหมวดหมู่ ${coupon.allowedCategoryIds.length} หมวด)`
          : promotion.categoryIds && promotion.categoryIds.length > 0
            ? ` (เฉพาะหมวดหมู่ ${promotion.categoryIds.length} หมวด)`
            : "";
      setCouponCheckMessage(
        `ใช้ได้: ${coupon.code} — ${coupon.promotionName ?? promotion.name}${percentText}${categoryText}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCouponCheckTone("error");
      setCouponCheckMessage(
        message.toLowerCase().includes("404")
          ? `ไม่พบคูปอง: ${normalized}`
          : `ตรวจสอบไม่สำเร็จ: ${message}`,
      );
      setCouponCheckResult(null);
    } finally {
      setCouponCheckLoading(false);
    }
  }

  useEffect(() => {
    if (props.mode !== "edit") return;

    const normalized = normalizedCouponCode;
    if (!normalized) return;

    void (async () => {
      try {
        setCouponCheckLoading(true);
        setCouponCheckTone("info");
        setCouponCheckMessage(null);

        const coupon = await localGetJson<CouponApiResponse>(
          `/api/coupons/code/${encodeURIComponent(normalized)}`,
        );

        if (coupon.promotionId) {
          const promotion = await localGetJson<PromotionApiResponse>(
            `/api/promotions/${coupon.promotionId}`,
          );
          setCouponCheckResult({ coupon, promotion });
        } else {
          setCouponCheckResult(null);
        }
      } catch {
        setCouponCheckResult(null);
      } finally {
        setCouponCheckLoading(false);
      }
    })();
  }, [normalizedCouponCode, props.mode]);

  return (
    <form
      action={props.action}
      onSubmit={(event) => {
        if (!isValid) {
          event.preventDefault();
          setSubmitMessage("กรุณาเลือกสินค้าอย่างน้อย 1 รายการก่อนบันทึก");
          return;
        }
        setSubmitMessage(null);
      }}
      className="mt-8 grid gap-6"
    >
      <input type="hidden" name="payload" value={payloadJson} readOnly />

      {submitMessage ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {submitMessage}
        </div>
      ) : null}
  
      {props.mode === "create" ? (
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">
            กรอกโค้ดคูปอง
          </span>
          <div className="flex items-center gap-2">
          <input
            value={couponCode}
	            onChange={(event) => {
	              setCouponCode(event.target.value);
	              setCouponCheckResult(null);
	              setCouponCheckTone("info");
	              setCouponCheckMessage(null);
            }}
            placeholder="เช่น WELCOME100"
            className="h-10 flex-1 rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          />
	          <button
            type="button"
            onClick={handleCheckCoupon}
            disabled={couponCheckLoading || normalizedCouponCode === ""}
            className="h-10 shrink-0 whitespace-nowrap rounded bg-amber-500 px-6 text-sm font-bold text-white hover:bg-amber-600 transition disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
	            {couponCheckLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบคูปอง"}
	          </button>
	        </div>

	        {couponCheckMessage ? (
	          <div
	            className={[
	              "mt-2 rounded border px-4 py-3 text-sm font-medium",
	              couponCheckTone === "error"
	                ? "border-red-200 bg-red-50 text-red-800"
	                : couponCheckTone === "warning"
	                  ? "border-amber-200 bg-amber-50 text-amber-900"
	                  : "border-blue-200 bg-blue-50 text-blue-800",
	            ].join(" ")}
	          >
	            {couponCheckMessage}
	          </div>
	        ) : null}
        
        </label>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
          <div className="font-bold">คูปองที่ใช้กับออเดอร์นี้</div>
          <div className="mt-1">
            {props.initial?.couponCode ? (
              <span className="font-mono">{props.initial.couponCode}</span>
            ) : (
              <span>-</span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            แก้ไขออเดอร์จะไม่สามารถเปลี่ยนคูปองได้
          </div>
        </div>
      )}

        {couponIssues.length > 0 ? (
          <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="font-bold">
              ⚠️ คูปองนี้ใช้กับสินค้าบางชิ้นไม่ได้ (ระบบจะคิดส่วนลดเฉพาะชิ้นที่เข้าเงื่อนไข)
            </div>
            <ul className="mt-1 list-disc pl-5">
              {couponIssues.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}
    

      {/* ตารางเลือกสินค้า */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-3 border-b border-gray-200 bg-gray-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
          <div className="col-span-6">รายการสินค้า</div>
          <div className="col-span-2 text-right">จำนวน</div>
          <div className="col-span-2 text-right">ราคาต่อชิ้น</div>
          <div className="col-span-2 text-right">จัดการ</div>
        </div>

        <div className="divide-y divide-gray-100">
          {lines.map((line, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 px-4 py-4 items-center">
              <div className="col-span-6">
                <select
                  value={line.itemId === "" ? "" : String(line.itemId)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setLines((prev) => {
                      const next = [...prev];
                      const nextLine = { ...next[index] };
                      nextLine.itemId = value === "" ? "" : Number(value);

                      next[index] = nextLine;
                      return next;
                    });
                  }}
                  className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500"
                >
                  <option value="">-- เลือกสินค้า --</option>
                  {props.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {formatMoney(item.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setLines((prev) => {
                      const next = [...prev];
                      next[index] = { ...next[index], quantity: value };
                      return next;
                    });
                  }}
                  className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-right text-sm text-gray-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2 flex items-center justify-end text-sm font-medium text-gray-800">
                {(() => {
                  if (line.itemId === "") return "-";
                  const item = props.items.find(
                    (it) => it.id === Number(line.itemId),
                  );
                  return item ? formatMoney(item.price) : "-";
                })()}
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
                {(() => {
	                  if (!discountInfo.allowedCategoryIds || line.itemId === "") {
	                    return null;
	                  }

                  const item = props.items.find((it) => it.id === Number(line.itemId));
                  if (!item) return null;
	                  const categoryId = item.categoryId ?? null;
	                  const ok =
	                    categoryId !== null &&
	                    discountInfo.allowedCategoryIds.has(categoryId);
	                  return ok ? null : (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                      งดร่วมรายการ
                    </span>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => {
                    setLines((prev) => prev.filter((_, i) => i !== index));
                  }}
                  className="h-10 rounded bg-red-100 px-3 text-sm font-bold text-red-600 hover:bg-red-200 transition disabled:opacity-50"
                  disabled={lines.length === 1}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
          <button
            type="button"
            onClick={() =>
              setLines((prev) => [...prev, { itemId: "", quantity: 1 }])
            }
            className="h-10 rounded bg-blue-100 text-blue-700 px-4 text-sm font-bold hover:bg-blue-200 transition"
          >
            + เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* สรุปยอดเงิน */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">ราคารวมก่อนลด</span>
            <span className="font-medium text-gray-800">
              {formatMoney(calculatedSubtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">ส่วนลดที่ได้</span>
            <span className="font-bold text-red-500">
              -{formatMoney(calculatedDiscount)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-bold">ยอดสุทธิประเมิน</span>
              <span className="text-2xl font-black text-blue-600">
                {formatMoney(calculatedNet)}
              </span>
            </div>
          </div>
	        </div>
	      </div>

      {/* ปุ่ม Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className="h-12 mt-4 rounded shadow bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {props.mode === "create" ? "✔️ ยืนยันสร้างออเดอร์" : "💾 บันทึกการแก้ไข"}
      </button>
    </form>
  );
}

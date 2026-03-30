"use client";

import { useMemo, useState } from "react";

type ItemOption = {
  id: number;
  name: string;
  price: string | number | null;
  categoryId: number | null;
  categoryName: string | null;
};

type CouponOption = {
  id: number;
  code: string;
  discountValue: string | number | null;
  promotionName: string;
  allowedCategoryIds?: number[] | null;
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

export default function OrderUpsertForm(props: {
  mode: "create" | "edit";
  items: ItemOption[];
  coupons: CouponOption[];
  initial?: InitialOrder;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [couponId, setCouponId] = useState<number | "">(
    props.initial?.couponId ?? "",
  );
  const [couponCode, setCouponCode] = useState<string>(
    props.initial?.couponCode ?? "",
  );

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

  const selectedCoupon = useMemo(() => {
    if (couponId === "") return null;
    return props.coupons.find((coupon) => coupon.id === couponId) ?? null;
  }, [couponId, props.coupons]);

  const couponIssues = useMemo(() => {
    if (!selectedCoupon || !selectedCoupon.allowedCategoryIds || selectedCoupon.allowedCategoryIds.length === 0) {
      return [];
    }
    const allowed = new Set(selectedCoupon.allowedCategoryIds);

    const issues: string[] = [];
    for (const line of lines) {
      if (line.itemId === "") continue;
      const item = props.items.find((it) => it.id === Number(line.itemId));
      if (!item) continue;
      if (item.categoryId === null || item.categoryId === undefined) {
        issues.push(`สินค้า "${item.name}" ไม่มีหมวดหมู่ จึงใช้คูปองนี้ไม่ได้`);
        continue;
      }
      if (!allowed.has(item.categoryId)) {
        issues.push(`สินค้า "${item.name}" ใช้คูปองนี้ไม่ได้`);
      }
    }
    return issues;
  }, [lines, props.items, selectedCoupon]);

  const payloadJson = useMemo(() => {
    const normalizedItems = lines
      .filter((line) => line.itemId !== "")
      .map((line) => {
        return {
          itemId: Number(line.itemId),
          quantity: Number(line.quantity),
        };
      });

    return JSON.stringify({
      couponId: couponId === "" ? null : couponId,
      couponCode:
        couponId === "" && couponCode.trim() !== "" ? couponCode.trim() : null,
      orderDate: null,
      items: normalizedItems,
    });
  }, [couponCode, couponId, lines]);

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

  const eligibleSubtotalForCoupon = useMemo(() => {
    if (!selectedCoupon) return calculatedSubtotal;
    if (!selectedCoupon.allowedCategoryIds || selectedCoupon.allowedCategoryIds.length === 0) {
      return calculatedSubtotal;
    }

    const allowed = new Set(selectedCoupon.allowedCategoryIds);
    let total = 0;
    for (const line of lines) {
      if (line.itemId === "") continue;
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const item = props.items.find((it) => it.id === Number(line.itemId));
      if (!item || item.categoryId === null || item.categoryId === undefined) continue;
      if (!allowed.has(item.categoryId)) continue;

      const itemPrice =
        item.price === null || item.price === undefined
          ? null
          : typeof item.price === "string"
            ? Number(item.price)
            : item.price;
      if (itemPrice !== null && Number.isFinite(itemPrice)) {
        total += itemPrice * qty;
      }
    }
    return total;
  }, [calculatedSubtotal, lines, props.items, selectedCoupon]);

  const calculatedDiscount = useMemo(() => {
    if (!selectedCoupon || selectedCoupon.discountValue === null || selectedCoupon.discountValue === undefined) {
      return 0;
    }
    const discount =
      typeof selectedCoupon.discountValue === "string"
        ? Number(selectedCoupon.discountValue)
        : selectedCoupon.discountValue;
    if (!Number.isFinite(discount)) return 0;
    return Math.min(eligibleSubtotalForCoupon, discount);
  }, [eligibleSubtotalForCoupon, selectedCoupon]);

  const calculatedNet = useMemo(() => {
    return Math.max(0, calculatedSubtotal - calculatedDiscount);
  }, [calculatedDiscount, calculatedSubtotal]);

  return (
    <form action={props.action} className="mt-8 grid gap-6">
      <input type="hidden" name="payload" value={payloadJson} />

      <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              คูปอง (เลือกจากรายการ)
            </span>
            <select
              value={couponId === "" ? "" : String(couponId)}
              onChange={(event) => {
                const value = event.target.value;
                setCouponId(value === "" ? "" : Number(value));
                if (value !== "") {
                  setCouponCode("");
                }
              }}
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="">ไม่ใช้คูปอง</option>
              {props.coupons.map((coupon) => (
                <option key={coupon.id} value={coupon.id}>
                  {coupon.code} ({coupon.promotionName}) -{" "}
                  {formatMoney(coupon.discountValue)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            หรือกรอกโค้ดคูปอง (ถ้าไม่เลือกจากรายการ)
          </span>
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            placeholder="เช่น WELCOME100"
            disabled={couponId !== ""}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            ถ้าเลือกคูปองจากรายการแล้ว ช่องนี้จะถูกมองข้าม
          </div>
        </label>

        {couponIssues.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="font-medium">
              คูปองนี้ใช้กับสินค้าบางชิ้นไม่ได้ (ระบบจะคิดส่วนลดเฉพาะชิ้นที่เข้าเงื่อนไข)
            </div>
            <ul className="mt-1 list-disc pl-5">
              {couponIssues.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <div className="col-span-6">สินค้า</div>
          <div className="col-span-2 text-right">จำนวน</div>
          <div className="col-span-2 text-right">ราคาต่อชิ้น</div>
          <div className="col-span-2 text-right"></div>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {lines.map((line, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 px-4 py-4">
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
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  <option value="">เลือกสินค้า</option>
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
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-right text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>

              <div className="col-span-2 flex items-center justify-end text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {(() => {
                  if (line.itemId === "") return "-";
                  const item = props.items.find((it) => it.id === Number(line.itemId));
                  return item ? formatMoney(item.price) : "-";
                })()}
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
                {(() => {
                  if (
                    !selectedCoupon ||
                    !selectedCoupon.allowedCategoryIds ||
                    selectedCoupon.allowedCategoryIds.length === 0 ||
                    line.itemId === ""
                  ) {
                    return null;
                  }

                  const item = props.items.find((it) => it.id === Number(line.itemId));
                  if (!item) return null;
                  const allowed = new Set(selectedCoupon.allowedCategoryIds);
                  const ok = item.categoryId !== null && item.categoryId !== undefined && allowed.has(item.categoryId);
                  return ok ? null : (
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      ใช้คูปองไม่ได้
                    </span>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => {
                    setLines((prev) => prev.filter((_, i) => i !== index));
                  }}
                  className="h-10 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900/40"
                  disabled={lines.length === 1}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={() =>
              setLines((prev) => [...prev, { itemId: "", quantity: 1 }])
            }
            className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
          >
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      <div className="grid gap-3 justify-end">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">
              ราคารวมก่อนลด (ประมาณ)
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatMoney(calculatedSubtotal)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">
              ส่วนลดที่ได้ (ประมาณ)
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatMoney(calculatedDiscount)}
            </span>
          </div>
          <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                ราคาที่ลดแล้ว (ประมาณ)
              </span>
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {formatMoney(calculatedNet)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="h-11 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
      >
        {props.mode === "create" ? "สร้างออเดอร์" : "บันทึกการแก้ไข"}
      </button>
    </form>
  );
}

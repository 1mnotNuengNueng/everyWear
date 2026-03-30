"use client";

import { useMemo, useState } from "react";

type ItemOption = {
  id: number;
  name: string;
  price: string | number | null;
  categoryId: number | null;
  categoryName: string | null;
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
  initial?: InitialOrder;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [couponCode, setCouponCode] = useState<string>(
    props.initial?.couponCode ?? "",
  );
  const [couponCheckMessage, setCouponCheckMessage] = useState<string | null>(
    null,
  );
  const [couponCheckTone, setCouponCheckTone] = useState<
    "info" | "warning" | "error"
  >("info");

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
      couponId: null,
      couponCode: couponCode.trim() !== "" ? couponCode.trim() : null,
      orderDate: null,
      items: normalizedItems,
    });
  }, [couponCode, lines]);

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

  return (
    <form
      action={props.action}
      className="mt-8 grid gap-6"
    >
      <input type="hidden" name="payload" value={payloadJson} />

      {/* กล่องเลือกคูปอง */}
      <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-bold text-gray-800">
              🏷️ เลือกคูปองส่วนลด
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
              className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500"
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
          <span className="font-medium text-gray-700">
            หรือกรอกโค้ดคูปองด้วยตัวเอง
          </span>
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            placeholder="เช่น WELCOME100"
            disabled={couponId !== ""}
            className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          />
          <div className="text-xs text-gray-500">
            * ถ้าเลือกคูปองจากรายการด้านบนแล้ว ช่องนี้จะถูกล็อก
          </div>
        </label>

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
      </div>

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
            + เพิ่มบรรทัดสินค้า
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
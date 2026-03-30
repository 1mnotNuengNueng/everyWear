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

      <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            โค้ดคูปอง (กรอก)
          </span>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value);
                setCouponCheckMessage(null);
              }}
              placeholder="เช่น WELCOME100"
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <button
              type="button"
              onClick={() => {
                const normalized = couponCode.trim();
                if (!normalized) {
                  setCouponCheckTone("error");
                  setCouponCheckMessage("กรุณากรอกโค้ดคูปองก่อนกดตรวจสอบ");
                  return;
                }
                setCouponCheckTone("warning");
                setCouponCheckMessage(
                  `ยังไม่เชื่อม API ตรวจสอบคูปอง (โค้ด: ${normalized})`,
                );
              }}
              className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
            >
              ตรวจสอบ
            </button>
          </div>
        </label>

        {couponCheckMessage ? (
          <div
            className={
              couponCheckTone === "error"
                ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100"
                : couponCheckTone === "warning"
                  ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
                  : "rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-50"
            }
          >
            {couponCheckMessage}
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
                  const item = props.items.find(
                    (it) => it.id === Number(line.itemId),
                  );
                  return item ? formatMoney(item.price) : "-";
                })()}
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
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
            onClick={() => setLines((prev) => [...prev, { itemId: "", quantity: 1 }])}
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
              ส่วนลด (ประมาณ)
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">-</span>
          </div>
          <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                ราคาที่ลดแล้ว (ประมาณ)
              </span>
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {formatMoney(calculatedSubtotal)}
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

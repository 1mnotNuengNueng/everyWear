"use client";

import { useMemo, useState } from "react";

type PromotionOption = {
  id: number;
  name: string;
  discountValue: string | number | null;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  categoryIds?: number[] | null;
};

type InitialCoupon = {
  id: number;
  code: string;
  expireDate: string | null;
  isActive: boolean;
  promotionId: number;
};

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return normalized.slice(0, 16);
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function formatMoney(value: string | number | null) {
  if (value === null || value === undefined) return "-";
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numberValue)) return String(value);
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(numberValue);
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function CouponUpsertForm(props: {
  mode: "create" | "edit";
  promotions: PromotionOption[];
  initial?: InitialCoupon;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [promotionId, setPromotionId] = useState<number | "">(
    props.initial?.promotionId ?? "",
  );
  const [expireDate, setExpireDate] = useState<string>(
    toDateTimeLocalValue(props.initial?.expireDate ?? null),
  );
  const [isActive, setIsActive] = useState<boolean>(props.initial?.isActive ?? true);

  const selectedPromotion = useMemo(() => {
    if (promotionId === "") return null;
    return props.promotions.find((promotion) => promotion.id === promotionId) ?? null;
  }, [promotionId, props.promotions]);

  const payloadJson = useMemo(
    () =>
      JSON.stringify({
        promotionId: promotionId === "" ? null : promotionId,
        expireDate: expireDate === "" ? null : expireDate,
        isActive,
      }),
    [expireDate, isActive, promotionId],
  );

  const isValid = promotionId !== "" && expireDate !== "";

  return (
    <form action={props.action} className="mt-8 grid gap-6">
      <input type="hidden" name="payload" value={payloadJson} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              {props.mode === "create" ? "สร้างคูปองใหม่" : `แก้ไขคูปอง ${props.initial?.code ?? ""}`}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              ระบบจะสร้างโค้ดคูปองให้อัตโนมัติจาก backend เมื่อบันทึกข้อมูล
            </p>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-900">โปรโมชั่น</span>
            <select
              value={promotionId === "" ? "" : String(promotionId)}
              onChange={(event) => {
                const value = event.target.value;
                setPromotionId(value === "" ? "" : Number(value));
              }}
              className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-stone-900 outline-none focus:border-amber-500"
            >
              <option value="">เลือกโปรโมชั่น</option>
              {props.promotions.map((promotion) => (
                <option key={promotion.id} value={promotion.id}>
                  {promotion.name} - {formatMoney(promotion.discountValue)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-900">วันหมดอายุ</span>
            <input
              type="datetime-local"
              value={expireDate}
              onChange={(event) => setExpireDate(event.target.value)}
              className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-stone-900 outline-none focus:border-amber-500"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-medium text-stone-900">เปิดใช้งานคูปองทันที</span>
          </label>

          <button
            type="submit"
            disabled={!isValid}
            className="h-12 rounded-2xl bg-amber-600 px-5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {props.mode === "create" ? "บันทึกและสร้างคูปอง" : "บันทึกการแก้ไข"}
          </button>
        </section>

        <aside className="rounded-3xl border border-stone-200 bg-stone-900 p-6 text-stone-50 shadow-sm">
          <h3 className="text-lg font-semibold">สรุปโปรโมชั่น</h3>
          {selectedPromotion ? (
            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <div className="text-stone-400">ชื่อโปรโมชั่น</div>
                <div className="mt-1 font-medium">{selectedPromotion.name}</div>
              </div>
              <div>
                <div className="text-stone-400">ส่วนลด</div>
                <div className="mt-1 font-medium">
                  {formatMoney(selectedPromotion.discountValue)}
                </div>
              </div>
              <div>
                <div className="text-stone-400">ช่วงเวลาใช้งาน</div>
                <div className="mt-1">
                  {formatDateTime(selectedPromotion.startAt)} -{" "}
                  {formatDateTime(selectedPromotion.endAt)}
                </div>
              </div>
              <div>
                <div className="text-stone-400">สถานะโปรโมชั่น</div>
                <div className="mt-1 font-medium">
                  {selectedPromotion.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </div>
              </div>
              <div>
                <div className="text-stone-400">หมวดหมู่ที่ร่วมรายการ</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPromotion.categoryIds && selectedPromotion.categoryIds.length > 0 ? (
                    selectedPromotion.categoryIds.map((categoryId) => (
                      <span
                        key={categoryId}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium"
                      >
                        Category #{categoryId}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-300">ใช้ได้กับทุกหมวดหมู่</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone-300">
              เลือกโปรโมชั่นก่อนเพื่อดูรายละเอียดส่วนลดและหมวดหมู่ที่คูปองจะใช้งานได้
            </p>
          )}
        </aside>
      </div>
    </form>
  );
}

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
  categories?: Array<{ id: number; name: string }> | null;
};

type CategoryOption = {
  id: number;
  name: string;
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
  return `${numberValue}%`;
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
  categories: CategoryOption[];
  initial?: InitialCoupon;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const defaultIsActive = props.initial?.isActive ?? true;
  const [promotionId, setPromotionId] = useState<number | "">(
    props.initial?.promotionId ?? "",
  );
  const [expireDate, setExpireDate] = useState<string>(
    toDateTimeLocalValue(props.initial?.expireDate ?? null),
  );

  const selectedPromotion = useMemo(() => {
    if (promotionId === "") return null;
    return props.promotions.find((promotion) => promotion.id === promotionId) ?? null;
  }, [promotionId, props.promotions]);

  const selectedCategoryNames = useMemo(() => {
    if (selectedPromotion?.categories && selectedPromotion.categories.length > 0) {
      return selectedPromotion.categories
        .map((category) => category.name)
        .filter((name, index, array) => Boolean(name) && array.indexOf(name) === index);
    }

    if (!selectedPromotion?.categoryIds || selectedPromotion.categoryIds.length === 0) {
      return [];
    }

    const categoryMap = new Map(
      props.categories.map((category) => [category.id, category.name]),
    );

    return selectedPromotion.categoryIds
      .map((categoryId) => categoryMap.get(categoryId))
      .filter((name): name is string => Boolean(name))
      .filter((name, index, array) => array.indexOf(name) === index);
  }, [props.categories, selectedPromotion]);

  const payloadJson = useMemo(
    () =>
      JSON.stringify({
        promotionId: promotionId === "" ? null : promotionId,
        expireDate: expireDate === "" ? null : expireDate,
        isActive: defaultIsActive,
      }),
    [defaultIsActive, expireDate, promotionId],
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

          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
            สถานะการใช้งานของคูปองถูกกำหนดโดยระบบ
            {defaultIsActive ? " และเริ่มต้นเป็นยังไม่ถูกใช้" : " และรายการนี้ถูกใช้แล้ว"}
          </div>

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
                  {selectedCategoryNames.length > 0 ? (
                    selectedCategoryNames.map((categoryName) => (
                      <span
                        key={categoryName}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium"
                      >
                        {categoryName}
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

"use client";

import { useState, useTransition } from "react";

import { apiRequestJson } from "@/lib/api";

type CouponValidationResponse = {
  coupon: {
    id: number;
    code: string;
    expireDate: string | null;
    active: boolean;
    createdAt: string | null;
    promotionId: number;
    promotionName: string;
    discountValue: string | number | null;
    allowedCategoryIds?: number[] | null;
  };
  categories: Array<{
    id: number;
    name: string;
  }>;
};

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

function formatMoney(value: string | number | null) {
  if (value === null || value === undefined) return "-";
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numberValue)) return String(value);
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(numberValue);
}

export default function CouponCodeChecker() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CouponValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setError(null);
        const response = await apiRequestJson<CouponValidationResponse>(
          "/api/coupons/validate",
          {
            method: "POST",
            body: { code },
          },
        );
        setResult(response);
      } catch (submitError) {
        const message =
          submitError instanceof Error ? submitError.message : "ไม่สามารถตรวจสอบคูปองได้";
        setResult(null);
        setError(message);
      }
    });
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">ตรวจสอบโค้ดคูปอง</h2>
          <p className="text-sm text-stone-600">
            กรอกโค้ดคูปองเพื่อดูรายละเอียดและหมวดหมู่ที่ร่วมรายการ
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="เช่น WELCOME100"
          className="h-11 flex-1 rounded-2xl border border-stone-200 bg-white px-4 text-stone-900 outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={isPending || code.trim() === ""}
          className="h-11 rounded-2xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-stone-900">
                {result.coupon.code}
              </h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  result.coupon.active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-stone-200 text-stone-700"
                }`}
              >
                {result.coupon.active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-stone-700">
              <div>โปรโมชั่น: {result.coupon.promotionName}</div>
              <div>ส่วนลด: {formatMoney(result.coupon.discountValue)}</div>
              <div>หมดอายุ: {formatDateTime(result.coupon.expireDate)}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-sm font-medium text-stone-900">หมวดหมู่ที่ร่วมรายการ</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.categories.length > 0 ? (
                result.categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-sm"
                  >
                    {category.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-600">คูปองนี้ใช้ได้กับทุกหมวดหมู่</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

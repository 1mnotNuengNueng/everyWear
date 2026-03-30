import Link from "next/link";

import CouponCodeChecker from "./_components/CouponCodeChecker";
import { deleteCouponAction, updateCouponStatusAction } from "./actions";
import { apiGetJson } from "@/lib/api";

export const dynamic = "force-dynamic";

type CouponSummary = {
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

export default async function CouponsPage() {
  const coupons = await apiGetJson<CouponSummary[]>("/api/coupons");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_45%,#ffffff_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="overflow-hidden rounded-[32px] bg-stone-900 text-stone-50 shadow-xl">
          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:px-10">
            <div>
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                Coupon Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                จัดการคูปองและตรวจสอบการใช้งานได้จากหน้าเดียว
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
                ดูรายการคูปองทั้งหมด สร้างคูปองใหม่ เปิดหรือปิดสถานะอย่างรวดเร็ว
                พร้อมตรวจสอบโค้ดคูปองและหมวดหมู่ที่ร่วมรายการได้ทันที
              </p>
            </div>

            <div className="grid gap-4 rounded-[28px] bg-white/8 p-5">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-stone-300">จำนวนคูปองทั้งหมด</div>
                <div className="mt-2 text-3xl font-semibold">{coupons.length}</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-stone-300">คูปองที่เปิดใช้งาน</div>
                <div className="mt-2 text-3xl font-semibold">
                  {coupons.filter((coupon) => coupon.active).length}
                </div>
              </div>
              <Link
                href="/coupons/new"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-amber-500 px-5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
              >
                สร้างคูปองใหม่
              </Link>
            </div>
          </div>
        </section>

        <CouponCodeChecker />

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">รายการคูปอง</h2>
              <p className="mt-1 text-sm text-stone-600">
                แก้ไขข้อมูล เปลี่ยนสถานะ หรือดูเงื่อนไขการใช้งานของคูปองแต่ละรายการ
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-4"
            >
              กลับหน้าแรก
            </Link>
          </div>

          {coupons.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-600">
              ยังไม่มีคูปองในระบบ
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {coupons.map((coupon) => (
                <article
                  key={coupon.id}
                  className="grid gap-5 rounded-3xl border border-stone-200 bg-stone-50 p-5 lg:grid-cols-[minmax(0,1fr)_320px]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold tracking-tight text-stone-900">
                        {coupon.code}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          coupon.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {coupon.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                      <div>โปรโมชั่น: {coupon.promotionName}</div>
                      <div>ส่วนลด: {formatMoney(coupon.discountValue)}</div>
                      <div>หมดอายุ: {formatDateTime(coupon.expireDate)}</div>
                      <div>สร้างเมื่อ: {formatDateTime(coupon.createdAt)}</div>
                    </div>
                    <div className="mt-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        หมวดหมู่ที่ร่วมรายการ
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {coupon.allowedCategoryIds && coupon.allowedCategoryIds.length > 0 ? (
                          coupon.allowedCategoryIds.map((categoryId) => (
                            <span
                              key={categoryId}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-sm"
                            >
                              Category #{categoryId}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-stone-600">ใช้ได้กับทุกหมวดหมู่</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 self-start rounded-2xl bg-white p-4 shadow-sm">
                    <Link
                      href={`/coupons/${coupon.id}/edit`}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-stone-200 px-4 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
                    >
                      แก้ไขคูปอง
                    </Link>
                    <form
                      action={updateCouponStatusAction.bind(null, coupon.id, !coupon.active)}
                    >
                      <button
                        type="submit"
                        className={`h-11 w-full rounded-2xl px-4 text-sm font-semibold transition ${
                          coupon.active
                            ? "bg-stone-900 text-white hover:bg-stone-800"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {coupon.active ? "ปิดใช้งานคูปอง" : "เปิดใช้งานคูปอง"}
                      </button>
                    </form>
                    <form action={deleteCouponAction.bind(null, coupon.id)}>
                      <button
                        type="submit"
                        className="h-11 w-full rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        ลบคูปอง
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  allowedCategories?: Array<{ id: number; name: string }> | null;
  usedOrderIds?: number[] | null;
};

type StatusFilter = "all" | "available" | "used";

const PAGE_SIZE = 8;

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

function formatDiscountPercent(value: string | number | null) {
  if (value === null || value === undefined) return "-";
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numberValue)) return String(value);
  return `${numberValue}%`;
}

export default function CouponsList(props: {
  coupons: CouponSummary[];
  deleteCouponAction: (couponId: number) => Promise<void>;
}) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [promotionFilter, setPromotionFilter] = useState<string>("all");

  const promotionOptions = useMemo(() => {
    return Array.from(
      new Map(
        props.coupons.map((coupon) => [
          coupon.promotionId,
          { id: coupon.promotionId, name: coupon.promotionName },
        ]),
      ).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [props.coupons]);

  const filteredCoupons = useMemo(() => {
    let nextCoupons = props.coupons;

    if (statusFilter === "available") {
      nextCoupons = nextCoupons.filter((coupon) => coupon.active);
    } else if (statusFilter === "used") {
      nextCoupons = nextCoupons.filter((coupon) => !coupon.active);
    }

    if (promotionFilter !== "all") {
      nextCoupons = nextCoupons.filter(
        (coupon) => String(coupon.promotionId) === promotionFilter,
      );
    }

    return nextCoupons;
  }, [promotionFilter, props.coupons, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, promotionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedCoupons = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCoupons.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCoupons]);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">รายการคูปอง</h2>
          <p className="mt-1 text-sm text-stone-600">
            ดูสถานะการถูกใช้งานของคูปอง เลขออเดอร์ที่ใช้ โปรโมชั่น และหมวดหมู่ที่ร่วมรายการ
          </p>
        </div>
        <div className="text-sm text-stone-500">
          หน้า {currentPage} / {totalPages}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("available")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === "available"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            ยังไม่ถูกใช้
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("used")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === "used"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            ถูกใช้แล้ว
          </button>
        </div>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-stone-700">กรองตามโปรโมชั่น</span>
          <select
            value={promotionFilter}
            onChange={(event) => setPromotionFilter(event.target.value)}
            className="h-11 min-w-64 rounded-2xl border border-stone-200 bg-white px-4 text-stone-900 outline-none focus:border-amber-500"
          >
            <option value="all">ทุกโปรโมชั่น</option>
            {promotionOptions.map((promotion) => (
              <option key={promotion.id} value={String(promotion.id)}>
                {promotion.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredCoupons.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-600">
          ไม่พบคูปองตามตัวกรองที่เลือก
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4">
            {pagedCoupons.map((coupon) => {
              const usedOrderIds = coupon.usedOrderIds ?? [];
              const allowedCategories = coupon.allowedCategories ?? [];

              return (
                <article
                  key={coupon.id}
                  className="grid gap-5 rounded-3xl border border-stone-200 bg-stone-50 p-5 lg:grid-cols-[minmax(0,1fr)_280px]"
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
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {coupon.active ? "ยังไม่ถูกใช้" : "ถูกใช้แล้ว"}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                      <div>โปรโมชั่น: {coupon.promotionName}</div>
                      <div>ส่วนลด: {formatDiscountPercent(coupon.discountValue)}</div>
                      <div>หมดอายุ: {formatDateTime(coupon.expireDate)}</div>
                      <div>สร้างเมื่อ: {formatDateTime(coupon.createdAt)}</div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        ใช้ในออเดอร์
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {usedOrderIds.length > 0 ? (
                          usedOrderIds.map((orderId) => (
                            <Link
                              key={orderId}
                              href={`/orders/${orderId}`}
                              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                            >
                              Order #{orderId}
                            </Link>
                          ))
                        ) : (
                          <span className="text-sm text-stone-600">ยังไม่ถูกใช้ในออเดอร์ใด</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        หมวดหมู่ที่ร่วมรายการ
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {allowedCategories.length > 0 ? (
                          allowedCategories.map((category) => (
                            <span
                              key={category.id}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-sm"
                            >
                              {category.name}
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
                    <form action={props.deleteCouponAction.bind(null, coupon.id)}>
                      <button
                        type="submit"
                        className="h-11 w-full rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        ลบคูปอง
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-5">
            <div className="text-sm text-stone-500">
              แสดง {pagedCoupons.length} รายการ จากทั้งหมด {filteredCoupons.length} รายการ
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-10 rounded-2xl border border-stone-200 px-4 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-10 rounded-2xl border border-stone-200 px-4 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

import Link from "next/link";

import { apiGetJson } from "@/lib/api";

import CouponCodeChecker from "./_components/CouponCodeChecker";
import CouponsList from "./_components/CouponsList";
import { deleteCouponAction } from "./actions";

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
  allowedCategories?: Array<{ id: number; name: string }> | null;
  usedOrderIds?: number[] | null;
};

type CategoryOption = {
  id: number;
  name: string;
};

function mergeCategoryNames(
  coupons: CouponSummary[],
  categories: CategoryOption[],
): CouponSummary[] {
  const categoryNameMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return coupons.map((coupon) => {
    if (coupon.allowedCategories && coupon.allowedCategories.length > 0) {
      return coupon;
    }

    const allowedCategories = (coupon.allowedCategoryIds ?? [])
      .map((categoryId) => {
        const categoryName = categoryNameMap.get(categoryId);
        return categoryName ? { id: categoryId, name: categoryName } : null;
      })
      .filter(
        (category): category is { id: number; name: string } => category !== null,
      );

    return {
      ...coupon,
      allowedCategories,
    };
  });
}

export default async function CouponsPage() {
  const [coupons, categories] = await Promise.all([
    apiGetJson<CouponSummary[]>("/api/coupons"),
    apiGetJson<CategoryOption[]>("/api/categories").catch(() => []),
  ]);

  const normalizedCoupons = mergeCategoryNames(coupons, categories);
  const availableCoupons = normalizedCoupons.filter((coupon) => coupon.active).length;
  const usedCoupons = normalizedCoupons.filter(
    (coupon) => (coupon.usedOrderIds?.length ?? 0) > 0,
  ).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff1e6_0%,#fff8f1_28%,#f9fafb_60%,#ffffff_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="relative overflow-hidden rounded-[28px] border border-amber-100 bg-white/90 shadow-[0_18px_60px_rgba(120,53,15,0.08)] backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#f59e0b_0%,#fb923c_48%,#fdba74_100%)]" />
          <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-amber-200/20 blur-2xl" />
          <div className="absolute left-8 top-10 h-20 w-20 rounded-full bg-orange-200/20 blur-2xl" />

          <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,1.25fr)_300px] lg:px-8">
            <div>
              <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                Coupon Center
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                จัดการคูปองในหน้าเดียว
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                ดูสถานะการใช้งาน โปรโมชั่นที่ผูกอยู่ หมวดหมู่ที่ร่วมรายการ และตรวจสอบโค้ดคูปองได้จากหน้านี้
              </p>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-stone-200/80 bg-stone-50/90 p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <div className="text-xs font-medium text-stone-500">ทั้งหมด</div>
                  <div className="mt-1 text-2xl font-semibold text-stone-900">
                    {normalizedCoupons.length}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 shadow-sm">
                  <div className="text-xs font-medium text-emerald-700">ยังไม่ใช้</div>
                  <div className="mt-1 text-2xl font-semibold text-emerald-800">
                    {availableCoupons}
                  </div>
                </div>
                <div className="rounded-2xl bg-amber-50 px-4 py-3 shadow-sm">
                  <div className="text-xs font-medium text-amber-700">ใช้แล้ว</div>
                  <div className="mt-1 text-2xl font-semibold text-amber-800">
                    {usedCoupons}
                  </div>
                </div>
              </div>

              <Link
                href="/coupons/new"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                สร้างคูปองใหม่
              </Link>
            </div>
          </div>
        </section>

        <CouponCodeChecker categories={categories} />

        <CouponsList
          coupons={normalizedCoupons}
          categories={categories}
          deleteCouponAction={deleteCouponAction}
        />
      </main>
    </div>
  );
}

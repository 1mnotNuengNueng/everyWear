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

export default async function CouponsPage() {
  const coupons = await apiGetJson<CouponSummary[]>("/api/coupons");
  const availableCoupons = coupons.filter((coupon) => coupon.active).length;
  const usedCoupons = coupons.filter((coupon) => (coupon.usedOrderIds?.length ?? 0) > 0).length;

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
                จัดการคูปองและติดตามการใช้งานได้จากหน้าเดียว
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
                ส่วนลดของคูปองในหน้านี้แสดงเป็นเปอร์เซ็นต์ และสามารถดูได้ว่าคูปองไหนถูกใช้ไปแล้ว
                พร้อมเลขออเดอร์ที่ใช้คูปองนั้น
              </p>
            </div>

            <div className="grid gap-4 rounded-[28px] bg-white/8 p-5">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-stone-300">จำนวนคูปองทั้งหมด</div>
                <div className="mt-2 text-3xl font-semibold">{coupons.length}</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-stone-300">คูปองที่ยังไม่ถูกใช้</div>
                <div className="mt-2 text-3xl font-semibold">{availableCoupons}</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-stone-300">คูปองที่ถูกใช้แล้ว</div>
                <div className="mt-2 text-3xl font-semibold">{usedCoupons}</div>
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

        <CouponsList coupons={coupons} deleteCouponAction={deleteCouponAction} />
      </main>
    </div>
  );
}

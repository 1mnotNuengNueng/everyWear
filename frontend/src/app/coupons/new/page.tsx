import Link from "next/link";

import { apiGetJson } from "@/lib/api";

import CouponUpsertForm from "../_components/CouponUpsertForm";
import { createCouponAction } from "../actions";

export const dynamic = "force-dynamic";

type PromotionOption = {
  id: number;
  name: string;
  discountValue: string | number | null;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  categoryIds?: number[] | null;
};

export default async function NewCouponPage() {
  const promotions = await apiGetJson<PromotionOption[]>("/api/promotions");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]">
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              สร้างคูปอง
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              เลือกโปรโมชั่น กำหนดวันหมดอายุ และสถานะเริ่มต้นของคูปอง
            </p>
          </div>
          <Link
            href="/coupons"
            className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-4"
          >
            กลับไปหน้าคูปอง
          </Link>
        </div>

        <CouponUpsertForm
          mode="create"
          promotions={promotions}
          action={createCouponAction}
        />
      </main>
    </div>
  );
}

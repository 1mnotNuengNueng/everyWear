import Link from "next/link";
import { notFound } from "next/navigation";

import { apiGet, apiGetJson } from "@/lib/api";

import CouponUpsertForm from "../../_components/CouponUpsertForm";
import { updateCouponAction } from "../../actions";

export const dynamic = "force-dynamic";

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

type CouponDetail = {
  id: number;
  code: string;
  expireDate: string | null;
  active: boolean;
  promotionId: number;
};

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const couponId = Number(id);
  if (!Number.isFinite(couponId)) notFound();

  const [promotions, categories, coupon] = await Promise.all([
    apiGetJson<PromotionOption[]>("/api/promotions"),
    apiGetJson<CategoryOption[]>("/api/categories").catch(() => []),
    (async () => {
      const response = await apiGet(`/api/coupons/${couponId}`);
      if (response.status === 404) notFound();
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as CouponDetail;
    })(),
  ]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]">
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              แก้ไขคูปอง {coupon.code}
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              เปลี่ยนโปรโมชั่น วันหมดอายุ หรือสถานะเริ่มต้นของคูปองรายการนี้
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
          mode="edit"
          promotions={promotions}
          categories={categories}
          initial={{
            id: coupon.id,
            code: coupon.code,
            expireDate: coupon.expireDate,
            isActive: coupon.active,
            promotionId: coupon.promotionId,
          }}
          action={updateCouponAction.bind(null, couponId)}
        />
      </main>
    </div>
  );
}

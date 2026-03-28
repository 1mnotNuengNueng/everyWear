import Link from "next/link";

import { apiGetJson } from "@/lib/api";

import { createOrderAction } from "../actions";
import OrderUpsertForm from "../_components/OrderUpsertForm";

export const dynamic = "force-dynamic";

type ItemOption = {
  id: number;
  name: string;
  price: string | number | null;
  categoryId: number | null;
  categoryName: string | null;
};

type CouponOption = {
  id: number;
  code: string;
  discountValue: string | number | null;
  promotionName: string;
  allowedCategoryIds?: number[] | null;
};

export default async function NewOrderPage() {
  const [items, coupons] = await Promise.all([
    apiGetJson<ItemOption[]>("/api/items"),
    apiGetJson<CouponOption[]>("/api/coupons"),
  ]);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-5xl flex-1 mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              สร้างออเดอร์
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              เพิ่มรายการสินค้า และเลือก/กรอกคูปองได้
            </p>
          </div>
          <Link
            href="/orders"
            className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-50"
          >
            กลับไปหน้าออเดอร์
          </Link>
        </div>

        <OrderUpsertForm
          mode="create"
          items={items}
          coupons={coupons}
          action={createOrderAction}
        />
      </main>
    </div>
  );
}

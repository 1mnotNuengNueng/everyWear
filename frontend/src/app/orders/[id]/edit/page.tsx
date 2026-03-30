import Link from "next/link";
import { notFound } from "next/navigation";

import { apiGet } from "@/lib/api";
import { apiGetJson } from "@/lib/api";

import OrderUpsertForm from "../../_components/OrderUpsertForm";
import { updateOrderAction } from "../../actions";

export const dynamic = "force-dynamic";

type ItemOption = {
  id: number;
  name: string;
  price: string | number | null;
  categoryId: number | null;
  categoryName: string | null;
};

type OrderDetail = {
  id: number;
  couponId: number | null;
  couponCode: string | null;
  orderDate: string | null;
  items: Array<{
    itemId: number | null;
    quantity: number;
    unitPrice: string | number | null;
  }>;
};

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();

  const [items, order] = await Promise.all([
    // NOTE: Depends on backend Items API (friend-owned): GET /api/items
    apiGetJson<ItemOption[]>("/api/items"),
    (async () => {
      const response = await apiGet(`/api/orders/${orderId}`);
      if (response.status === 404) notFound();
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as OrderDetail;
    })(),
  ]);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-5xl flex-1 mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              แก้ไขออเดอร์ #{order.id}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              แก้ไขรายการสินค้า/คูปอง แล้วบันทึก
            </p>
          </div>
          <Link
            href={`/orders/${order.id}`}
            className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-50"
          >
            กลับไปหน้ารายละเอียด
          </Link>
        </div>

        <OrderUpsertForm
          mode="edit"
          items={items}
          initial={order}
          action={updateOrderAction.bind(null, orderId)}
        />
      </main>
    </div>
  );
}

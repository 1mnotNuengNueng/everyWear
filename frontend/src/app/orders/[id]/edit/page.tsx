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
    <div className="h-full flex flex-col">
      {/* ส่วนหัวของหน้า (Header) */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ✏️ แก้ไขออเดอร์ #{order.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ปรับปรุงรายการสินค้า คูปองส่วนลด แล้วกดบันทึกข้อมูล
          </p>
        </div>
        <Link
          href={`/orders/${order.id}`}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm transition font-medium"
        >
          ยกเลิก
        </Link>
      </div>

      {/* แบบฟอร์มแก้ไขออเดอร์ */}
      {/* หมายเหตุ: ตัว <OrderUpsertForm> อาจจะมี Dark Mode ติดอยู่ในไฟล์ของมันเองด้วยนะครับ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1 overflow-y-auto">
        <OrderUpsertForm
          mode="edit"
          items={items}
          initial={order}
          action={updateOrderAction.bind(null, orderId)}
        />
      </div>
    </div>
  );
}
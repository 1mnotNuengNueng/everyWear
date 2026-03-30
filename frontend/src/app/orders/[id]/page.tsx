import Link from "next/link";
import { notFound } from "next/navigation";

import { apiGet } from "@/lib/api";
import { deleteOrderAction } from "../actions";

export const dynamic = "force-dynamic";

type OrderItem = {
	  itemId: number | null;
	  itemName: string | null;
	  size: string | null;
	  quantity: number;
	  unitPrice: string | number | null;
	  lineTotal: string | number | null;
	};

type OrderDetail = {
  id: number;
  status: string;
  couponId: number | null;
  couponCode: string | null;
  orderDate: string | null;
  createdAt: string | null;
  totalPrice: string | number | null;
  discountAmount: string | number | null;
  netValue: string | number | null;
  items: OrderItem[];
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await apiGet(`/api/orders/${id}`);
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const order = (await response.json()) as OrderDetail;

  return (
    <div className="h-full flex flex-col">
      {/* ส่วนหัวของหน้า (Header) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              รายละเอียดออเดอร์ #{order.id}
            </h1>
            {order.status === "CANCELLED" ? (
              <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                ยกเลิกแล้ว
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">
                สำเร็จ
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <div>📅 วันที่สั่งซื้อ: <span className="text-gray-700">{formatDateTime(order.orderDate)}</span></div>
            <div>⏱️ สร้างเมื่อ: <span className="text-gray-700">{formatDateTime(order.createdAt)}</span></div>
            <div>
              🎟️ คูปอง:{" "}
              {order.couponCode ? (
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {order.couponCode}
                </span>
              ) : (
                <span className="text-gray-400">ไม่มี</span>
              )}
            </div>
          </div>
        </div>

        {/* ปุ่ม Action ต่างๆ */}
        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className="h-10 inline-flex items-center justify-center rounded bg-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
          >
            กลับหน้ารวม
          </Link>
          {order.status !== "CANCELLED" ? (
            <Link
              href={`/orders/${order.id}/edit`}
              className="h-10 inline-flex items-center justify-center rounded bg-yellow-100 px-4 text-sm font-medium text-yellow-700 hover:bg-yellow-200 transition"
            >
              ✏️ แก้ไขออเดอร์
            </Link>
          ) : null}
          <form action={deleteOrderAction.bind(null, order.id)}>
            <button
              type="submit"
              className="h-10 inline-flex items-center justify-center rounded bg-red-100 px-4 text-sm font-medium text-red-700 hover:bg-red-200 transition disabled:cursor-not-allowed disabled:opacity-50"
              disabled={order.status === "CANCELLED"}
            >
              🗑️ ยกเลิกออเดอร์
            </button>
          </form>
        </div>
      </div>

      {/* ตารางรายการสินค้า */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="grid grid-cols-12 gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
          <div className="col-span-4">รายการสินค้า</div>
          <div className="col-span-2">ไซส์</div>
          <div className="col-span-2 text-right">จำนวน</div>
          <div className="col-span-2 text-right">ราคาต่อชิ้น</div>
          <div className="col-span-2 text-right">รวม</div>
        </div>

        {order.items.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            ไม่พบรายการสินค้าในออเดอร์นี้
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {order.items.map((item, index) => (
              <li
                key={`${item.itemId ?? "unknown"}-${index}`}
                className="grid grid-cols-12 gap-3 px-6 py-4 text-sm items-center hover:bg-gray-50"
              >
                <div className="col-span-4 font-bold text-gray-800">
                  {item.itemName ?? `Item #${item.itemId ?? "-"}`}
                </div>
                <div className="col-span-2 text-gray-600">
                  {item.size ?? "-"}
                </div>
                <div className="col-span-2 text-right text-gray-600">
                  {item.quantity}
                </div>
                <div className="col-span-2 text-right text-gray-600">
                  {formatMoney(item.unitPrice)}
                </div>
                <div className="col-span-2 text-right font-black text-blue-600">
                  {formatMoney(item.lineTotal)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* สรุปยอดเงิน (กล่องด้านล่างขวา) */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">ราคารวมก่อนลด</span>
            <span className="font-medium text-gray-800">
              {formatMoney(order.totalPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">ส่วนลดที่ได้</span>
            <span className="font-medium text-red-500">
              -{formatMoney(order.discountAmount)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-bold">ยอดสุทธิ</span>
              <span className="text-2xl font-black text-blue-600">
                {formatMoney(order.netValue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

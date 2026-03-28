import Link from "next/link";
import { notFound } from "next/navigation";

import { apiGet } from "@/lib/api";
import { deleteOrderAction } from "../actions";

export const dynamic = "force-dynamic";

type OrderItem = {
  itemId: number | null;
  itemName: string | null;
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
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-5xl flex-1 mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                รายละเอียดออเดอร์ #{order.id}
              </h1>
              {order.status === "CANCELLED" ? (
                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-200">
                  CANCELLED
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              <div>วันที่สั่งซื้อ: {formatDateTime(order.orderDate)}</div>
              <div>สร้างเมื่อ: {formatDateTime(order.createdAt)}</div>
              <div>
                คูปอง:{" "}
                {order.couponCode ? (
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {order.couponCode}
                  </span>
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {order.status !== "CANCELLED" ? (
              <Link
                href={`/orders/${order.id}/edit`}
                className="h-10 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
              >
                แก้ไข
              </Link>
            ) : null}
            <form action={deleteOrderAction.bind(null, order.id)}>
              <button
                type="submit"
                className="h-10 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={order.status === "CANCELLED"}
              >
                ยกเลิกออเดอร์
              </button>
            </form>
            <Link
              href="/orders"
              className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-50"
            >
              กลับไปหน้าออเดอร์
            </Link>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <div className="col-span-6">สินค้า</div>
            <div className="col-span-2 text-right">จำนวน</div>
            <div className="col-span-2 text-right">ราคาต่อชิ้น</div>
            <div className="col-span-2 text-right">รวม</div>
          </div>

          {order.items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
              ไม่พบรายการสินค้าในออเดอร์นี้
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items.map((item, index) => (
                <li
                  key={`${item.itemId ?? "unknown"}-${index}`}
                  className="grid grid-cols-12 gap-3 px-4 py-4 text-sm"
                >
                  <div className="col-span-6 font-medium text-zinc-900 dark:text-zinc-50">
                    {item.itemName ?? `Item #${item.itemId ?? "-"}`}
                  </div>
                  <div className="col-span-2 text-right text-zinc-700 dark:text-zinc-200">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-zinc-700 dark:text-zinc-200">
                    {formatMoney(item.unitPrice)}
                  </div>
                  <div className="col-span-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
                    {formatMoney(item.lineTotal)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 grid gap-3 justify-end">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                ราคารวมก่อนลด
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {formatMoney(order.totalPrice)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                ส่วนลดที่ได้
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {formatMoney(order.discountAmount)}
              </span>
            </div>
            <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  ราคาที่ลดแล้ว (สุทธิ)
                </span>
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatMoney(order.netValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

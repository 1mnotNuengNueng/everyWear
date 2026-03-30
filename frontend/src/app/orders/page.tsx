import Link from "next/link";

import { apiGetJson } from "@/lib/api";
import { deleteOrderAction } from "./actions";

export const dynamic = "force-dynamic";

type OrderSummary = {
  id: number;
  status: string;
  orderDate: string | null;
  totalPrice: string | number | null;
  discountAmount: string | number | null;
  netValue: string | number | null;
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

export default async function OrdersPage() {
  const orders = await apiGetJson<OrderSummary[]>("/api/orders");

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-5xl flex-1 mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              ออเดอร์
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              เลือกออเดอร์เพื่อดูรายละเอียดสินค้าและยอดรวม
            </p>
          </div>
	          <div className="flex items-center gap-3">
	            <Link
	              href="/orders/new"
	              className="h-10 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
	            >
              สร้างออเดอร์
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-50"
            >
              กลับหน้าแรก
            </Link>
          </div>
        </div>

	        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
	          <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
	            <div className="col-span-2">Order</div>
	            <div className="col-span-2">Status</div>
	            <div className="col-span-5">วันที่</div>
	            <div className="col-span-2 text-right">สุทธิ</div>
	            <div className="col-span-1 text-right">ลบ</div>
	          </div>

          {orders.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
              ยังไม่มีออเดอร์
            </div>
	          ) : (
	            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
	              {orders.map((order) => (
	                <li key={order.id}>
	                  <div className="grid grid-cols-12 gap-3 px-4 py-4 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
	                    <Link href={`/orders/${order.id}`} className="contents">
	                      <div className="col-span-2 font-medium text-zinc-900 dark:text-zinc-50">
	                        #{order.id}
	                      </div>
	                      <div className="col-span-2">
	                        {order.status === "CANCELLED" ? (
	                          <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-200">
	                            CANCELLED
	                          </span>
	                        ) : (
	                          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
	                            ACTIVE
	                          </span>
	                        )}
	                      </div>
	                      <div className="col-span-5 text-zinc-700 dark:text-zinc-200">
	                        {formatDateTime(order.orderDate)}
	                      </div>
	                      <div className="col-span-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
	                        {formatMoney(order.netValue)}
	                      </div>
	                    </Link>

	                    <div className="col-span-1 flex justify-end">
	                      {order.status === "CANCELLED" ? (
	                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
	                          -
	                        </span>
	                      ) : (
	                        <form action={deleteOrderAction.bind(null, order.id, "/orders")}>
	                          <button
	                            type="submit"
	                            className="h-8 inline-flex items-center justify-center rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
	                          >
	                            ลบ
	                          </button>
	                        </form>
	                      )}
	                    </div>
	                  </div>
	                </li>
	              ))}
	            </ul>
	          )}
        </div>
      </main>
    </div>
  );
}

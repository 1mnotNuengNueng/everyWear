"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import "./globals.css";

// หมายเหตุ: หากคุณมีฟอนต์ Geist ให้ Import กลับมาด้วยนะครับ 
// เช่น: import { geistSans, geistMono } from "./fonts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { path: "/orders", label: "จัดการออเดอร์", icon: "📝" },
    { path: "/promotions", label: "จัดการโปรโมชั่น", icon: "🏷️" },
    { path: "/coupons", label: "จัดการคูปอง", icon: "🎟️" },
    { path: "/items", label: "จัดการสินค้า", icon: "👕" },
    { path: "/categories", label: "จัดการหมวดหมู่สินค้า", icon: "📂" },
    { path: "/stock", label: "จัดการสต็อก", icon: "📦" },
  ];

  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full">
        <div className="flex h-screen w-full bg-[#f4f6f8] font-sans overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-64 bg-[#2c3338] text-white flex flex-col shadow-xl z-10">
            <div className="flex items-center justify-center h-20 border-b border-[#40484e] bg-[#22282c]">
              <h1 className="text-2xl font-black tracking-wider text-orange-500">
                every<span className="text-white">Wear</span> <span className="text-sm font-normal text-gray-400">POS</span>
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1">
                {menuItems.map((menu) => {
                  const isActive = pathname === menu.path || pathname.startsWith(menu.path + '/');
                  return (
                    <li key={menu.path}>
                      <Link
                        href={menu.path}
                        className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[#2389d7] text-white border-l-4 border-white"
                            : "text-gray-400 hover:bg-[#3b434a] hover:text-white border-l-4 border-transparent"
                        }`}
                      >
                        <span className="mr-3 text-lg">{menu.icon}</span>
                        {menu.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
              <div className="flex items-center text-sm font-medium text-gray-600">
                <span>📅 {new Date().toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  ระบบออนไลน์
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
          
        </div>
      </body>
    </html>
  );
}
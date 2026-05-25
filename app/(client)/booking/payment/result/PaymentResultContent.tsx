"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Ticket,
  Clapperboard,
  HelpCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic"; // 🔥 FIX BUILD SSR

export default function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [count, setCount] = useState(5);

  const responseCode = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef") || "N/A";
  const amount = Number(searchParams.get("vnp_Amount") || 0) / 100;

  const isSuccess = responseCode === "00";
  const isCancelled = responseCode === "24";

  // ================= TOAST =================
  useEffect(() => {
    if (isSuccess) {
      toast.success("Thanh toán thành công 🎉");
    } else if (isCancelled) {
      toast.error("Bạn đã hủy thanh toán 🛑");
    } else if (responseCode) {
      toast.error("Giao dịch thất bại ❌");
    }
  }, [isSuccess, isCancelled, responseCode]);

  // ================= COUNTDOWN =================
  useEffect(() => {
    if (!isSuccess) return;

    if (count === 0) {
      router.push("/");
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isSuccess, router]);

  // ================= UI =================
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Toaster />

      {isSuccess ? (
        <div className="text-center space-y-4">
          <CheckCircle2 className="text-green-500 mx-auto" size={60} />

          <h1 className="text-2xl font-bold">Thanh toán thành công</h1>

          <p>Mã đơn: #{txnRef}</p>
          <p>Số tiền: {amount.toLocaleString()}đ</p>

          <p className="text-gray-400">
            Tự động chuyển về trang chủ sau {count}s
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-white text-black rounded"
          >
            Về trang chủ <ArrowRight className="inline ml-2" size={16} />
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <XCircle className="text-red-500 mx-auto" size={60} />

          <h1 className="text-2xl font-bold">
            {isCancelled ? "Đã hủy thanh toán" : "Thanh toán thất bại"}
          </h1>

          <p>Mã đơn: #{txnRef}</p>

          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-white text-black rounded"
          >
            Về trang chủ
          </button>
        </div>
      )}
    </div>
  );
}
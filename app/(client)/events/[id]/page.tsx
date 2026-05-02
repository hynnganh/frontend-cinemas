"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  BookmarkCheck,
  Gift,
  Zap,
  Calendar,
  Clock
} from "lucide-react";
import { apiRequest, BASE_URL } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  /* ================= IMAGE FIX ================= */

  const getImageUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  /* ================= FORMAT ================= */

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit"
    });
  };

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        const requests = [
          apiRequest(`/api/v1/promotions/${params.id}`),
          apiRequest(`/api/v1/vouchers/promotion/${params.id}`)
        ];

        if (token)
          requests.push(apiRequest(`/api/v1/vouchers/my-vouchers`));

        const responses = await Promise.all(requests);

        /* EVENT */
        const eventJson = await responses[0].json();
        if (responses[0].ok) setEvent(eventJson.data);

        /* VOUCHERS */
        const voucherJson = await responses[1].json();
        if (responses[1].ok)
          setVouchers(voucherJson.data || []);

        /* SAVED VOUCHERS */
        if (responses[2]?.ok) {
          const myVouchersJson = await responses[2].json();
          setSavedIds(
            (myVouchersJson.data || []).map((v: any) => v.id)
          );
        }
      } catch {
        toast.error("Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  /* ================= SAVE VOUCHER ================= */

  const handleSaveVoucher = async (voucherId: number) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (!token) {
      toast.error("Đăng nhập bạn nhé!");
      return;
    }

    setIsSavingId(voucherId);

    try {
      const res = await apiRequest(
        `/api/v1/vouchers/save/${voucherId}`,
        { method: "POST" }
      );

      if (res.ok) {
        setSavedIds((prev) => [...prev, voucherId]);
        toast.success("Đã lưu mã!");
      }
    } finally {
      setIsSavingId(null);
    }
  };

  /* ================= LOADING ================= */

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={24} />
      </div>
    );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 pb-20 font-sans">
      <Toaster position="top-center" />

      {/* ===== HERO IMAGE ===== */}
      <div className="relative h-[35vh] w-full overflow-hidden bg-zinc-900">

        {event?.thumbnail ? (
          <img
            src={getImageUrl(event.thumbnail)}
            alt={event.title}
            className="w-full h-full object-cover opacity-50"
            onError={(e) =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <Gift size={48} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all z-50"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-10">

          {/* ===== LEFT CONTENT ===== */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={12} className="text-red-500 fill-red-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-red-500">
                Promotion
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase mb-6 text-white">
              {event?.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 text-[10px] font-bold uppercase text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{formatDate(event?.createdAt)}</span>
              </div>

              {event?.movie && (
                <div className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">
                  {event.movie.title}
                </div>
              )}
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
              <div
                className="text-zinc-400 text-sm leading-relaxed prose prose-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: event?.content }}
              />
            </div>
          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div className="w-full md:w-[320px]">
            <div className="sticky top-10 space-y-6">

              <h2 className="text-[10px] font-black uppercase text-zinc-500">
                Voucher dành cho bạn
              </h2>

              <div className="grid gap-3">
                {vouchers.length > 0 ? (
                  vouchers.map((v) => (
                    <div
                      key={v.id}
                      className="flex bg-zinc-900/50 border border-white/5 rounded-2xl p-4"
                    >
                      <div className="flex-1">
                        <div className="text-[8px] text-zinc-500 uppercase">
                          Code: {v.code}
                        </div>

                        <div className="text-lg font-black text-white italic">
                          {v.discountValue
                            ? v.discountValue > 100
                              ? formatCurrency(v.discountValue)
                              : `${Math.round(
                                  v.discountValue * 100
                                )}%`
                            : "Ưu đãi"}
                        </div>

                        <div className="flex gap-1 mt-2 text-[8px] text-zinc-600 uppercase">
                          <Clock size={8} />
                          Hết hạn: {formatDate(v.endDate)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSaveVoucher(v.id)}
                        disabled={
                          savedIds.includes(v.id) ||
                          isSavingId === v.id
                        }
                        className={`ml-4 px-4 rounded-xl ${
                          savedIds.includes(v.id)
                            ? "bg-zinc-800 text-green-500"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {isSavingId === v.id ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : savedIds.includes(v.id) ? (
                          <BookmarkCheck size={16} />
                        ) : (
                          "Lấy"
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-700">
                    CHƯA CÓ MÃ
                  </div>
                )}
              </div>

              <div className="bg-zinc-900/20 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] text-zinc-600">
                  * Áp dụng cho đặt vé trực tuyến. Số lượng có hạn.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
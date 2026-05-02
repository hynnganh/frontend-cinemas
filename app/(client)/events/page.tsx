"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Megaphone, Ticket, ChevronRight } from "lucide-react";
import { apiRequest, getImageUrl } from "@/app/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EventsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await apiRequest("/api/v1/promotions/client/1");

        if (!res.ok) throw new Error("Fetch failed");

        const json = await res.json();

        // Chuẩn hóa response backend
        const list = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];

        setPromotions(list);
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải danh sách sự kiện");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex justify-center items-center bg-black min-h-screen">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-10 pb-20 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="mb-12 border-l-4 border-red-600 pl-6">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            Ưu đãi & Sự kiện
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.3em] mt-2 italic">
            A&K Cinema Exclusive
          </p>
        </header>

        {/* GRID */}
        {promotions.length === 0 ? (
          <div className="text-center py-40 text-zinc-700 uppercase font-black text-xs tracking-[0.5em]">
            Chưa có ưu đãi mới
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((p) => {
              const cleanContent =
                p.content?.replace(/<[^>]*>?/gm, "") || "";

              const imageUrl = getImageUrl(p.thumbnail);

              return (
                <div
                  key={p.id ?? Math.random()}
                  className="group bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:bg-zinc-900/80 transition-all flex flex-col relative"
                >
                  {/* Voucher badge */}
                  {p.voucher?.discountValue > 0 && (
                    <div className="absolute top-4 right-4 z-20 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-2xl flex items-center gap-1">
                      <Ticket size={12} />
                      GIẢM{" "}
                      {Number(
                        p.voucher.discountValue
                      ).toLocaleString()}
                      đ
                    </div>
                  )}

                  {/* IMAGE */}
                  <div className="h-48 bg-zinc-800 relative overflow-hidden">
                    {p.thumbnail ? (
                      <img
                        src={imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Megaphone size={48} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-base font-black uppercase mb-3 line-clamp-1 group-hover:text-red-500 transition-colors italic tracking-tight">
                      {p.title}
                    </h3>

                    <p className="text-xs text-zinc-500 line-clamp-2 mb-6 italic leading-relaxed opacity-80">
                      {cleanContent}
                    </p>

                    <Link href={`/events/${p.id}`} className="mt-auto">
                      <button className="w-full py-3 bg-white text-black text-[11px] font-black uppercase rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2">
                        Xem chi tiết <ChevronRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
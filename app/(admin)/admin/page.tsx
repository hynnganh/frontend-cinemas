"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Ticket,
  Film,
  TrendingUp,
  Loader2,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { apiAdminRequest } from "@/app/lib/api";

/* ================= TYPES ================= */
interface DashboardStats {
  todayRevenue: number;
  todayTickets: number;
  todayShowtimes: number;
  occupancy: number;
}

interface ChartItem {
  day: string;
  revenue: number;
}

/* ================= FORMAT ================= */
const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

/* ================= PAGE ================= */
export default function AdminStatisticsPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayTickets: 0,
    todayShowtimes: 0,
    occupancy: 0,
  });

  const [chartData, setChartData] = useState<ChartItem[]>([]);

  // 👉 lấy user từ localStorage (hoặc redux nếu bạn dùng)
  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : {};

  const cinemaId = user?.managedCinemaItemId;

  /* ================= FETCH ================= */
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const query = cinemaId ? `?cinemaId=${cinemaId}` : "";

      const [dashRes, chartRes] = await Promise.all([
        apiAdminRequest(`/api/v1/reports/dashboard${query}`),
        apiAdminRequest(`/api/v1/reports/revenue-7days${query}`),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setStats(data);
      }

      if (chartRes.ok) {
        const data = await chartRes.json();
        setChartData(data || []);
      }
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#050505] p-6 text-zinc-300">

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">
            Thống kê rạp phim
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Theo dõi doanh thu và hoạt động trong ngày
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="px-5 py-3 rounded-2xl border border-zinc-800 bg-[#0f0f0f] text-xs font-bold uppercase hover:text-white"
        >
          Làm mới
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-red-500" size={32} />
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            <StatCard
              title="Doanh thu hôm nay"
              value={formatVND(stats.todayRevenue)}
              icon={<DollarSign size={18} />}
              color="text-green-500"
            />

            <StatCard
              title="Vé đã bán"
              value={`${stats.todayTickets}`}
              icon={<Ticket size={18} />}
              color="text-red-500"
            />

            <StatCard
              title="Suất chiếu"
              value={`${stats.todayShowtimes}`}
              icon={<Film size={18} />}
              color="text-yellow-500"
            />

            <StatCard
              title="Tỉ lệ lấp đầy"
              value={`${(stats.occupancy || 0).toFixed(0)}%`}
              icon={<TrendingUp size={18} />}
              color="text-cyan-500"
            />
          </div>

          {/* CHART */}
          <div className="mt-6 rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6">

            <div className="mb-6 flex items-center gap-2">
              <BarChart3 className="text-red-500" size={18} />
              <h2 className="text-sm font-black uppercase text-white">
                Doanh thu 7 ngày gần nhất
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>

                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#1f1f1f" vertical={false} />

                <XAxis dataKey="day" stroke="#777" />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;

                    return (
                      <div className="bg-black border border-zinc-800 p-3 rounded-xl text-xs">
                        <p className="text-white font-bold mb-1">{label}</p>
                        <p className="text-red-500 font-black">
                          {Number(payload[0].value).toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                    );
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#dc2626"
                  fill="url(#rev)"
                  strokeWidth={3}
                />
              </AreaChart>

            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= CARD ================= */
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6">
      <p className="text-[10px] font-bold uppercase text-zinc-500">
        {title}
      </p>

      <h3 className="mt-3 text-2xl font-black text-white">
        {value}
      </h3>

      <div className={`mt-4 ${color}`}>{icon}</div>
    </div>
  );
}
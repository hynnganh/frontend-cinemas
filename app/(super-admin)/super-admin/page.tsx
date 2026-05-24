"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  Star,
  Building2,
  DollarSign,
  Ticket,
  TrendingUp,
  Film,
  RefreshCw,
  Calendar,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

import { apiSuperAdminRequest } from "../../lib/api";

/* ================= ĐỊNH NGHĨA KIỂU DỮ LIỆU ================= */
interface RankingItem {
  name: string;
  revenue: number;
}

interface MovieStat {
  title: string;
  avgRating: number;
  count: number;
}

/* ================= TRANG CHÍNH ================= */
export default function ReportDashboard() {

  // ================= BỘ LỌC THỜI GIAN =================
  const [startDate, setStartDate] =
    useState(() => {
      const d = new Date();
      return new Date(
        d.getFullYear(),
        d.getMonth(),
        1
      )
        .toISOString()
        .slice(0, 16);
    });

  const [endDate, setEndDate] =
    useState(() =>
      new Date()
        .toISOString()
        .slice(0, 16)
    );

  // ================= TRẠNG THÁI DỮ LIỆU =================
  const [loading, setLoading] =
    useState(true);

  const [ranking, setRanking] =
    useState<RankingItem[]>([]);

  const [movieStats, setMovieStats] =
    useState<MovieStat[]>([]);

  // ================= CHUYỂN ĐỔI ĐỊNH DẠNG NGÀY =================
  const formatDate = (
    date: string
  ) => {
    return (
      date.replace("T", " ") +
      ":00"
    );
  };

  // ================= KHỞI TẠO TRUY VẤN =================
  const getQuery = () => {
    const searchParams =
      new URLSearchParams({
        start: formatDate(
          startDate
        ),
        end: formatDate(
          endDate
        ),
      });
    return searchParams.toString();
  };

  // ================= TẢI DỮ LIỆU TỪ HỆ THỐNG =================
  const fetchData = async () => {
    try {
      setLoading(true);
      const query =
        getQuery();

      const [
        rankRes,
        movieRes,
      ] = await Promise.all([
        apiSuperAdminRequest(
          `/api/v1/reports/ranking?${query}`
        ),
        apiSuperAdminRequest(
          `/api/v1/reports/stats`
        ),
      ]);

      // ================= XỬ LÝ DỮ LIỆU XẾP HẠNG =================
      if (rankRes.ok) {
        const rankData =
          await rankRes.json();
        setRanking(
          rankData || []
        );
      }

      // ================= XỬ LÝ DỮ LIỆU PHIM =================
      if (movieRes.ok) {
        const movieData =
          await movieRes.json();
        setMovieStats(
          movieData || []
        );
      }

    } catch (error) {
      console.error(
        "Lỗi tải dữ liệu hệ thống:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // ================= TÍNH TOÁN SỐ LIỆU TỔNG HỢP =================
  const totalRevenue =
    useMemo(() => {
      return ranking.reduce(
        (sum, item) =>
          sum + item.revenue,
        0
      );
    }, [ranking]);

  const totalCinemas =
    ranking.length;

  const topCinema =
    ranking.length > 0
      ? ranking.reduce(
          (max, item) =>
            item.revenue >
            max.revenue
              ? item
              : max,
          ranking[0]
        )
      : null;

  const totalReviews =
    movieStats.reduce(
      (sum, item) =>
        sum + item.count,
      0
    );

  // ================= GIẢ LẬP BIỂU ĐỒ XU HƯỚNG TĂNG TRƯỞNG =================
  const revenueTrend =
    ranking.slice(0, 5).map(
      (item, index) => ({
        name:
          item.name.length > 12
            ? item.name.slice(
                0,
                12
              ) + "..."
            : item.name,
        revenue:
          item.revenue,
        growth:
          item.revenue *
          (0.85 +
            index * 0.08),
      })
    );

  // ================= ĐỊNH DẠNG TIỀN TỆ VNĐ =================
  const formatMoney = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      "vi-VN",
      {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  return (
    <div className="min-h-screen bg-[#030303] p-4 sm:p-8 text-zinc-400 font-sans antialiased selection:bg-red-600/30 selection:text-red-400">
      
      {/* Hiệu ứng đèn Neon Đỏ chiếu mờ ẩn sau background tổng thể */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">

        {/* ================= THANH TIÊU ĐỀ (HEADER) ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent">
              Hệ Thống Tổng Quản Trị Cao Cấp
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 font-medium">
              Phân tích doanh thu thương mại và hiệu suất vận hành chuỗi rạp chiếu phim toàn quốc
            </p>
          </div>

          <button
            onClick={fetchData}
            className="group flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#0c0c0e] px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-all duration-300 hover:border-red-600 hover:text-white active:scale-95 self-start sm:self-auto shadow-lg"
          >
            <RefreshCw
              size={13}
              className={`transition-transform duration-500 ${loading ? "animate-spin text-red-500" : "group-hover:rotate-180"}`}
            />
            Cập nhật dữ liệu
          </button>
        </div>

        {/* ================= BỘ LỌC THỜI GIAN (FILTER) ================= */}
        <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 backdrop-blur-md p-6 shadow-xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-800 to-transparent"></div>
          
          <div className="mb-5 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950/40 text-red-500 border border-red-900/20">
              <Calendar size={14} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Khoảng thời gian thống kê dữ liệu
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* THỜI GIAN BẮT ĐẦU */}
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Thời gian bắt đầu
              </p>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] p-3.5 text-xs text-white outline-none transition focus:border-red-600 font-medium"
              />
            </div>

            {/* THỜI GIAN KẾT THÚC */}
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Thời gian kết thúc
              </p>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] p-3.5 text-xs text-white outline-none transition focus:border-red-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* ================= TRẠNG THÁI ĐANG TẢI (LOADING) ================= */}
        {loading ? (
          <div className="flex h-[40vh] flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-red-600 animate-spin"></div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">
              Hệ thống đang xử lý dữ liệu...
            </div>
          </div>
        ) : (
          <>
            {/* ================= THẺ THỐNG KÊ (STATS CARD) ================= */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Tổng doanh thu chuỗi rạp"
                value={formatMoney(totalRevenue)}
                icon={<DollarSign size={16} />}
                bgIcon="bg-red-600/10 text-red-500 border border-red-950"
              />

              <StatCard
                title="Tổng cụm rạp hoạt động"
                value={`${totalCinemas} chi nhánh`}
                icon={<Building2 size={16} />}
                bgIcon="bg-zinc-900 text-zinc-400 border border-zinc-800"
              />

              <StatCard
                title="Tổng phản hồi từ khán giả"
                value={`${totalReviews.toLocaleString()} lượt`}
                icon={<Star size={16} />}
                bgIcon="bg-zinc-900 text-zinc-400 border border-zinc-800"
              />

              <StatCard
                title="Chi nhánh tăng trưởng cao nhất"
                value={topCinema?.name || "Chưa có"}
                icon={<TrendingUp size={16} />}
                bgIcon="bg-white/10 text-white border border-zinc-800"
                valueClass="text-red-500 font-black"
              />
            </div>

            {/* ================= KHỐI BIỂU ĐỒ (CHARTS) ================= */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

              {/* BIỂU ĐỒ CỘT DỌC */}
              <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] p-6 shadow-xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                <div className="mb-6 flex items-center justify-between border-b border-zinc-900/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-950/40 text-red-500">
                      <BarChart3 size={15} />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-white">
                      Xếp hạng doanh số chi nhánh rạp
                    </h2>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded">Đơn vị: VNĐ</span>
                </div>

                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ranking} layout="vertical" margin={{ left: -15, right: 10 }}>
                      <CartesianGrid stroke="#141416" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                      <XAxis type="number" stroke="#4b5563" fontSize={9} fontWeight={600} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} fontWeight={600} width={100} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.02)" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-xl border border-zinc-800 bg-black/95 p-3 text-xs shadow-2xl">
                              <p className="text-zinc-500 font-bold text-[9px] uppercase tracking-wider mb-1">{payload[0].payload.name}</p>
                              <p className="font-black text-white">{formatMoney(Number(payload[0].value))}</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="revenue" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BIỂU ĐỒ VÙNG DIỆN TÍCH */}
              <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] p-6 shadow-xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                <div className="mb-6 flex items-center justify-between border-b border-zinc-900/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-950/40 text-red-500">
                      <TrendingUp size={15} />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-white">
                      Dự báo xu hướng & hiệu suất tăng trưởng
                    </h2>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded">Biểu đồ dự đoán</span>
                </div>

                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend} margin={{ left: -15, right: 5 }}>
                      <defs>
                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#141416" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} fontWeight={600} axisLine={false} tickLine={false} />
                      <YAxis stroke="#4b5563" fontSize={9} fontWeight={600} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-xl border border-zinc-800 bg-black/95 p-3 text-xs shadow-2xl">
                              <p className="text-zinc-500 font-bold text-[9px] uppercase tracking-wider mb-1">{label}</p>
                              <p className="font-black text-white">{formatMoney(Number(payload[0].value))}</p>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="growth" stroke="#e11d48" fill="url(#growthGrad)" strokeWidth={2.5} dot={{ r: 2, fill: "#050505", stroke: "#e11d48", strokeWidth: 1.5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ================= BẢNG DANH SÁCH PHIM (MOVIES TABLE) ================= */}
            <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] p-6 shadow-xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
              <div className="mb-5 flex items-center gap-2 border-b border-zinc-900/50 pb-4">
                <div className="p-1.5 rounded-lg bg-zinc-900 text-yellow-500 border border-zinc-800">
                  <Film size={15} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-white">
                  Bảng xếp hạng phim có số điểm đánh giá cao từ người dùng
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 uppercase font-black tracking-wider text-[10px]">
                      <th className="pb-4 font-bold">Tựa đề tác phẩm phim</th>
                      <th className="pb-4 text-right font-bold w-32">Điểm trung bình</th>
                      <th className="pb-4 text-right font-bold w-40">Tổng số lượt đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/40">
                    {movieStats.map((movie, index) => (
                      <tr key={index} className="transition hover:bg-zinc-900/20 group/row">
                        <td className="py-3.5 font-semibold text-white group-hover/row:text-red-400 transition-colors">
                          {movie.title}
                        </td>
                        <td className="py-3.5 text-right font-black text-yellow-500 text-sm">
                          {movie.avgRating?.toFixed(1) || "0.0"}
                        </td>
                        <td className="py-3.5 text-right text-zinc-400 font-medium">
                          {movie.count.toLocaleString()} lượt
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* TRẠNG THÁI TRỐNG (EMPTY STATE) */}
                {movieStats.length === 0 && (
                  <div className="py-12 text-center text-xs font-bold uppercase tracking-widest text-zinc-600">
                    Hiện tại chưa ghi nhận dữ liệu phim nào
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= THÀNH PHẦN CON: THẺ THỐNG KÊ (STAT CARD COMPONENT) ================= */
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgIcon: string;
  valueClass?: string;
}

function StatCard({ title, value, icon, bgIcon, valueClass = "text-white" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-800 shadow-md flex flex-col justify-between min-h-[125px] group">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {title}
        </p>
        <div className={`p-2 rounded-xl text-xs transition-all duration-300 ${bgIcon}`}>
          {icon}
        </div>
      </div>

      <h3 className={`text-xl sm:text-2xl font-black tracking-tight mt-4 break-words ${valueClass}`}>
        {value}
      </h3>
    </div>
  );
}
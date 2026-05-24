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

/* ================= TYPES ================= */
interface RankingItem {
  name: string;
  revenue: number;
}

interface MovieStat {
  title: string;
  avgRating: number;
  count: number;
}

/* ================= PAGE ================= */
export default function ReportDashboard() {

  // ================= DATE =================
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

  // ================= STATE =================
  const [loading, setLoading] =
    useState(true);

  const [ranking, setRanking] =
    useState<RankingItem[]>([]);

  const [movieStats, setMovieStats] =
    useState<MovieStat[]>([]);

  // ================= FORMAT DATE =================
  const formatDate = (
    date: string
  ) => {

    return (
      date.replace("T", " ") +
      ":00"
    );
  };

  // ================= QUERY =================
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

  // ================= FETCH =================
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

      // ================= RANKING =================
      if (rankRes.ok) {

        const rankData =
          await rankRes.json();

        setRanking(
          rankData || []
        );
      }

      // ================= MOVIES =================
      if (movieRes.ok) {

        const movieData =
          await movieRes.json();

        setMovieStats(
          movieData || []
        );
      }

    } catch (error) {

      console.error(
        "Lỗi tải dữ liệu:",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchData();

  }, [startDate, endDate]);

  // ================= CALCULATE =================
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

  // ================= CHART MOCK =================
  const revenueTrend =
    ranking.slice(0, 5).map(
      (item, index) => ({
        name:
          item.name.length > 10
            ? item.name.slice(
                0,
                10
              ) + "..."
            : item.name,

        revenue:
          item.revenue,

        growth:
          item.revenue *
          (0.8 +
            index * 0.1),
      })
    );

  // ================= FORMAT =================
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
    <div className="min-h-screen bg-[#050505] p-8 text-zinc-300">

      {/* ================= HEADER ================= */}
      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white">
            Super Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Hệ thống phân tích doanh thu
            rạp phim toàn quốc
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-[#0f0f0f] px-5 py-3 text-xs font-black uppercase tracking-wider transition hover:border-red-600 hover:text-white"
        >

          <RefreshCw
            size={14}
          />

          Làm mới
        </button>
      </div>

      {/* ================= FILTER ================= */}
      <div className="mb-6 rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6">

        <div className="mb-5 flex items-center gap-2">

          <Building2
            size={16}
            className="text-red-500"
          />

          <h2 className="text-xs font-black uppercase tracking-wider text-white">
            Bộ lọc thời gian
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* START */}
          <div>

            <p className="mb-2 text-[10px] font-bold uppercase text-zinc-600">
              Thời gian bắt đầu
            </p>

            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-zinc-900 bg-black p-4 text-sm outline-none transition focus:border-red-600"
            />
          </div>

          {/* END */}
          <div>

            <p className="mb-2 text-[10px] font-bold uppercase text-zinc-600">
              Thời gian kết thúc
            </p>

            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-zinc-900 bg-black p-4 text-sm outline-none transition focus:border-red-600"
            />
          </div>
        </div>
      </div>

      {/* ================= LOADING ================= */}
      {loading ? (

        <div className="flex h-[50vh] items-center justify-center">

          <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-zinc-500">

            <RefreshCw
              size={18}
              className="animate-spin"
            />

            Đang tải dữ liệu...
          </div>
        </div>

      ) : (
        <>
          {/* ================= STATS ================= */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Tổng doanh thu"
              value={formatMoney(
                totalRevenue
              )}
              icon={
                <DollarSign
                  size={18}
                />
              }
              color="text-green-500"
            />

            <StatCard
              title="Tổng rạp hoạt động"
              value={`${totalCinemas} rạp`}
              icon={
                <Building2
                  size={18}
                />
              }
              color="text-red-500"
            />

            <StatCard
              title="Tổng đánh giá"
              value={`${totalReviews} lượt`}
              icon={
                <Star
                  size={18}
                />
              }
              color="text-yellow-500"
            />

            <StatCard
              title="Rạp mạnh nhất"
              value={
                topCinema?.name ||
                "N/A"
              }
              icon={
                <TrendingUp
                  size={18}
                />
              }
              color="text-cyan-500"
            />
          </div>

          {/* ================= CHARTS ================= */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* BAR CHART */}
            <div className="rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6">

              <div className="mb-6 flex items-center gap-2">

                <BarChart3
                  size={16}
                  className="text-red-500"
                />

                <h2 className="text-xs font-black uppercase tracking-wider text-white">
                  Doanh thu theo rạp
                </h2>
              </div>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={ranking}
                  layout="vertical"
                  margin={{
                    left: -10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1f2937"
                    horizontal
                    vertical={false}
                  />

                  <XAxis
                    type="number"
                    stroke="#666"
                    fontSize={10}
                  />

                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#888"
                    fontSize={10}
                    width={120}
                  />

                  <Tooltip
                    formatter={(
                      value: any
                    ) =>
                      formatMoney(
                        Number(
                          value
                        )
                      )
                    }
                    contentStyle={{
                      backgroundColor:
                        "#090909",

                      border:
                        "1px solid #27272a",

                      borderRadius:
                        "12px",

                      fontSize:
                        "12px",
                    }}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#dc2626"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AREA CHART */}
            <div className="rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6">

              <div className="mb-6 flex items-center gap-2">

                <TrendingUp
                  size={16}
                  className="text-green-500"
                />

                <h2 className="text-xs font-black uppercase tracking-wider text-white">
                  Xu hướng tăng trưởng
                </h2>
              </div>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <AreaChart
                  data={
                    revenueTrend
                  }
                >

                  <defs>

                    <linearGradient
                      id="growth"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#dc2626"
                        stopOpacity={
                          0.7
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#dc2626"
                        stopOpacity={
                          0
                        }
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#1f1f1f"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#777"
                  />

                  <Tooltip
                    formatter={(
                      value: any
                    ) =>
                      formatMoney(
                        Number(
                          value
                        )
                      )
                    }
                    contentStyle={{
                      backgroundColor:
                        "#090909",

                      border:
                        "1px solid #27272a",

                      borderRadius:
                        "12px",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="growth"
                    stroke="#dc2626"
                    fill="url(#growth)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ================= MOVIES ================= */}
          <div className="mt-6 rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6">

            <div className="mb-5 flex items-center gap-2">

              <Film
                size={16}
                className="text-yellow-500"
              />

              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Phim đánh giá cao
              </h2>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead>

                  <tr className="border-b border-zinc-900 text-zinc-600 uppercase">

                    <th className="pb-4 font-bold">
                      Tên phim
                    </th>

                    <th className="pb-4 text-right font-bold">
                      Điểm TB
                    </th>

                    <th className="pb-4 text-right font-bold">
                      Lượt đánh giá
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {movieStats.map(
                    (
                      movie,
                      index
                    ) => (
                      <tr
                        key={index}
                        className="border-b border-zinc-900/50 transition hover:bg-zinc-900/20"
                      >

                        <td className="py-4 font-semibold text-white">
                          {
                            movie.title
                          }
                        </td>

                        <td className="py-4 text-right font-black text-yellow-500">
                          {movie.avgRating?.toFixed(
                            1
                          )}
                        </td>

                        <td className="py-4 text-right text-zinc-400">
                          {
                            movie.count
                          }
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {/* EMPTY */}
              {movieStats.length ===
                0 && (
                <div className="py-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-600">

                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= CARD ================= */
function StatCard({
  title,
  value,
  icon,
  color,
}: any) {

  return (
    <div className="rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6 transition hover:border-zinc-700">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {title}
        </p>

        <div className={color}>
          {icon}
        </div>
      </div>

      <h3 className="mt-5 text-2xl font-black text-white break-words">
        {value}
      </h3>
    </div>
  );
}
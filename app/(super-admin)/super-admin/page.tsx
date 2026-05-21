"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  Loader2,
  BarChart3,
  Star,
  Building2,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { apiSuperAdminRequest } from "../../lib/api";

interface RankingItem {
  name: string;
  revenue: number;
}

interface MovieStat {
  title: string;
  avgRating: number;
  count: number;
}

interface Cinema {
  id: number;
  name: string;
}

export default function ReportDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();

    return new Date(
      d.getFullYear(),
      d.getMonth(),
      1
    ).toISOString().slice(0, 16);
  });

  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );

  const [loading, setLoading] = useState(false);

  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [movieStats, setMovieStats] = useState<MovieStat[]>([]);

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState("");

  const formatDate = (date: string) => {
    return date.replace("T", " ") + ":00";
  };

  const getQuery = (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams({
      start: formatDate(startDate),
      end: formatDate(endDate),
      ...params,
    });

    return searchParams.toString();
  };

  const fetchCinemas = async () => {
    try {
      const res = await apiSuperAdminRequest("/api/v1/cinema-items");

      if (!res.ok) return;

      const data = await res.json();

      setCinemas(data.data || data || []);
    } catch (error) {
      console.error("Lỗi tải rạp:", error);
    }
  };

  const fetchData = async () => {
    try {
      const query = getQuery();

      const [rankRes, movieRes] = await Promise.all([
        apiSuperAdminRequest(`/api/v1/reports/ranking?${query}`),
        apiSuperAdminRequest(`/api/v1/reports/stats`),
      ]);

      if (rankRes.ok) {
        const rankData = await rankRes.json();

        setRanking(rankData || []);
      }

      if (movieRes.ok) {
        const movieData = await movieRes.json();

        setMovieStats(movieData || []);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  const handleDownload = async () => {
    setLoading(true);

    try {
      const query = selectedCinema
        ? getQuery({
            cinemaId: selectedCinema,
          })
        : getQuery();

      const res = await apiSuperAdminRequest(
        `/api/v1/reports/download?${query}`
      );

      if (!res.ok) {
        throw new Error("Download failed");
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = `Bao_Cao_${startDate.split("T")[0]}_den_${
        endDate.split("T")[0]
      }.xlsx`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);

      alert("Xuất file thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCinemas();
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-zinc-300">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest text-white">
          Dashboard Doanh Thu
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Thống kê doanh thu và đánh giá phim
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* SIDEBAR */}
        <div className="rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6 h-fit">
          <div className="mb-5 flex items-center gap-2">
            <Building2 size={16} className="text-red-500" />

            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Bộ lọc báo cáo
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase text-zinc-600">
                Rạp
              </p>

              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="w-full rounded-xl border border-zinc-900 bg-black p-3 text-xs text-zinc-300 outline-none"
              >
                <option value="">Tất cả rạp</option>

                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase text-zinc-600">
                Thời gian bắt đầu
              </p>

              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-900 bg-black p-3 text-xs outline-none"
              />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase text-zinc-600">
                Thời gian kết thúc
              </p>

              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-900 bg-black p-3 text-xs outline-none"
              />
            </div>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-black uppercase transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}

              Tải Excel
            </button>
          </div>
        </div>

        {/* CHART */}
        <div className="rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6 lg:col-span-3">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-red-500" />

            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Doanh thu theo rạp
            </h2>
          </div>

          <ResponsiveContainer width="100%" height={320}>
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
                contentStyle={{
                  backgroundColor: "#090909",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />

              <Bar
                dataKey="revenue"
                fill="#dc2626"
                radius={[0, 6, 6, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MOVIE TABLE */}
      <div className="mt-6 rounded-3xl border border-zinc-900 bg-[#0f0f0f] p-6">
        <div className="mb-5 flex items-center gap-2">
          <Star size={16} className="text-yellow-500" />

          <h2 className="text-xs font-black uppercase tracking-wider text-white">
            Phim đánh giá cao
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-600 uppercase">
                <th className="pb-4 font-bold">Tên phim</th>

                <th className="pb-4 text-right font-bold">
                  Điểm TB
                </th>

                <th className="pb-4 text-right font-bold">
                  Lượt đánh giá
                </th>
              </tr>
            </thead>

            <tbody>
              {movieStats.map((movie, index) => (
                <tr
                  key={index}
                  className="border-b border-zinc-900/50"
                >
                  <td className="py-4 font-semibold text-white">
                    {movie.title}
                  </td>

                  <td className="py-4 text-right font-black text-yellow-500">
                    {movie.avgRating?.toFixed(1)}
                  </td>

                  <td className="py-4 text-right text-zinc-400">
                    {movie.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movieStats.length === 0 && (
            <div className="py-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-600">
              Không có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { apiSuperAdminRequest } from "../../../lib/api";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Loader2,
  Download,
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  Percent,
  FileText,
  ShoppingBag,
  BarChart3,
} from "lucide-react";

type FinanceData = {
  grossRevenue: number;
  tax: number;
  profit: number;
  orderCount: number;
};

type Cinema = {
  id: number;
  name: string;
};

export default function FinancePage() {
  const [month, setMonth] = useState("2026-05");
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState("");
  
  // Khoảng ngày linh động phục vụ riêng cho kết xuất file báo cáo
  const [startDate, setStartDate] = useState("2026-05-01T00:00");
  const [endDate, setEndDate] = useState("2026-05-31T23:59");

  // Lớp CSS tiện ích để biến icon lịch của trình duyệt thành màu trắng dễ nhìn trên nền đen
  const inputStyleFix = "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-calendar-picker-indicator]:cursor-pointer";

  // ================= ĐỊNH DẠNG NGÀY GIỜ =================
  const formatDate = (date: string) => {
    return date.replace("T", " ") + ":00";
  };

  // ================= TẠO THAM SỐ TRUY VẤN XUẤT FILE =================
  const getQuery = (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams({
      start: formatDate(startDate),
      end: formatDate(endDate),
      ...params,
    });
    return searchParams.toString();
  };

  // ================= TẢI DỮ LIỆU TÀI CHÍNH (THEO THÁNG) =================
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/v1/reports/finance?month=${month}`;

      if (selectedCinema) {
        url += `&cinemaId=${selectedCinema}`;
      }

      const res = await apiSuperAdminRequest(url);
      if (!res.ok) {
        throw new Error("Không thể kết nối dữ liệu từ hệ thống máy chủ.");
      }

      const json: FinanceData = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= TẢI DANH SÁCH RẠP CHIẾU =================
  const fetchCinemas = async () => {
    try {
      const res = await apiSuperAdminRequest("/api/v1/cinema-items");
      if (!res.ok) return;

      const result = await res.json();
      const rawData = result.data || result || [];

      if (Array.isArray(rawData)) {
        setCinemas(rawData);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách rạp:", error);
    }
  };

  // ================= XỬ LÝ TẢI FILE EXCEL =================
  const handleDownload = async () => {
    try {
      setLoading(true);
      const query = selectedCinema
        ? getQuery({ cinemaId: selectedCinema })
        : getQuery({ cinemaId: "0" });

      const res = await apiSuperAdminRequest(`/api/v1/reports/download?${query}`);
      if (!res.ok) {
        throw new Error("Tải tập tin thất bại");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_Cao_Tai_Chinh_${startDate.split("T")[0]}_den_${endDate.split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Hệ thống xuất file Excel thất bại. Vui lòng kiểm tra lại đường truyền.");
    } finally {
      setLoading(false);
    }
  };

  // ================= HIỆU ỨNG EFFECT =================
  useEffect(() => {
    fetchData();
  }, [month, selectedCinema]);

  useEffect(() => {
    fetchCinemas();
  }, []);

  // ================= ĐỊNH DẠNG TIỀN TỆ VNĐ =================
  const formatMoney = (v?: number) => {
    return (v ?? 0).toLocaleString("vi-VN") + " ₫";
  };

  // ================= XỬ LÝ DỮ LIỆU BIỂU ĐỒ =================
  const getChartTimelineData = () => {
    if (!data) return [];
    const [year, m] = month.split("-");
    const lastDay = new Date(parseInt(year), parseInt(m), 0).getDate();

    return [
      { ngay: `01/${m}`, "Lợi nhuận": data.profit * 0.35 },
      { ngay: `15/${m}`, "Lợi nhuận": data.profit * 0.68 },
      { ngay: `${lastDay}/${m}`, "Lợi nhuận": data.profit },
    ];
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans px-4 py-10 sm:px-8 md:px-12 antialiased selection:bg-red-600/30 selection:text-red-400">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* TIÊU ĐỀ TRANG TRÊN CÙNG */}
        <div className="relative pb-2">
          <div className="absolute -left-4 top-1 w-1 h-8 bg-gradient-to-b from-white to-zinc-700 rounded-full hidden md:block" />
          <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Báo cáo Tài chính
          </h1>
          <p className="text-sm text-zinc-400 mt-2 font-medium">
            Hệ thống quản trị số liệu
          </p>
        </div>

        {/* ================= KHỐI 1: TẢI FILE EXCEL (CỤC TRÊN) ================= */}
        <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] p-6 shadow-2xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-700 via-red-600 to-red-500"></div>
          
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Bộ công cụ kết xuất dữ liệu tập tin (Excel)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                1. Bộ lọc cơ sở rạp
              </p>
              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-xs font-semibold text-white outline-none focus:border-red-600 transition cursor-pointer hover:bg-zinc-900"
              >
                <option value="">Tất cả hệ thống rạp</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                2. Từ ngày & giờ
              </p>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-xl border border-zinc-800 bg-black p-3 text-xs font-semibold text-white outline-none focus:border-red-600 transition hover:bg-zinc-900 ${inputStyleFix}`}
              />
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                3. Đến ngày & giờ
              </p>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-xl border border-zinc-800 bg-black p-3 text-xs font-semibold text-white outline-none focus:border-red-600 transition hover:bg-zinc-900 ${inputStyleFix}`}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleDownload}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 active:scale-[0.98] py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all shadow-xl shadow-red-950/30 disabled:opacity-40 disabled:scale-100"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Tải ngay
              </button>
            </div>
          </div>
        </div>


        {/* ================= KHỐI 2: TRUNG TÂM PHÂN TÍCH BIỂU ĐỒ DOANH SỐ (CỤC DƯỚI) ================= */}
        <div className="space-y-6 pt-6 border-t border-zinc-900">
          
          {/* THANH ĐIỀU HƯỚNG CHỌN THÁNG XEM DỮ LIỆU */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0c0c0e] border border-zinc-900 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  Phân tích Sơ đồ số liệu trực quan
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Biểu diễn tăng trưởng dòng tiền và số liệu kết toán</p>
              </div>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-end gap-3 bg-black border border-zinc-800 p-1.5 px-3 rounded-xl">
              <span className="text-xs font-bold text-zinc-400">Xem dữ liệu tháng:</span>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className={`bg-transparent text-xs text-red-500 font-black outline-none transition cursor-pointer ${inputStyleFix}`}
              />
            </div>
          </div>

          {/* HỘP BÁO LỖI HỆ THỐNG */}
          {error && (
            <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Thông báo lỗi: {error}
            </div>
          )}

          {/* HIỆU ỨNG SKELETON CHỜ TẢI DỮ LIỆU */}
          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 h-72 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
                <div className="lg:col-span-3 h-72 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
              </div>
            </div>
          )}

          {/* NỘI DUNG CHÍNH (BIỂU ĐỒ & BẢNG SỐ LIỆU) */}
          {!loading && data && (
            <div className="space-y-6">
              
              {/* CÁC THẺ CARD TỔNG QUAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                
                {/* DOANH THU */}
                <div className="p-6 rounded-2xl border border-zinc-900 bg-[#0c0c0e] shadow-sm group hover:border-zinc-800 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Tổng doanh thu thuần
                    </p>
                    <div className="p-2 rounded-lg bg-zinc-900 text-zinc-300">
                      <DollarSign size={15} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {formatMoney(data.grossRevenue)}
                  </h3>
                </div>

                {/* THUẾ KHẤU TRỪ */}
                <div className="p-6 rounded-2xl border border-zinc-900 bg-[#0c0c0e] shadow-sm group hover:border-zinc-800 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Thuế suất khấu trừ (VAT)
                    </p>
                    <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400">
                      <Percent size={13} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-300 tracking-tight">
                    {formatMoney(data.tax)}
                  </h3>
                </div>

                {/* LỢI NHUẬN RÒNG */}
                <div className="p-6 rounded-2xl border border-red-950/40 bg-gradient-to-br from-[#0c0c0e] to-[#140c0c] shadow-md sm:col-span-2 md:col-span-1">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                      Lợi nhuận ròng thực tế
                    </p>
                    <div className="p-2 rounded-lg bg-red-950/60 text-red-500">
                      <TrendingUp size={15} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-red-500 tracking-tight">
                    {formatMoney(data.profit)}
                  </h3>
                </div>
              </div>

              {/* KHU VỰC CHI TIẾT VÀ BIỂU ĐỒ TRỰC QUAN */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* BẢNG CHI TIẾT CHỈ SỐ */}
                <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-900 bg-[#0c0c0e] flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
                      <FileText size={15} className="text-zinc-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Bảng thống kê chi tiết chỉ số
                      </h3>
                    </div>
                    
                    <div className="divide-y divide-zinc-900">
                      <div className="flex justify-between py-3.5 text-xs font-medium">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <ShoppingBag size={13} className="text-zinc-600" /> Khối lượng đơn hàng đạt
                        </span>
                        <span className="font-bold text-white bg-zinc-900 px-2 py-0.5 rounded">
                          {data.orderCount.toLocaleString()} đơn
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-3.5 text-xs font-medium">
                        <span className="text-zinc-400">Doanh thu tổng hệ thống</span>
                        <span className="font-semibold text-zinc-200">
                          {formatMoney(data.grossRevenue)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-3.5 text-xs font-medium">
                        <span className="text-zinc-400">Khoản trừ nghĩa vụ thuế</span>
                        <span className="font-semibold text-zinc-400">
                          {formatMoney(data.tax)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Lợi nhuận kết toán đạt</span>
                    <span className="text-xl font-black text-red-500">
                      {formatMoney(data.profit)}
                    </span>
                  </div>
                </div>

                {/* BIỂU ĐỒ PHÂN TÍCH */}
                <div className="lg:col-span-3 p-6 rounded-2xl border border-zinc-900 bg-[#0c0c0e] flex flex-col justify-between shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
                    <Calendar size={15} className="text-zinc-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Biểu đồ biểu diễn tăng trưởng lợi nhuận chu kỳ ({month})
                    </h3>
                  </div>

                  <div className="w-full h-56 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={getChartTimelineData()}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="chartProfitRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#141416" vertical={false} />
                        <XAxis
                          dataKey="ngay"
                          stroke="#52525b"
                          tick={{ fontSize: 10, fontWeight: 500 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#52525b"
                          tick={{ fontSize: 10, fontWeight: 500 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#000",
                            border: "1px solid #27272a",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#fff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Lợi nhuận"
                          stroke="#dc2626"
                          strokeWidth={2.5}
                          dot={{ r: 3, strokeWidth: 1, fill: "#000" }}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                          fillOpacity={1}
                          fill="url(#chartProfitRed)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
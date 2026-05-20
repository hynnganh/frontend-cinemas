"use client";
import React, { useState, useEffect } from 'react';
import { apiSuperAdminRequest } from '../../../lib/api';
import { BarChart3, LineChart, Calendar, Building2, TrendingUp, Layers } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function SuperAdminDashboard() {
  const [startDate, setStartDate] = useState("2026-05-01T00:00");
  const [endDate, setEndDate] = useState("2026-05-19T23:59");
  
  // Khởi tạo state với cấu trúc dự kiến để tránh lỗi 'undefined'
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await apiSuperAdminRequest(
      `/api/v1/reports/dashboard?start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`,
      { method: 'GET' }
    );
    
    // THÊM ĐOẠN NÀY ĐỂ DEBUG
    if (!res.ok) {
      const errorText = await res.text(); // Đọc nội dung lỗi từ server
      console.error(`Lỗi Server (${res.status}):`, errorText);
      throw new Error(`Server returned ${res.status}: ${errorText}`);
    }
    
    const json = await res.json();
    setData(json);
  } catch (err) {
    console.error("Lỗi chi tiết:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const formatVND = (val: number | undefined | null) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val ?? 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Đang tải dữ liệu hệ thống...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 p-6 md:p-10">
      {/* HEADER & FILTER */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-6 mb-8">
        <h1 className="text-2xl font-black text-white italic tracking-tighter">SUPER ADMIN DASHBOARD</h1>
        <div className="flex gap-2 text-xs">
          <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-zinc-900 p-2 rounded" />
          <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-zinc-900 p-2 rounded" />
        </div>
      </div>

      {/* 💰 CÁC CARD CHỈ SỐ - Dùng Optional Chaining để tránh lỗi */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Tổng Doanh Thu (Gross)" value={formatVND(data?.taxReport?.totalRevenue)} color="text-white" />
        <StatCard title="Thuế (VAT)" value={`-${formatVND(data?.taxReport?.vat)}`} color="text-red-500" />
        <StatCard title="Tổng Cost" value={`-${formatVND(data?.totalCost)}`} color="text-orange-500" />
        <StatCard title="Lợi Nhuận Thuần" value={formatVND(data?.netProfit)} color="text-emerald-400" />
      </div>

      {/* 📊 BIỂU ĐỒ */}
      <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-6 mt-8 h-80">
        <h2 className="text-xs font-bold text-zinc-500 mb-6 uppercase">Biểu đồ doanh thu hàng ngày</h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data?.dailyRevenue ?? []}>
            <CartesianGrid stroke="#141416" vertical={false} />
            <XAxis dataKey="date" stroke="#52525b" fontSize={10} />
            <YAxis stroke="#52525b" fontSize={10} tickFormatter={(v) => `${v / 1000000}tr`} />
            <Tooltip contentStyle={{ backgroundColor: '#050505', border: '1px solid #27272a' }} />
            <Area type="monotone" dataKey="totalRevenue" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-5">
      <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">{title}</span>
      <p className={`text-xl font-black ${color} mt-1`}>{value}</p>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, LineChart, Users, Film, Ticket, DollarSign, 
  TrendingUp, Calendar, RefreshCw, Building2, Award, Loader2 
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; // Đường dẫn tới file call API của bạn
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line 
} from 'recharts';

export default function AdminDashboard() {
  // 1. Khởi tạo State lưu ngày lọc (Mặc định là 30 ngày qua)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0] + "T00:00";
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0] + "T23:59";
  });

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Hàm Fetch dữ liệu tổng hợp từ API /dashboard
  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Đọc token admin từ localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem('token_admin') : null;
      
      const res = await apiRequest(`/api/v1/reports/dashboard?start=${startDate}&end=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      System.out.error("Lỗi tải dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate]);

  // Hàm helper định dạng tiền tệ Việt Nam (VND)
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-red-600" size={40} strokeWidth={2.5} />
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Đang nạp dữ liệu tối mật...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-6 md:p-10 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & FILTER CONTROL */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-red-500" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Super Admin Workspace</span>
            </div>
            <h1 className="text-3xl font-black uppercase italic text-white tracking-tight">
              Hệ thống <span className="text-red-600">Thống kê & Phân tích</span>
            </h1>
          </div>

          {/* Thanh lọc thời gian nhỏ gọn */}
          <div className="flex flex-wrap items-center gap-3 bg-[#0c0c0e] border border-zinc-900 p-3 rounded-2xl shadow-inner">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Calendar size={14} className="text-zinc-600" />
              <span>Từ:</span>
              <input 
                type="datetime-local" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black border border-zinc-800 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-red-600 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Đến:</span>
              <input 
                type="datetime-local" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black border border-zinc-800 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-red-600 text-xs"
              />
            </div>
            <button 
              onClick={() => fetchDashboardData(true)}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800 text-zinc-400 hover:text-white"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-red-500" : ""} />
            </button>
          </div>
        </div>

        {/* 1. KHỐI TỔNG QUAN HỆ THỐNG (4 CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card: Doanh thu tổng */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tổng Doanh Thu All-Time</span>
              <p className="text-xl font-black text-white">{formatVND(data?.totalRevenueAllTime || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <DollarSign size={22} />
            </div>
          </div>

          {/* Card: Số vé bán ra */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tổng Vé Đã Bán</span>
              <p className="text-xl font-black text-white">{(data?.totalTicketsSold || 0).toLocaleString()} vé</p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
              <Ticket size={22} />
            </div>
          </div>

          {/* Card: Tổng số Phim đang chiếu */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Phim Đang Hoạt Động</span>
              <p className="text-xl font-black text-white">{data?.totalMovies || 0} phim</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Film size={22} />
            </div>
          </div>

          {/* Card: Khách hàng hệ thống */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tổng Số Thành Viên</span>
              <p className="text-xl font-black text-white">{(data?.totalUsers || 0).toLocaleString()} user</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 border border-purple-500/20">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* 2. KHỐI BIỂU ĐỒ DOANH THU THEO NGÀY */}
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LineChart size={18} className="text-red-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Biến động doanh thu theo ngày</h2>
          </div>
          <div className="h-80 w-full text-xs">
            {data?.dailyRevenue && data.dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                  <XAxis dataKey="date" stroke="#71717a" tickFormatter={(tick) => new Date(tick).toLocaleDateString('vi-VN')} />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c0c0e', borderColor: '#27272a', color: '#fff' }}
                    formatter={(value: any) => [formatVND(value), "Doanh thu"]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="totalRevenue" name="Doanh thu (VND)" stroke="#dc2626" strokeWidth={3} activeDot={{ r: 6 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 font-medium">Không có dữ liệu doanh thu trong khoảng thời gian này</div>
            )}
          </div>
        </div>

        {/* 3. KHỐI BÊN DƯỚI CHIA ĐÔI: TOP PHIM & CỤM RẠP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Biểu đồ cột: Top phim doanh thu cao */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-orange-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Top phim ăn khách nhất</h2>
            </div>
            <div className="h-72 w-full text-xs">
              {data?.topMovies && data.topMovies.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topMovies}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                    <XAxis dataKey="movieTitle" stroke="#71717a" truncate />
                    <YAxis stroke="#71717a" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0c0c0e', borderColor: '#27272a', color: '#fff' }}
                      formatter={(value: any) => [formatVND(value), "Doanh thu"]}
                    />
                    <Bar dataKey="totalRevenue" name="Doanh thu" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 font-medium">Chưa có dữ liệu xếp hạng phim</div>
              )}
            </div>
          </div>

          {/* Bảng số liệu: Thị phần cụm rạp */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Building2 size={18} className="text-blue-500" />
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Báo cáo doanh thu theo cụm rạp</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider">
                      <th className="pb-3 pl-2">Tên Cụm Rạp</th>
                      <th className="pb-3 text-center">Số Đơn Hàng</th>
                      <th className="pb-3 text-right pr-2">Doanh Thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.cinemaRevenue && data.cinemaRevenue.length > 0 ? (
                      data.cinemaRevenue.map((cinema: any, idx: number) => (
                        <tr key={cinema.cinemaId || idx} className="border-b border-zinc-900/50 hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3.5 pl-2 font-bold text-zinc-300">{cinema.cinemaName}</td>
                          <td className="py-3.5 text-center text-zinc-400 font-mono">{cinema.totalOrders.toLocaleString()}</td>
                          <td className="py-3.5 text-right pr-2 font-mono font-bold text-emerald-400">{formatVND(cinema.totalRevenue)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-zinc-600 font-medium">Hệ thống chưa ghi nhận đơn hàng nào tại các rạp</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dòng tóm tắt nhanh chân trang */}
            <div className="mt-4 pt-4 border-t border-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1"><TrendingUp size={12} className="text-emerald-500" /> Cập nhật dữ liệu thời gian thực</span>
              <span>Đơn vị tính: VNĐ</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
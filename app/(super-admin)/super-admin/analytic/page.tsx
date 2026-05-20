"use client";
import React, { useState, useEffect } from 'react';
import { Download, Loader2, BarChart3, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiSuperAdminRequest } from '../../../lib/api';

export default function ReportDashboard() {
  const [startDate, setStartDate] = useState("2026-05-01T00:00");
  const [endDate, setEndDate] = useState("2026-05-20T23:59");
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [movieStats, setMovieStats] = useState([]);

  // Hàm helper nội bộ xử lý format ngày và query string
  const getQuery = (params: Record<string, string> = {}) => {
    const format = (d: string) => d.replace('T', ' ') + ':00';
    const searchParams = new URLSearchParams({
      start: format(startDate),
      end: format(endDate),
      ...params
    });
    return searchParams.toString();
  };

  const fetchData = async () => {
    try {
      const query = getQuery();
      // Gọi đồng thời các API
      const [rankRes, movieRes] = await Promise.all([
        apiSuperAdminRequest(`/api/v1/reports/ranking?${query}`),
        apiSuperAdminRequest(`/api/v1/reviews/stats`)
      ]);

      if (rankRes.ok) setRanking(await rankRes.json());
      if (movieRes.ok) setMovieStats(await movieRes.json());
    } catch (e) { console.error("Lỗi tải data:", e); }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const query = getQuery({ cinemaId: '1' });
      const res = await apiSuperAdminRequest(`/api/v1/reports/download?${query}`);
      
      if (!res.ok) throw new Error();
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_${startDate.split('T')[0]}.xlsx`;
      a.click();
    } catch (err) { alert("Lỗi xuất file!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [startDate, endDate]);

  return (
    <div className="p-10 bg-[#050505] min-h-screen text-zinc-200">
      <h1 className="text-2xl font-black text-white mb-8">DASHBOARD DOANH THU</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phần Thông số */}
        <div className="bg-[#0c0c0e] p-8 rounded-3xl border border-zinc-900 h-fit">
          <h2 className="font-bold mb-4">THÔNG SỐ</h2>
          <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-zinc-950 p-3 rounded-xl mb-4 border border-zinc-900" />
          <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-zinc-950 p-3 rounded-xl mb-6 border border-zinc-900" />
          <button onClick={handleDownload} className="w-full bg-red-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50" disabled={loading}>
            {loading ? <Loader2 className="animate-spin"/> : <Download size={20}/>} TẢI EXCEL
          </button>
        </div>

        {/* Biểu đồ Xếp hạng */}
        <div className="lg:col-span-2 bg-[#0c0c0e] p-8 rounded-3xl border border-zinc-900">
          <h2 className="font-bold mb-6 flex items-center gap-2"><BarChart3 className="text-red-600" /> XẾP HẠNG DOANH THU</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ranking} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#fff" width={120} />
              <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
              <Bar dataKey="revenue" fill="#dc2626" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bảng Phim xuất sắc */}
      <div className="mt-8 bg-[#0c0c0e] p-8 rounded-3xl border border-zinc-900">
        <h2 className="font-bold mb-6 flex items-center gap-2"><Star className="text-yellow-500" /> PHIM ĐƯỢC ĐÁNH GIÁ CAO</h2>
        <table className="w-full text-left">
          <thead><tr className="text-zinc-500 text-xs uppercase"><th className="pb-4">Tên Phim</th><th className="pb-4 text-right">Điểm TB</th><th className="pb-4 text-right">Lượt đánh giá</th></tr></thead>
          <tbody>
            {movieStats.map((movie: any, idx) => (
              <tr key={idx} className="border-t border-zinc-900/50"><td className="py-4 font-bold">{movie.title}</td><td className="py-4 text-right text-yellow-500">{movie.avgRating?.toFixed(1)}</td><td className="py-4 text-right">{movie.count}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
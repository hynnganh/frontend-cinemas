"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Info, Ticket, Coffee, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

export default function OrderHistoryTab() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [myCinemaId, setMyCinemaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy thông tin rạp của người dùng
        const userRes = await apiRequest('/api/v1/users/me');
        const userData = await userRes.json();
        const cinemaId = userData.data?.managedCinemaItemId || userData.data?.cinemaId;
        setMyCinemaId(cinemaId);

        // Lấy danh sách hóa đơn
        const res = await apiRequest('/api/v1/orders');
        const result = await res.json();
        
        if (result?.data) {
          setOrders(result.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = orders.filter(o => {
    const mStatus = activeFilter === 'ALL' || o.status === activeFilter;
    const mCinema = myCinemaId ? Number(o.cinemaItemId) === Number(myCinemaId) : true;
    return mStatus && mCinema;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'SUCCESS': return { label: 'Thành công', color: 'text-green-500', bg: 'bg-green-500/10', icon: <CheckCircle2 size={14}/> };
      case 'CANCELLED': return { label: 'Đã hủy', color: 'text-zinc-500', bg: 'bg-zinc-500/10', icon: <XCircle size={14}/> };
      default: return { label: 'Chờ xử lý', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: <Clock size={14}/> };
    }
  };

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Hệ thống đang đồng bộ...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header & Bộ lọc */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 pl-2">
          <div className="p-2 bg-red-600/10 rounded-lg"><Receipt size={16} className="text-red-600"/></div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase leading-none mb-1">Giao dịch rạp</h2>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">ID Rạp: {myCinemaId || "Tất cả"}</p>
          </div>
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
          {['ALL', 'SUCCESS', 'PENDING', 'CANCELLED'].map((t) => (
            <button 
              key={t} 
              onClick={() => setActiveFilter(t)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === t ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t === 'ALL' ? 'Tất cả' : t === 'SUCCESS' ? 'Thành công' : t === 'PENDING' ? 'Chờ' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="grid gap-2">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
          const status = getStatusInfo(order.status);
          return (
            <div 
              key={order.id} 
              onClick={() => router.push(`/admin/orders/${order.id}`)}
              className="group flex items-center gap-4 p-3 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-zinc-900/60 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="w-10 h-10 shrink-0 bg-black rounded-xl border border-white/5 flex items-center justify-center text-xs font-black text-white italic">#{order.id}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 text-[10px] font-black text-red-600 uppercase">
                  {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Khách vãng lai"}
                </div>
                <h4 className="text-xs font-bold text-zinc-200 truncate uppercase tracking-tight">{order.cinemaName}</h4>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-[9px] font-black uppercase ${status.color} mb-1 flex items-center justify-end gap-1`}>{status.icon} {status.label}</div>
                <div className="text-sm font-black text-white italic tracking-tighter">{order.totalAmount.toLocaleString()}đ</div>
              </div>
              <Info size={14} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
            </div>
          );
        }) : (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-[2rem]">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Không có giao dịch nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
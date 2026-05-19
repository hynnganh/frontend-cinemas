"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, Info, Loader2, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

export default function OrderHistoryTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [myCinemaId, setMyCinemaId] = useState<number | null>(null);

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token_admin") || "";
    }
    return "";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getAdminToken();

        // 1. Tải thông tin Người dùng quản lý rạp
        const userRes = await apiRequest('/api/v1/users/me', {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const userData = await userRes.json();
        const cinemaId = userData.data?.managedCinemaItemId || userData.data?.cinemaId;
        setMyCinemaId(cinemaId);

        // 2. Tải danh sách đơn hàng thực tế
        const res = await apiRequest('/api/v1/orders', {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const result = await res.json();
        
        if (res.ok && result?.data) {
          setOrders(result.data);
        }
      } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu hệ thống:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = orders.filter(o => {
    const cleanStatus = o.status ? o.status.trim() : '';
    
    let matchesStatus = false;
    if (activeFilter === 'ALL') {
      matchesStatus = true;
    } else if (activeFilter === 'PAID') {
      matchesStatus = cleanStatus === 'PAID' || cleanStatus === 'SUCCESS';
    } else {
      matchesStatus = cleanStatus === activeFilter;
    }

    const matchesCinema = myCinemaId ? Number(o.cinemaItemId) === Number(myCinemaId) : true;
    return matchesStatus && matchesCinema;
  });

  // Ánh xạ trạng thái thực tế từ API dữ liệu
  const getStatusInfo = (status: string) => {
    const cleanStatus = status ? status.trim() : '';
    switch (cleanStatus) {
      case 'PAID': 
      case 'SUCCESS':
        return { label: 'Thành công', color: 'text-green-500', icon: <CheckCircle2 size={14}/> };
      case 'CANCELLED': 
        return { label: 'Đã hủy', color: 'text-zinc-500', icon: <XCircle size={14}/> };
      default: 
        return { label: 'Chờ xử lý', color: 'text-amber-500', icon: <Clock size={14}/> };
    }
  };

  // Hàm định dạng hiển thị chuỗi thời gian có sẵn
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const [date, time] = dateStr.split('T');
    const [year, month, day] = date.split('-');
    return `${time.substring(0, 5)} - ${day}/${month}/${year}`;
  };

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Đang đồng bộ giao dịch...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 font-sans select-none tracking-tight">
      {/* Bộ lọc đầu bảng */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950 p-3 rounded-xl border border-zinc-900 shadow-sm">
        <div className="flex items-center gap-3 pl-1">
          <div className="p-2 bg-orange-600/10 rounded-lg"><Receipt size={16} className="text-orange-600"/></div>
          <div>
            <h2 className="text-sm font-black text-white uppercase leading-none mb-1.5">Giao dịch rạp</h2>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">Mã cơ sở hiện tại: {myCinemaId || "Tất cả"}</p>
          </div>
        </div>
        <div className="flex bg-[#060608] p-1 rounded-lg border border-zinc-900">
          {['ALL', 'PAID', 'PENDING', 'CANCELLED'].map((t) => (
            <button 
              key={t} 
              onClick={() => setActiveFilter(t)} 
              className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tight transition-all ${
                activeFilter === t ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'ALL' ? 'Tất cả' : t === 'PAID' ? 'Thành công' : t === 'PENDING' ? 'Chờ xử lý' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách lưới hiển thị đơn hàng */}
      <div className="grid gap-2">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
          const status = getStatusInfo(order.status);
          const detailUrl = `/admin/orders/${order.id}`;

          return (
            <Link 
              key={order.id} 
              href={detailUrl}
              className="group flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all"
            >
              {/* ID Đơn hàng */}
              <div className="w-10 h-10 shrink-0 bg-[#060608] border border-zinc-900 rounded-lg flex items-center justify-center text-xs font-black text-white">
                #{order.id}
              </div>

              {/* Thông tin rạp phim và Cổng thanh toán */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 text-[9px] font-black text-orange-500 uppercase tracking-wider">
                  <CreditCard size={10} />
                  <span>Cổng: {order.paymentMethod}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 font-bold lowercase">{formatDateTime(order.createdAt)}</span>
                </div>
                <h4 className="text-xs font-black text-zinc-200 truncate uppercase tracking-tight">{order.cinemaName}</h4>
              </div>

              {/* Trạng thái và Tổng số tiền thanh toán */}
              <div className="text-right shrink-0">
                <div className={`text-[9px] font-black uppercase ${status.color} mb-1 flex items-center justify-end gap-1 tracking-wider`}>
                  {status.icon} {status.label}
                </div>
                <div className="text-sm font-black text-white tracking-tight">
                  {order.totalAmount?.toLocaleString()}đ
                </div>
              </div>
              
              <Info size={13} className="text-zinc-800 group-hover:text-orange-500 transition-colors shrink-0" />
            </Link>
          );
        }) : (
          <div className="py-20 text-center border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">Không tìm thấy bản ghi giao dịch nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
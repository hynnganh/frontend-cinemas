"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Search, ChevronRight, Hash, CreditCard, 
  Ticket, Loader2, RefreshCcw, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

export default function SuperAdminHCMPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Lấy token từ localStorage (hoặc cookie tùy dự án của bạn)
      const token = localStorage.getItem('admin_token'); 
      
      // Khởi tạo headers có kèm Authorization Bot
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await apiRequest('/api/v1/orders', { 
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        setIsAuthorized(true);
        const result = await response.json();
        const sorted = (result.data || []).sort((a: any, b: any) => b.id - a.id);
        setOrders(sorted);
      } else if (response.status === 401 || response.status === 403) {
        // Trả về lỗi phân quyền từ Spring Boot
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Lỗi kết nối mạng:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchOrders(); 
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => 
    order.id?.toString().includes(searchTerm) ||
    order.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // MÀN HÌNH CHẶN QUYỀN TRUY CẬP (Nếu không phải SUPER_ADMIN)
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="text-red-600 animate-pulse mb-6" size={64} />
        <h1 className="text-2xl font-[1000] uppercase italic text-red-600 tracking-tighter">TRUY CẬP BỊ TỪ CHỐI</h1>
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-2 max-w-sm">
          Tài khoản của bạn không có vai trò [SUPER_ADMIN]. Vui lòng đăng nhập lại bằng tài khoản cấp cao.
        </p>
        <button 
          onClick={() => router.push('/admin/login')}
          className="mt-8 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-black font-black uppercase tracking-wider text-[10px] px-6 py-3 rounded-xl transition-all"
        >
          <ArrowLeft size={14} /> Đi đến Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans tracking-tight">
      
      {/* TIÊU ĐỀ & LÀM MỚI */}
      <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-600">
            <MapPin size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-[1000] uppercase italic tracking-tighter">
              Khu vực <span className="text-red-600">Hồ Chí Minh</span>
            </h1>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1">
              Hệ thống quản lý giao dịch thực tế • Quyền SUPER_ADMIN
            </p>
          </div>
        </div>
        <button 
          onClick={fetchOrders} 
          className="p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:text-red-500 transition-all active:scale-95"
          title="Làm mới dữ liệu"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* THANH TÌM KIẾM */}
      <div className="relative mb-8 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="TÌM KIẾM MÃ ĐƠN, TRẠNG THÁI, PHƯƠNG THỨC..." 
          className="w-full bg-zinc-900/30 border border-white/5 rounded-2xl py-4 pl-14 text-[11px] font-bold outline-none focus:border-red-600/50 placeholder:text-zinc-700 text-white"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-red-600" size={40} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Đang truy xuất...</span>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-6 text-[9px] font-black uppercase text-zinc-700 italic">Mã giao dịch</th>
                <th className="p-6 text-[9px] font-black uppercase text-zinc-700 italic">Sản phẩm</th>
                <th className="p-6 text-[9px] font-black uppercase text-zinc-700 italic">Thanh toán</th>
                <th className="p-6 text-[9px] font-black uppercase text-zinc-700 italic text-right">Tổng tiền</th>
                <th className="p-6 text-[9px] font-black uppercase text-zinc-700 italic text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.01] group transition-all">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center text-zinc-800 group-hover:text-red-600 transition-colors">
                        <Hash size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black italic tracking-tight text-white">#{order.id}</p>
                        <p className="text-[8px] font-bold text-zinc-600 uppercase mt-1">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '---'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <Ticket size={12} className="text-red-700" />
                      <span className="text-[10px] font-black uppercase italic text-zinc-400">
                        {order.orderDetails?.length || 0} mục hàng
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-[10px] font-black uppercase text-zinc-500 italic">
                    {order.paymentMethod || 'Không xác định'}
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-base font-[1000] italic text-zinc-100">
                      {order.totalAmount?.toLocaleString('vi-VN')}đ
                    </p>
                    <span className={`text-[8px] font-black uppercase italic ${order.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-600'}`}>
                      • {order.status === 'SUCCESS' ? 'THÀNH CÔNG' : order.status || 'CHƯA RÕ'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => router.push(`/super-admin/order/${order.id}`)}
                      className="w-10 h-10 inline-flex items-center justify-center bg-zinc-900 hover:bg-white hover:text-black rounded-xl transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              )) : !loading && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-[10px] font-black uppercase text-zinc-800 tracking-[0.5em] italic">
                    Không tìm thấy dữ liệu đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
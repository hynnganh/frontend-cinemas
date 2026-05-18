"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Minus, ShoppingBasket, Loader2, Utensils } from 'lucide-react';
import { apiRequest, getImageUrl } from "@/app/lib/api"; 
import toast, { Toaster } from 'react-hot-toast';

export default function ComboPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = use(params);
  const router = useRouter();
  
  const [combos, setCombos] = useState<any[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Khôi phục trạng thái đặt vé và bắp nước từ sessionStorage (Chống reset dữ liệu)
  useEffect(() => {
    const saved = sessionStorage.getItem('booking_data');
    if (!saved) return router.push(`/booking/${showtimeId}`);
    
    const parsedData = JSON.parse(saved);
    setBookingData(parsedData);

    // Nếu trước đó đã chọn combo rồi quay lại thì giữ nguyên cụm cũ đã chọn
    if (parsedData.selectedCombos) {
      setSelectedCombos(parsedData.selectedCombos);
    }

    if (parsedData.cinemaItemId) {
      fetchCombos(parsedData.cinemaItemId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCombos = async (id: number) => {
    try {
      const res = await apiRequest(`/api/v1/admin/cinema-combos/${id}/combos`);
      if (res.ok) {
        const result = await res.json();
        setCombos(result.data || []);
      }
    } catch (e) { 
      toast.error("Lỗi tải menu bắp nước"); 
    } finally { 
      setLoading(false); 
    }
  };

  const updateQuantity = (combo: any, delta: number) => {
    setSelectedCombos(prev => {
      const existing = prev.find(i => i.id === combo.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.id !== combo.id);
        return prev.map(i => i.id === combo.id ? { ...i, quantity: newQty } : i);
      }
      return delta > 0 ? [...prev, { ...combo, quantity: 1 }] : prev;
    });
  };

  // 🔥 CHỐNG RESET KHI QUAY LẠI CHỌN GHẾ: Lưu trạng thái bắp nước hiện tại và cắm cờ báo luồng quay lại hợp pháp
  const handleBack = () => {
    const comboPrice = selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    const saved = sessionStorage.getItem('booking_data');
    const currentData = saved ? JSON.parse(saved) : {};

    sessionStorage.setItem('booking_data', JSON.stringify({
      ...currentData,
      selectedCombos,
      comboPrice
    }));
    
    // Cắm cờ để trang BookingPage biết đây là luồng quay lại -> Khôi phục lại ghế cũ
    sessionStorage.setItem('is_back_from_combos', 'true');
    
    router.back(); // Quay lại trang chọn ghế an toàn
  };

  const handleNext = () => {
    const comboPrice = selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
    const saved = sessionStorage.getItem('booking_data');
    const currentData = saved ? JSON.parse(saved) : {};

    sessionStorage.setItem('booking_data', JSON.stringify({
      ...currentData,
      selectedCombos,
      comboPrice
    }));
    
    router.push(`/booking/payment`);
  };

  const totalComboPrice = selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
  const finalTotal = (bookingData?.seatPrice || 0) + totalComboPrice;

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Đang tải menu bắp nước...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans pb-40 selection:bg-red-600/30">
      <Toaster position="top-center" />
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={handleBack} className="p-3 -ml-3 hover:bg-white/5 rounded-2xl transition-all group active:scale-90 border border-transparent hover:border-white/10">
            <ChevronLeft size={20} className="text-zinc-400 group-hover:text-white" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 mb-1">Canteen Menu</h1>
            <span className="text-[13px] font-black uppercase italic tracking-tight">Combo Bắp & Nước</span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-10 space-y-5">
        {combos.length > 0 ? combos.map((c: any) => {
          const qty = selectedCombos.find(i => i.id === c.id)?.quantity || 0;
          
          // Định nghĩa trạng thái hết hàng (Khi stock trả về từ chi nhánh bằng 0 hoặc null)
          const isOutOfStock = c.stock === null || c.stock <= 0;

          return (
            <div 
              key={c.id} 
              className={`group p-4 bg-zinc-900/20 border rounded-[2.5rem] flex flex-row items-center gap-5 transition-all duration-500 relative overflow-hidden ${
                isOutOfStock 
                  ? 'border-zinc-800/40 bg-zinc-950/20 opacity-40 select-none' 
                  : qty > 0 
                    ? 'border-red-600/40 bg-zinc-900/60 shadow-[0_0_30px_rgba(220,38,38,0.05)] hover:bg-zinc-900/40' 
                    : 'border-white/5 hover:bg-zinc-900/40'
              }`}
            >
              {/* Product Image */}
              <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-[1.8rem] bg-zinc-800 border border-white/10">
                <img 
                  src={getImageUrl(c.imageUrl)} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${!isOutOfStock && 'group-hover:scale-110'}`} 
                  alt={c.name} 
                />
                {qty > 0 && !isOutOfStock && <div className="absolute inset-0 bg-red-600/10 backdrop-blur-[1px]" />}
                {isOutOfStock && <div className="absolute inset-0 bg-black/50 backdrop-blur-[0.5px]" />}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-[15px] uppercase tracking-tight text-white truncate">{c.name}</h3>
                  {isOutOfStock && (
                    <span className="shrink-0 text-[8px] font-black tracking-widest bg-red-600/10 border border-red-600/30 text-red-500 px-2 py-0.5 rounded-full">
                      HẾT HÀNG
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-2 italic font-medium mb-2">{c.description}</p>
                <div className="text-lg font-[1000] text-red-500 tracking-tighter">
                  {c.price.toLocaleString()}<span className="text-[10px] ml-1 opacity-70">Đ</span>
                </div>
              </div>

              {/* Modern Horizontal Stepper */}
              <div className="flex items-center bg-black/40 border border-white/5 rounded-2xl p-1 gap-1 shrink-0">
                <button 
                  onClick={() => !isOutOfStock && updateQuantity(c, -1)} 
                  disabled={qty === 0 || isOutOfStock}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                    qty > 0 && !isOutOfStock
                      ? 'bg-zinc-800 text-white hover:bg-zinc-700 active:scale-90' 
                      : 'text-zinc-800 opacity-20 cursor-not-allowed'
                  }`}
                >
                  <Minus size={14} strokeWidth={3} />
                </button>

                <div className="w-8 text-center">
                  <span className={`text-[13px] font-black italic tracking-tighter ${qty > 0 && !isOutOfStock ? 'text-red-500' : 'text-zinc-700'}`}>
                    {isOutOfStock ? '00' : qty.toString().padStart(2, '0')}
                  </span>
                </div>

                <button 
                  onClick={() => !isOutOfStock && updateQuantity(c, 1)} 
                  disabled={isOutOfStock}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                    isOutOfStock 
                      ? 'text-zinc-800 opacity-10 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-red-600 hover:text-white active:scale-90 shadow-lg shadow-black/20'
                  }`}
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-40 opacity-20 border border-dashed border-white/10 rounded-[3rem]">
            <Utensils size={40} strokeWidth={1} className="mb-4" />
            <p className="text-[10px] uppercase font-black tracking-[0.4em] italic text-zinc-400">Đang cập nhật thực đơn</p>
          </div>
        )}
      </div>

      {/* Payment Footer Bar */}
      <div className="fixed bottom-10 left-0 right-0 px-6 z-50">
        <div className="max-w-md mx-auto p-5 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.9)] flex items-center justify-between">
          <div className="pl-3 border-l-2 border-red-600">
            <div className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">Tổng cộng</div>
            <div className="text-2xl font-[1000] text-white italic tracking-tighter leading-none">
              {finalTotal.toLocaleString()}<span className="text-[10px] ml-1 text-red-600 font-black">VND</span>
            </div>
          </div>

          <button 
            onClick={handleNext} 
            className="group h-14 px-8 bg-red-600 hover:bg-red-500 text-white rounded-[1.5rem] font-black italic uppercase text-[12px] tracking-[0.1em] transition-all active:scale-95 flex items-center gap-3 shadow-[0_10px_40px_rgba(220,38,38,0.3)]"
          >
            Thanh toán
            <div className="bg-black/20 p-2 rounded-xl group-hover:translate-x-1 transition-transform">
              <ShoppingBasket size={18} strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
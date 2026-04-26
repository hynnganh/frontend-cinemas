"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Minus, ShoppingBasket, Loader2, Sparkles, UtensilsCrossed } from 'lucide-react';
import { apiRequest, getImageUrl } from "@/app/lib/api"; 
import toast, { Toaster } from 'react-hot-toast';

export default function ComboPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = use(params);
  const router = useRouter();
  const [combos, setCombos] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('booking_data');
    if (!saved) return router.push(`/booking/${showtimeId}`);
    setBookingData(JSON.parse(saved));
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const res = await apiRequest('/api/v1/combos');
      if (res.ok) setCombos((await res.json()).data);
    } catch (error) {
      toast.error("Không thể tải danh sách combo");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    sessionStorage.setItem('booking_data', JSON.stringify({
      ...bookingData,
      selectedCombos,
      comboPrice: selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0)
    }));
    router.push(`/booking/payment`);
  };

  const updateQuantity = (combo: any, delta: number) => {
    setSelectedCombos(prev => {
      const existing = prev.find(i => i.id === combo.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.id !== combo.id);
        return prev.map(i => i.id === combo.id ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { ...combo, quantity: 1 }];
      return prev;
    });
  };

  const totalComboPrice = selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
  const finalTotal = (bookingData?.seatPrice || 0) + totalComboPrice;

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Đang chuẩn bị menu...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Decor Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-3xl mx-auto px-6 pt-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="group mb-8 text-zinc-500 hover:text-white transition-colors uppercase text-[10px] font-black italic flex items-center gap-2"
        >
          <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-red-600 transition-colors">
            <ChevronLeft size={14} className="group-hover:text-white" />
          </div>
          Trở lại chọn ghế
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <UtensilsCrossed size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-red-600" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Concession Stand</span>
            </div>
            <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter leading-none">
              Bắp <span className="text-red-600">&</span> Nước
            </h1>
          </div>
        </div>

        {/* Combo List */}
        <div className="grid grid-cols-1 gap-6">
          {combos.map((c: any) => {
            const qty = selectedCombos.find(i => i.id === c.id)?.quantity || 0;
            return (
              <div 
                key={c.id} 
                className={`group relative p-5 bg-zinc-900/20 border transition-all duration-500 rounded-[2.5rem] flex items-center gap-6 ${
                  qty > 0 ? 'border-red-600/50 bg-zinc-900/40 shadow-[0_0_30px_-10px_rgba(220,38,38,0.2)]' : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Image */}
                <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-3xl border border-white/5 bg-black">
                  <img 
                    src={getImageUrl(c.imageUrl)} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={c.name} 
                  />
                  {qty > 0 && (
                    <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center backdrop-blur-[2px]">
                       <div className="bg-white text-black text-xs font-black px-3 py-1 rounded-full uppercase italic tracking-widest animate-bounce">
                          Đã chọn
                       </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black italic uppercase text-lg leading-tight mb-1 group-hover:text-red-500 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide leading-relaxed mb-3 line-clamp-2 italic">
                    {c.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-[1000] italic text-white leading-none">
                      {c.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black text-red-600 uppercase">vnđ</span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-inner">
                  <button 
                    onClick={() => updateQuantity(c, -1)} 
                    className={`p-3 rounded-xl transition-all ${
                      qty > 0 ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'text-zinc-700 cursor-not-allowed'
                    }`}
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  
                  <div className="w-10 flex flex-col items-center">
                    <span className={`font-[1000] text-xl italic leading-none transition-colors ${qty > 0 ? 'text-red-600' : 'text-zinc-700'}`}>
                      {qty}
                    </span>
                  </div>

                  <button 
                    onClick={() => updateQuantity(c, 1)} 
                    className="p-3 bg-white text-black rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Checkout Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
        <div className="p-5 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex flex-row justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="pl-4">
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Tổng tiền dự kiến</p>
            <div className="flex items-baseline gap-1">
               <div className="text-3xl font-[1000] italic text-white uppercase tracking-tighter leading-none">
                {finalTotal.toLocaleString()}
              </div>
              <span className="text-xs font-black text-red-600 uppercase italic">đ</span>
            </div>
          </div>

          <button 
            onClick={handleNext} 
            className="group px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-[1000] italic uppercase tracking-[0.1em] transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-red-900/20"
          >
            Thanh toán 
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <ShoppingBasket size={18} />
            </div>
          </button>
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #050505; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, XCircle, Home, ArrowRight, Ticket, Clapperboard, HelpCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Particle {
  id: number;
  width: string;
  height: string;
  top: string;
  left: string;
  duration: string;
  delay: string;
}

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [count, setCount] = useState(5);
  const [particles, setParticles] = useState<Particle[]>([]);

  const responseCode = searchParams.get('vnp_ResponseCode');
  const isSuccess = responseCode === '00';
  const isCancelled = responseCode === '24'; // Mã 24: Khách hàng hủy giao dịch
  
  const amount = Number(searchParams.get('vnp_Amount') || 0) / 100;
  const txnRef = searchParams.get('vnp_TxnRef') || 'N/A';

  // 1. Khởi tạo hiệu ứng và quăng thông báo Toast chuẩn trạng thái VNPAY
  useEffect(() => {
    const generatedParticles = [...Array(12)].map((_, i) => ({
      id: i,
      width: Math.random() * 3 + 1 + 'px',
      height: Math.random() * 3 + 1 + 'px',
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      duration: Math.random() * 4 + 4 + 's',
      delay: Math.random() * 2 + 's'
    }));
    setParticles(generatedParticles);

    if (isSuccess) {
      toast.success("Thanh toán thành công!", { icon: '🎉', duration: 4000 });
    } else if (isCancelled) {
      toast.error("Hủy thanh toán đơn hàng", { icon: '🛑', duration: 4000 });
    } else if (responseCode) {
      toast.error("Giao dịch thất bại");
    }
  }, [isSuccess, isCancelled, responseCode]);

  // 2. Tự động đếm ngược chuyển vùng khi giao dịch thành công viên mãn
  useEffect(() => {
    if (!isSuccess) return;

    if (count === 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isSuccess, router]);

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background Glows mềm mại điện ảnh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-[120px] rounded-full animate-pulse-slow ${isSuccess ? 'bg-emerald-500/5' : 'bg-red-600/10'}`} />
        <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-zinc-900/40 blur-[90px] rounded-full" />
      </div>

      {/* Main Compact Card (Rút gọn max-w-[350px] siêu nhỏ gọn, tinh tế) */}
      <main className="relative z-10 w-full max-w-[350px] bg-zinc-950/60 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden scale-in-smooth">
        
        {isSuccess ? (
          /* ================= GIAO DIỆN THANH TOÁN THÀNH CÔNG ================= */
          <div>
            <div className="p-7 pb-4 text-center space-y-4 relative">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping-slow" />
                <div className="relative bg-zinc-950 border border-emerald-500 rounded-full w-full h-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={30} className="text-emerald-500 animate-bounce-short" />
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-[1000] italic uppercase tracking-tighter leading-none">
                  VÉ ĐÃ <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">SẴN SÀNG!</span>
                </h1>
                <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.3em]">
                  A&K Cinema Payment Gate
                </p>
              </div>
            </div>

            {/* Vé đứt đoạn rạp phim */}
            <div className="relative w-full h-4 flex items-center justify-between px-0 my-1">
              <div className="w-3 h-6 bg-[#030303] rounded-full -ml-1.5 border-r border-white/10" />
              <div className="w-full h-[1px] border-t border-dashed border-white/20" />
              <div className="w-3 h-6 bg-[#030303] rounded-full -mr-1.5 border-l border-white/10" />
            </div>

            <div className="p-7 pt-3 space-y-5">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4.5 space-y-3 text-xs text-zinc-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-zinc-500"><Ticket size={12} className="text-red-500"/> Mã đơn hàng</span>
                  <span className="font-black text-white text-sm tracking-wide">#{txnRef}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-zinc-500"><Clapperboard size={12} className="text-red-500"/> Trạng thái</span>
                  <span className="font-black text-emerald-500 uppercase text-[9px] bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">Đã thanh toán</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                  <span className="font-bold uppercase text-[9px] text-zinc-500">Số tiền</span>
                  <span className="text-lg font-[1000] italic text-red-500 tracking-tighter">{amount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Đếm ngược hành trình */}
              <div className="space-y-2 text-center">
                <div className="w-full h-[2px] bg-zinc-900 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-red-600 rounded-full animate-countdown-bar" />
                </div>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                  Chuyển hướng trang chủ sau <span className="text-zinc-400">{count}s</span>
                </p>
              </div>

              <button 
                onClick={() => router.push('/')}
                className="group w-full py-3.5 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all duration-500 active:scale-95 shadow-xl"
              >
                Về trang chủ <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300"/>
              </button>
            </div>
          </div>
        ) : (
          /* ================= GIAO DIỆN THANH TOÁN THẤT BẠI / HỦY VÉ ================= */
          <div>
            <div className="p-7 pb-4 text-center space-y-4 relative">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping-slow" />
                <div className="relative bg-zinc-950 border border-red-600 rounded-full w-full h-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.25)]">
                  <XCircle size={30} className="text-red-600 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-[1000] italic uppercase tracking-tighter leading-none">
                  GIAO DỊCH <span className="text-red-600">{isCancelled ? "ĐÃ HỦY" : "THẤT BẠI"}</span>
                </h1>
                <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.3em]">
                  A&K Cinema Payment Gate
                </p>
              </div>
            </div>

            {/* Vé đứt đoạn rạp phim */}
            <div className="relative w-full h-4 flex items-center justify-between px-0 my-1">
              <div className="w-3 h-6 bg-[#030303] rounded-full -ml-1.5 border-r border-white/10" />
              <div className="w-full h-[1px] border-t border-dashed border-white/20" />
              <div className="w-3 h-6 bg-[#030303] rounded-full -mr-1.5 border-l border-white/10" />
            </div>

            <div className="p-7 pt-3 space-y-5">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4.5 space-y-3 text-xs text-zinc-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-zinc-500"><Ticket size={12} className="text-zinc-600"/> Mã đơn hàng</span>
                  <span className="font-black text-white text-sm tracking-wide">#{txnRef}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-zinc-500"><HelpCircle size={12} className="text-zinc-600"/> Tình trạng</span>
                  <span className="font-black text-red-500 uppercase text-[9px] bg-red-500/5 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                    {isCancelled ? "Hủy thanh toán" : "Lỗi giao dịch"}
                  </span>
                </div>
                
                {/* HIỂN THỊ TIN NHẮN GIẢI THÍCH LÝ DO DÂN DÃ, TRỰC DIỆN */}
                <p className="text-[10px] text-zinc-500 italic font-medium pt-2 border-t border-white/5 leading-relaxed text-center">
                  {isCancelled 
                    ? "Ông đã chủ động hủy giao dịch trên ví VNPAY. Ghế và combo đã được giải phóng." 
                    : "Đã có sự cố kết nối ngân hàng hoặc thẻ không đủ số dư. Vui lòng thử lại!"}
                </p>
              </div>

              <button 
                onClick={() => router.push('/')}
                className="w-full py-3.5 bg-zinc-900 border border-white/5 text-white hover:bg-white hover:text-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 active:scale-95 shadow-md"
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Cinematic Float Particles */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        {particles.map((p) => (
          <div 
            key={p.id}
            className="absolute bg-white rounded-full animate-float-glow"
            style={{
              width: p.width,
              height: p.height,
              top: p.top,
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
          50% { transform: translateY(-20px) scale(1.3); opacity: 0.5; }
        }
        .scale-in-smooth {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-countdown-bar {
          animation: countdown 5s linear forwards;
        }
        .animate-float-glow {
          animation: floatGlow infinite ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse infinite ease-in-out 4s;
        }
        .animate-ping-slow {
          animation: ping infinite cubic-bezier(0, 0, 0.2, 1) 2.5s;
        }
        .animate-bounce-short {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
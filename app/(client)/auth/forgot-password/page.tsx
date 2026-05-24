"use client";

import React, { useState } from 'react';
import { Mail, ChevronLeft, ShieldCheck, Loader2, ArrowRight, Fingerprint, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/app/lib/api'; // Hoặc đường dẫn file chứa hàm gọi API của ông
import toast, { Toaster } from 'react-hot-toast'; // Thêm Toaster để thông báo xịn hơn

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập Email!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Đang kiểm tra và gửi mã OTP...");

    try {
      // 🎯 GỌI API FORGOT PASSWORD Ở BACKEND
      const res = await apiRequest(`/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      });

      if (res.ok) {
        toast.success("Đã gửi mã OTP thành công!", { id: toastId });
        setIsSent(true);
      } else {
        const result = await res.json().catch(() => ({}));
        toast.error(result.message || "Tài khoản Email không tồn tại trong hệ thống!", { id: toastId });
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ!", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white font-sans overflow-hidden selection:bg-red-600/30">
      <Toaster position="top-right" /> {/* 🎯 THÊM TOASTER HIỂN THỊ LỖI */}
      
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 md:px-20 py-12 relative z-10 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
        
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-[460px] mx-auto w-full">
          
          <Link 
            href="/auth" 
            className="mb-12 inline-flex items-center gap-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all tracking-[0.3em] group"
          >
            <div className="p-2 rounded-full border border-white/5 group-hover:border-red-600/50 group-hover:-translate-x-1 transition-all">
                <ChevronLeft size={14} />
            </div>
            Quay lại đăng nhập
          </Link>

          {!isSent ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-[9px] font-black uppercase tracking-widest text-red-500">
                  <Sparkles size={10} /> Bảo mật tài khoản
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-[0.9]">
                  Khôi phục<br/>
                  <span className="text-red-600 text-3xl not-italic">Mật khẩu</span>
                </h2>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[380px]">
                  Vui lòng cung cấp Email đã đăng ký thành viên. Chúng tôi sẽ gửi mã xác nhận OTP để bạn thiết lập lại quyền truy cập.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Email thành viên</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com" 
                      className="w-full bg-white/5 border border-white/10 p-4 pl-14 rounded-2xl outline-none focus:border-red-600 focus:bg-white/[0.08] transition-all text-sm text-white placeholder:text-zinc-800" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Gửi yêu cầu xác thực
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* 🎯 TRẠNG THÁI GỬI THÀNH CÔNG -> HIỂN THỊ NÚT CHUYỂN TỚI TRANG NHẬP OTP */
            <div className="text-center py-10 animate-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/20 rotate-12 hover:rotate-0 transition-transform duration-500">
                <ShieldCheck className="text-green-500 animate-pulse" size={48} />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Kiểm tra Mail!</h2>
              <p className="text-zinc-500 text-sm mb-12 leading-relaxed font-medium">
                Một mã xác thực (OTP) đã được gửi đến Email của bạn.<br/>
                Vui lòng kiểm tra cả <span className="text-white italic underline underline-offset-4">Hộp thư rác (Spam)</span>.
              </p>
              
              <Link 
                href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                className="w-full mb-6 py-4 bg-white text-black font-black uppercase text-[11px] tracking-[0.4em] rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center"
              >
                Nhập mã OTP ngay
              </Link>

              <button 
                onClick={() => setIsSent(false)} 
                className="text-[10px] font-black uppercase text-red-600 tracking-widest hover:text-white transition-colors border-b border-red-600/30 pb-1 mt-4"
              >
                Gửi lại mã mới
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- BÊN PHẢI: DECORATIVE SECTION (POSTER CINEMA) --- */}
      <div className="hidden lg:flex w-[45%] bg-[#080808] relative items-center justify-center p-20 border-l border-white/5 overflow-hidden">
        {/* Lớp hạt nhiễu (Grain) tạo cảm giác phim nhựa cũ */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Glow đỏ huyền bí */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[150px] animate-pulse" />
        
        <div className="relative z-10 text-center">
          <div className="relative w-[380px] h-[550px] mx-auto rounded-[4rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] border border-white/10 group">
             <img 
                src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000" 
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-[2000ms] group-hover:scale-105" 
                alt="Cinema Background" 
              />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
             
             <div className="absolute bottom-16 left-0 right-0 px-12 space-y-5">
                <div className="w-14 h-14 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                    <Fingerprint className="text-red-600" size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic underline decoration-red-600 decoration-4 underline-offset-8">
                        Bảo mật tối đa
                    </h2>
                    <p className="text-zinc-500 text-[11px] leading-relaxed font-bold uppercase tracking-widest opacity-60">
                        Xác thực danh tính thành viên A&K
                    </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Tối ưu hóa Input Date/Select cho trình duyệt */}
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px #121212 inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
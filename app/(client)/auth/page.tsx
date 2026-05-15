"use client";
import { useState } from "react";
import { 
  User, Phone, Mail, Lock, Calendar, Eye, EyeOff, 
  ShieldCheck, Loader2, ArrowRight, Fingerprint, ChevronLeft 
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { apiRequest } from "../../lib/api";

const ForgotPasswordView = ({ onBack }: any) => {
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
    }, 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all tracking-[0.2em] group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Quay lại
      </button>

      {!isSent ? (
        <div className="space-y-6 text-left">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">Quên mật khẩu?</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group text-left">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={18} />
              <input type="email" required placeholder="example@gmail.com" className="w-full bg-white/5 border border-white/10 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-600 transition-all text-sm text-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Gửi mã xác nhận"}
            </button>
          </form>
        </div>
      ) : (
        <div className="text-center py-10 animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
            <ShieldCheck className="text-green-500 animate-pulse" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Kiểm tra Email</h2>
          <button onClick={() => setIsSent(false)} className="text-[10px] font-black uppercase text-red-600 tracking-widest hover:text-white transition-colors">Gửi lại</button>
        </div>
      )}
    </div>
  );
};

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    dateOfBirth: "",
    avatar: "",
    gender: "MALE",
    roles: ["USER"]
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = view === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
    
    try {
      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(view === 'login' ? { email: formData.email, password: formData.password } : formData),
      });

      const resData = await response.json();

      if (response.ok) {
if (view === 'login') {
  const rawUser = resData.data;
  const token = rawUser?.token;
  const roles: string[] = rawUser?.roles || [];

  if (!token) {
    toast.error("Không nhận được token!");
    return;
  }

  const primaryRole = roles[0] || "USER";

  localStorage.setItem("user_info", JSON.stringify({
    firstName: rawUser?.firstName,
    lastName: rawUser?.lastName
  }));
  localStorage.setItem("roles", JSON.stringify(roles));

  if (primaryRole === "ROLE_SUPER_ADMIN" || primaryRole === "SUPER_ADMIN") {
    localStorage.setItem("super_admin_token", token);
  } else if (primaryRole === "ROLE_ADMIN" || primaryRole === "ADMIN") {
    localStorage.setItem("admin_token", token);
  } else {
    localStorage.setItem("user_token", token);
  }

  window.dispatchEvent(new Event("auth-changed"));

  toast.success(`Chào mừng ${rawUser?.lastName || ''} đã trở lại!`);

  setTimeout(() => {
    if (primaryRole.includes("SUPER_ADMIN")) window.location.href = "/super-admin";
    else if (primaryRole.includes("ADMIN")) window.location.href = "/admin";
    else window.location.href = "/";
  }, 800);
} else {
          toast.success("Đăng ký thành công! Mời bạn đăng nhập.");
          setView('login');
        }
      } else {
        console.error("Lỗi Auth:", resData);
        toast.error(resData.message || "Thông tin không chính xác!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white font-sans overflow-x-hidden">
      <Toaster position="top-right" />
      
      {/* BÊN TRÁI: FORM */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 md:px-20 py-12 overflow-y-auto relative z-10">
        <div className="max-w-[480px] mx-auto w-full">
          {view !== 'forgot' ? (
            <div className="animate-in fade-in slide-in-from-left-6 duration-700">
              {/* Tabs */}
              <div className="flex gap-8 mb-10 border-b border-white/5 relative">
                <button type="button" onClick={() => setView('login')} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${view === 'login' ? "text-white" : "text-zinc-600"}`}>Đăng Nhập</button>
                <button type="button" onClick={() => setView('register')} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${view === 'register' ? "text-white" : "text-zinc-600"}`}>Đăng Ký</button>
                <div className={`absolute bottom-0 h-0.5 bg-red-600 transition-all duration-500 ${view === 'login' ? "left-0 w-[90px]" : "left-[120px] w-[80px]"}`} />
              </div>

              <form className="space-y-5" onSubmit={handleAuth}>
                {view === 'register' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 ml-1">Họ</label>
                      <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                        <input name="lastName" value={formData.lastName} onChange={handleChange} required type="text" placeholder="Nguyễn" className="w-full bg-white/5 border border-white/10 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-600 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 ml-1">Tên</label>
                      <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                        <input name="firstName" value={formData.firstName} onChange={handleChange} required type="text" placeholder="An" className="w-full bg-white/5 border border-white/10 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-600 text-sm" />
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 ml-1">Số điện thoại</label>
                      <div className="relative group">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                        <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required type="tel" placeholder="09xxxxxxxx" className="w-full bg-white/5 border border-white/10 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-600 text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 ml-1">Email</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                    <input name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="example@gmail.com" className="w-full bg-white/5 border border-white/10 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-600 text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">Mật khẩu</label>
                    {view === 'login' && <button type="button" onClick={() => setView('forgot')} className="text-[10px] text-red-500 font-black uppercase">Quên mật khẩu?</button>}
                  </div>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                    <input name="password" value={formData.password} onChange={handleChange} required type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-600 text-sm" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {view === 'register' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 ml-1">Ngày sinh</label>
                      <div className="relative group">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                        <input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required type="date" className="w-full bg-white/5 border border-white/10 p-[13px] pl-12 rounded-2xl outline-none focus:border-red-600 text-sm text-zinc-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 ml-1">Giới tính</label>
                      <div className="relative flex bg-white/5 rounded-2xl p-1 border border-white/10 h-[52px]">
                        <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-600 rounded-xl transition-all ${formData.gender === "FEMALE" ? "left-[calc(50%+2px)]" : "left-1"}`} />
                        <button type="button" onClick={() => setFormData({...formData, gender: "MALE"})} className={`relative z-10 flex-1 text-[11px] font-black uppercase ${formData.gender === "MALE" ? "text-white" : "text-zinc-500"}`}>Nam</button>
                        <button type="button" onClick={() => setFormData({...formData, gender: "FEMALE"})} className={`relative z-10 flex-1 text-[11px] font-black uppercase ${formData.gender === "FEMALE" ? "text-white" : "text-zinc-500"}`}>Nữ</button>
                      </div>
                    </div>
                    
                  </div>
                )}

                <button disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-2 mt-6 group">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : (view === 'login' ? "Vào Rạp Ngay" : "Tạo Tài Khoản")}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          ) : (
            <ForgotPasswordView onBack={() => setView('login')} />
          )}
        </div>
      </div>

      {/* BÊN PHẢI: DECOR */}
      <div className="hidden lg:flex w-[45%] bg-[#080808] relative items-center justify-center p-20 border-l border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="relative z-10 w-[360px] h-[520px] rounded-[3.5rem] overflow-hidden border border-white/10 group">
          <img src={view === 'login' ? "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000" : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt="Cinema" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
          <div className="absolute bottom-16 left-0 right-0 px-12 text-center">
            <Fingerprint className="text-red-600 mx-auto mb-4" size={32} />
            <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">A&K Experience</h2>
            <p className="text-zinc-500 text-[10px] mt-2 leading-relaxed">Đắm chìm trong không gian điện ảnh đỉnh cao cùng hệ thống rạp hiện đại nhất.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
      `}</style>
    </div>
  );
}
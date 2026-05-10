"use client";

import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, Phone, Mail, Loader2, Calendar, 
  UserCircle, Save, Edit3, CheckCircle2, AlertCircle,
  ShieldCheck, ArrowLeft, Camera
} from 'lucide-react';
import { apiRequest } from '../../lib/api'; 
import Link from 'next/link';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); 
  const [formData, setFormData] = useState<any>({}); 
  const [updating, setUpdating] = useState(false); 
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await apiRequest('/api/v1/users/me');
      if (res.ok) {
        const result = await res.json();
        const rawData = result.data; // Chỉ lấy phần data chứa thông tin người dùng
        setUserData(rawData);
        setFormData({
          firstName: rawData.firstName || '',
          lastName: rawData.lastName || '',
          mobileNumber: rawData.mobileNumber || '',
          gender: rawData.gender || '',
          dateOfBirth: rawData.dateOfBirth || ''
        });
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await apiRequest('/api/v1/users/me', {
        method: 'PUT',
        body: JSON.stringify(formData) 
      });

      if (res.ok) {
        showToast("Cập nhật thông tin thành công!");
        setIsEditing(false);
        fetchProfile();
      } else {
        showToast("Cập nhật thất bại", "error");
      }
    } catch (err) { showToast("Lỗi kết nối", "error"); } 
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white no-scrollbar selection:bg-red-600/30 pb-10 overflow-y-auto">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] -z-10" />

      {/* Top Navigation */}
      <nav className="p-6 md:px-12 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
          <span className="text-[10px] font-black uppercase tracking-widest">Trang chủ</span>
        </Link>
        <div className="flex gap-4">
           {!isEditing ? (
             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-black uppercase text-[9px] hover:bg-red-600 hover:text-white transition-all active:scale-95">
               <Edit3 size={12}/> Chỉnh sửa
             </button>
           ) : (
             <div className="flex gap-3">
               <button onClick={() => setIsEditing(false)} className="text-[9px] font-black uppercase text-zinc-500 hover:text-white">Hủy</button>
               <button onClick={handleUpdate} disabled={updating} className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[9px] hover:bg-red-500 shadow-lg shadow-red-600/20 active:scale-95 transition-all">
                 {updating ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>} Lưu thay đổi
               </button>
             </div>
           )}
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto mt-12 px-6">
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          
          {/* CỘT TRÁI: AVATAR & HỌ TÊN (Gọn gàng) */}
          <section className="w-full lg:w-[320px]">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 flex flex-col items-center text-center h-full shadow-2xl">
              <div className="relative mb-8 group">
                <div className="w-40 h-40 rounded-[3.5rem] bg-zinc-900 border border-white/10 p-1.5 shadow-2xl">
                  <div className="w-full h-full rounded-[3.2rem] bg-black flex items-center justify-center overflow-hidden">
                    {userData?.avatar ? 
                      <img src={userData.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="avatar" /> : 
                      <UserIcon size={50} className="text-zinc-800" />
                    }
                  </div>
                </div>
                <button className="absolute -bottom-1 -right-1 bg-red-600 p-3 rounded-2xl border-4 border-[#0a0a0a] hover:scale-110 transition-all shadow-xl">
                  <Camera size={16} />
                </button>
              </div>

              <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-tight mb-4">
                {userData?.firstName} <span className="text-red-600">{userData?.lastName}</span>
              </h1>
              
              <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                 <ShieldCheck size={14} className="text-red-600" />
                 <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">Hội viên</span>
              </div>
            </div>
          </section>

          {/* CỘT PHẢI: FORM CHỈ HIỆN THÔNG TIN CẦN THIẾT */}
          <section className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-8 md:p-12 shadow-3xl">
            <div className="mb-10">
               <h2 className="text-xl font-[1000] italic uppercase tracking-tighter">Thông tin <span className="text-zinc-600">Cá nhân</span></h2>
               <div className="h-1 w-10 bg-red-600 mt-2 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {!isEditing ? (
                <>
                  <ViewField label="Họ & Tên đệm" value={userData?.firstName} icon={UserIcon} />
                  <ViewField label="Tên người dùng" value={userData?.lastName} icon={UserIcon} />
                  <ViewField label="Địa chỉ Email" value={userData?.email} icon={Mail} isLocked />
                  <ViewField label="Số điện thoại" value={userData?.mobileNumber} icon={Phone} />
                  <ViewField label="Ngày sinh" value={userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật"} icon={Calendar} />
                  <ViewField label="Giới tính" value={userData?.gender === 'MALE' ? 'Nam' : userData?.gender === 'FEMALE' ? 'Nữ' : 'Khác'} icon={UserCircle} />
                </>
              ) : (
                <>
                  <EditField label="Họ & Tên đệm" name="firstName" value={formData.firstName} onChange={handleChange} icon={UserIcon} />
                  <EditField label="Tên của bạn" name="lastName" value={formData.lastName} onChange={handleChange} icon={UserIcon} />
                  <div className="opacity-20 pointer-events-none">
                    <ViewField label="Email" value={userData?.email} icon={Mail} isLocked />
                  </div>
                  <EditField label="Số điện thoại" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} icon={Phone} />
                  <EditField label="Ngày sinh" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} icon={Calendar} type="date" />
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-red-600/50 ml-1">Giới tính</label>
                    <div className="relative group">
                      <UserCircle size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" />
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/5 p-5 pl-14 rounded-[1.8rem] text-sm text-white outline-none focus:border-red-600 transition-all appearance-none cursor-pointer">
                        <option value="MALE" className="bg-[#0a0a0a]">Nam</option>
                        <option value="FEMALE" className="bg-[#0a0a0a]">Nữ</option>
                        <option value="OTHER" className="bg-[#0a0a0a]">Khác</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Thông báo */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl border shadow-2xl backdrop-blur-2xl ${toast.type === 'success' ? 'bg-zinc-900/90 border-green-500/20 text-green-400' : 'bg-zinc-900/90 border-red-500/20 text-red-400'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="text-[11px] font-black uppercase tracking-tight text-white">{toast.msg}</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function ViewField({ label, value, icon: Icon, isLocked = false }: any) {
  return (
    <div className="group space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 group-hover:text-red-600 transition-colors ml-1">{label}</label>
      <div className="flex items-center gap-5 p-5 bg-white/[0.02] border border-white/5 rounded-[1.8rem] transition-all group-hover:bg-white/[0.04] group-hover:border-white/10">
        <Icon size={18} className="text-zinc-700 group-hover:text-red-600 transition-colors shrink-0" />
        <span className={`text-sm font-bold tracking-tight truncate ${isLocked ? 'text-zinc-600 italic' : 'text-zinc-200'}`}>
          {value || "N/A"}
        </span>
      </div>
    </div>
  );
}

function EditField({ label, name, value, onChange, icon: Icon, type = "text" }: any) {
  return (
    <div className="space-y-1 animate-in fade-in zoom-in-95 duration-500">
      <label className="text-[10px] font-black uppercase tracking-widest text-red-600 ml-1">{label}</label>
      <div className="relative group">
        <Icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-all" />
        <input 
          type={type} name={name} value={value} onChange={onChange} 
          className="w-full bg-white/[0.05] border border-white/10 p-5 pl-14 rounded-[1.8rem] text-sm text-white outline-none focus:border-red-600 transition-all [color-scheme:dark]" 
        />
      </div>
    </div>
  );
}
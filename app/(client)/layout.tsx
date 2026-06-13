import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TopBanner from "./components/TopBanner";
import TopMenu from "./components/TopMenu";
import ChatBubble from "./components/ChatBubble"; // 🔥 ĐÃ THÊM: Import component bong bóng chat

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBanner />
      <TopMenu />
      <Navbar />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      
      {/* 🔥 ĐÃ THÊM: Đặt bong bóng chat ở ngoài cùng, dưới Footer để nó lơ lửng ở mọi trang */}
      <ChatBubble />
    </>
  );
}
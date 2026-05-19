import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TopBanner from "./components/TopBanner";
import TopMenu from "./components/TopMenu";

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
    </>
  );
}
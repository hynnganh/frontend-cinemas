import Banner from "./(client)/components/home/Banner";
import MovieSection from "./(client)/components/home/MovieSection";
import HeroSection from "./(client)/components/home/HeroSection";
import TopBanner from "./(client)/components/TopBanner";
import TopMenu from "./(client)/components/TopMenu";
import Navbar from "./(client)/components/Navbar";
import Footer from "./(client)/components/Footer";

export default function Home() {
  return (
    <>
      <TopBanner />
      <TopMenu />
      <Navbar />
      <HeroSection />
      <MovieSection />
      <Footer />
    </>
  );
}
import NewReleasesSection from "../components/AllMovies";
import MovieCarousel from "../components/Carousel";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <MovieCarousel />
      <NewReleasesSection />
      <Footer />
    </div>
  );
};

export default Home;

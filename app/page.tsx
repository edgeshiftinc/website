import Navbar       from '@/components/layout/Navbar';
import Cursor       from '@/components/layout/Cursor';
import Hero         from '@/components/sections/Hero';
import StatsBar     from '@/components/sections/StatsBar';
import About        from '@/components/sections/About';
import Services     from '@/components/sections/Services';
import Argus        from '@/components/sections/Argus';
import Process      from '@/components/sections/Process';
import Industries   from '@/components/sections/Industries';
import Testimonials from '@/components/sections/Testimonials';
import Contact      from '@/components/sections/Contact';
import Footer       from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <About />
        <Services />
        <Argus />
        <Process />
        <Industries />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
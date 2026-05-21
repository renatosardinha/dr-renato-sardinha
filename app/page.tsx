import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFAB } from '@/components/WhatsAppFAB';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Process } from '@/components/sections/Process';
import { Audience } from '@/components/sections/Audience';
import { Differentials } from '@/components/sections/Differentials';
import { Testimonials } from '@/components/sections/Testimonials';
import { FAQ } from '@/components/sections/FAQ';
import { CTAFinal } from '@/components/sections/CTAFinal';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Process />
        <Audience />
        <Differentials />
        <Testimonials />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}

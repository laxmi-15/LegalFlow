import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-accent/10 selection:text-foreground">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  );
}

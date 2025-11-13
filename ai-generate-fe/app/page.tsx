"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Utensils, MapPin } from "lucide-react";
import Navbar from "./components/Navbar";
import Link from "next/link";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navbar */}
      <Navbar scrolled={scrolled} />

      {/* Hero */}
      <main id="hero" className="relative flex flex-col md:flex-row w-full h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgb(15 23 42)",
            opacity: 0.95,
          }}
        ></div>
        <div
          className="absolute inset-0 block"
          style={{
            clipPath: "polygon(70% 0, 100% 0, 100% 100%, 30% 100%)",
            backgroundImage: "url('/home.avif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-slate-900/80"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full h-full text-center px-6 md:px-20">
          <div className="max-w-4xl text-white">
            <motion.h2
              layout="position"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight"
            >
              Temukan <span className="text-orange-400">Restoran Terbaik</span>
              <br /> dengan Bantuan AI
            </motion.h2>

            <motion.p layout="position" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="text-slate-300 max-w-3xl mx-auto mb-8">
              Cukup tulis keinginanmu, unggah gambar makanan, atau masukkan lokasi — <span className="text-orange-400 font-semibold">TasteAI</span> akan menemukan restoran yang cocok dengan seleramu.
            </motion.p>

            <motion.div layout="position" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, duration: 0.6 }} className="mx-auto">
              <Link href="/login" className="w-46 bg-orange-500 hover:bg-orange-600 transition px-6 py-3 rounded-full font-semibold flex items-center gap-2 cursor-pointer justify-center mx-auto">
                Coba Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Fitur */}
      <section id="fitur" className="bg-slate-800 py-16 px-6 md:px-20 text-center scroll-mt-16">
        <h3 className="text-3xl font-bold mb-10">Fitur Unggulan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard
            icon={<Utensils className="w-10 h-10 text-orange-400" />}
            title="Rekomendasi Pintar"
            desc="TasteAI menganalisis prompt dan gambar makananmu untuk menemukan restoran terbaik di sekitarmu."
          />
          <FeatureCard icon={<MapPin className="w-10 h-10 text-orange-400" />} title="Berbasis Lokasi" desc="Masukkan kota atau daerahmu, dan dapatkan saran restoran terdekat yang sesuai selera." />
          <FeatureCard icon={<Brain className="w-10 h-10 text-orange-400" />} title="Ditenagai AI" desc="Menggunakan kecerdasan buatan untuk memahami rasa, tekstur, dan gaya kuliner favoritmu." />
        </div>
      </section>

      {/* About */}
      <section id="tentang" className="py-20 px-6 md:px-20 text-center bg-slate-900">
        <h3 className="text-3xl font-bold mb-6">Tentang TasteAI</h3>
        <p className="text-slate-300 max-w-3xl mx-auto leading-relaxed">
          TasteAI lahir dari ide sederhana: bagaimana jika AI bisa memahami selera manusia? Dengan menggabungkan teknologi pengenalan gambar, pemrosesan bahasa alami, dan data kuliner, kami
          menciptakan platform yang membantu kamu menemukan tempat makan terbaik — bukan hanya berdasarkan rating, tapi juga <span className="text-orange-400 font-semibold">selera pribadi</span>.
        </p>
      </section>

      {/* <section id="mulai" className="bg-orange-600 py-16 text-center text-white">
        <h3 className="text-3xl font-bold mb-4">Siap Menemukan Rasa Favoritmu?</h3>
        <p className="mb-8 text-white/90">Mulai sekarang dan biarkan AI memahami selera kulinermu!</p>
        <Link href="/register">
          <button className="bg-white text-orange-600 hover:bg-slate-100 transition px-6 py-3 rounded-full font-semibold cursor-pointer">Daftar Sekarang</button>
        </Link>
      </section> */}

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-800">Copyright © {new Date().getFullYear()} TasteAI · All rights reserved.</footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
      <div className="flex justify-center mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-slate-400 text-sm">{desc}</p>
    </motion.div>
  );
}

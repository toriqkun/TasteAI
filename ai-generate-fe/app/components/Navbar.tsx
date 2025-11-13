"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Header (selalu kelihatan) */}
      <header
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-10 py-3 z-50 transition-all backdrop-blur-md
    ${scrolled ? "bg-slate-900 shadow-md" : "bg-transparent shadow-none"}
  `}
      >
        {/* Logo */}
        <h1 className="text-2xl font-bold text-orange-400 py-1">TasteAI</h1>

        {/* Desktop only: Sign In / Sign Up */}
        <nav className="hidden md:flex gap-3 items-center">
          <Link href="/login" className="px-5 py-2 border border-orange-400 rounded-full hover:bg-slate-800 hover:text-white transition">
            Masuk
          </Link>
          <Link href="/register" className="px-5 py-2 bg-orange-500 hover:bg-orange-600 rounded-full transition">
            Daftar
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          {open ? <X size={28} onClick={() => setOpen(false)} className="cursor-pointer" /> : <Menu size={28} onClick={() => setOpen(true)} className="cursor-pointer" />}
        </div>
      </header>

      {/* Overlay + Drawer (keluar dari header, cover full screen) */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay full screen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-60"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 h-screen w-1/2 sm:w-1/2 bg-slate-900 shadow-lg z-70 flex flex-col"
            >
              {/* Header with Close */}
              <div className="flex items-center justify-end p-4">
                <X size={28} onClick={() => setOpen(false)} className="cursor-pointer text-gray-700 hover:text-orange-400 font-semibold" />
              </div>

              {/* Menu Links */}
              <div className="flex flex-col text-lg font-medium">
                <button onClick={() => scrollToSection("hero")} className="py-4 px-6 text-left text-gray-700 hover:text-orange-400 font-semibold cursor-pointer">
                  Home
                </button>
                <button onClick={() => scrollToSection("fitur")} className="py-4 px-6 text-left text-gray-700 hover:text-orange-400 font-semibold cursor-pointer">
                  Fitur
                </button>
                <button onClick={() => scrollToSection("tentang")} className="py-4 px-6 text-left text-gray-700 hover:text-orange-400 font-semibold cursor-pointer">
                  About
                </button>
                {/* <button onClick={() => scrollToSection("mulai")} className="py-4 px-6 text-left text-gray-700 hover:text-orange-400 font-semibold cursor-pointer">
                  Mulai
                </button> */}
              </div>

              {/* Bottom Buttons */}
              <div className="mt-auto flex flex-col gap-3 p-6">
                <Link href="/login" className="w-full text-center px-5 py-2 border border-orange-400 rounded-full hover:bg-orange-500 transition">
                  Masuk
                </Link>
                <Link href="/register" className="w-full text-center px-5 py-2 bg-orange-500 hover:bg-orange-600 rounded-full transition">
                  Daftar
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface Card {
  id: number;
  title: string;
  location: string;
  description: string;
  image?: string;
  link: string;
}

interface RecommendationCardProps {
  cards: Card[];
}

export default function RecommendationCard({ cards }: RecommendationCardProps) {
  const [active, setActive] = useState(0);
  if (cards.length === 0) return null;

  const prevSlide = () => setActive((prev) => (prev - 1 + cards.length) % cards.length);
  const nextSlide = () => setActive((prev) => (prev + 1) % cards.length);

  const getTransform = (index: number) => {
    const total = cards.length;
    const leftIndex = (active - 1 + total) % total;
    const rightIndex = (active + 1) % total;

    if (index === active) return "translate-x-0 scale-100 opacity-100 z-30";
    if (index === leftIndex) return "-translate-x-[60%] scale-90 opacity-70 -rotate-y-12 z-20";
    if (index === rightIndex) return "translate-x-[60%] scale-90 opacity-70 rotate-y-12 z-20";
    return "opacity-0 scale-75 z-0";
  };

  return (
    <section className="relative w-full flex flex-col items-center justify-center py-10 overflow-hidden">
      <h2 className="text-2xl font-bold text-orange-500 mb-8">Rekomendasi untukmu</h2>

      <div className="relative w-[90%] md:w-[70%] h-[420px] flex items-center justify-center perspective-[1000px]">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`absolute transition-all duration-700 ease-in-out bg-slate-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-slate-700 text-white ${getTransform(i)}`}
            style={{ transformStyle: "preserve-3d", width: "330px" }}
          >
            {card.image && <Image src={card.image} alt={card.title} width={400} height={200} className="w-full h-44 object-cover" />}
            <div className="p-4 pb-8 text-center">
              <h3 className="font-bold text-lg mb-1 text-orange-400">{card.title}</h3>
              <p className="flex gap-1 items-center justify-center text-sm text-slate-300 mb-3 leading-snug">
                <MapPin size={15} /> {card.location}
              </p>
              <p className="text-sm text-slate-300 mb-6 leading-snug">{card.description}</p>
              <a href={card.link} target="_blank" rel="noopener noreferrer" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition">
                Lihat di Google Maps
              </a>
            </div>
          </div>
        ))}

        <button onClick={prevSlide} className="absolute left-0 md:-left-10 bg-slate-700/60 hover:bg-orange-500 p-3 rounded-full text-white transition z-40">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="absolute right-0 md:-right-10 bg-slate-700/60 hover:bg-orange-500 p-3 rounded-full text-white transition z-40">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex mt-6 gap-2">
        {cards.map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === active ? "bg-orange-500 scale-110" : "bg-slate-500 scale-90"}`} />
        ))}
      </div>
    </section>
  );
}

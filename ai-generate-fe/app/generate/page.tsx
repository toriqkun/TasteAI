"use client";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, FolderUp, Trash2, LogOut, Pencil, History, Info } from "lucide-react";
import Image from "next/image";
import api from "../utils/axios";
import useAuth from "../utils/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Card {
  id: number;
  title: string;
  location: string;
  description: string;
  image?: string;
  link: string;
  rating?: number;
}

interface AiCard {
  name: string;
  location?: string;
  description: string;
  imageUrl?: string;
  googleMapsUrl: string;
  rating?: number;
}

export default function GenerateAIPage() {
  const { user, setUser, loading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");

  if (loading) return null;

  const handleGenerate = async () => {
    if (!prompt) return alert("Isi prompt dulu!");

    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (location) formData.append("location", location);
      if (imageFile) formData.append("image", imageFile);

      const res = await api.post("/ai/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Response data dari backend:", res.data);
      console.log("✅ Response AI:", res.data);

      const aiData: AiCard[] = res.data.data || [];
      if (res.data.status === "warning") {
        setModalMessage(res.data.message);
        setCards([]);
        return;
      }

      const mapped: Card[] = aiData.map((item, idx) => ({
        id: idx + 1,
        title: item.name,
        location: item.location || location || "",
        description: item.description,
        image: item.imageUrl,
        link: item.googleMapsUrl,
        rating: item.rating,
      }));

      setCards(mapped);
      setActive(0);
    } catch (err) {
      console.error(err);
      alert("Gagal generate rekomendasi AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarClick = () => {
    setPreview(user?.avatarImage || "/default-avatar.png");
    setName(user?.name || "");
    setIsEditing(true);
  };

  const handleAiImageChange = (file: File) => {
    setImageFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAiImageChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAiImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setImageFile(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSave = async () => {
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (avatarFile) {
        formData.append("avatarImage", avatarFile);
      }

      const res = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal update profile:", err);
    } finally {
      setEditLoading(false);
    }
  };

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
    <div className="relative min-h-screen flex justify-center bg-slate-900 text-white overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-50"
        style={{
          backgroundImage: "url('/home.avif')",
        }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/90" />

      {/* History */}
      <div className="absolute text-white top-6 left-6 flex items-center space-x-2 z-20">
        <Link href="/history">
          <History className="w-11 h-11 rounded-full text-white bg-orange-500 object-cover cursor-pointer" />
        </Link>
      </div>

      {/* Profile*/}
      <div className="absolute top-6 right-6 flex items-center space-x-2 z-20" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div
          className={`flex gap-2 items-center bg-slate-800/80 border-2 border-orange-400 backdrop-blur-md rounded-full overflow-hidden transition-all duration-300 ${
            hovered ? "opacity-100 px-2 py-[2.9px]" : "w-0 opacity-0 px-0"
          }`}
        >
          <button onClick={handleLogout} className="flex items-center bg-orange-500 hover:bg-orange-600 border border-white rounded-full p-2 transition cursor-pointer">
            <LogOut size={18} className="text-white" />
          </button>
          <span className="text-md truncate px-4">{user?.name || "User"}</span>
        </div>

        {/* Avatar */}
        <Image
          src={user?.avatarImage ? `${user.avatarImage}?t=${Date.now()}` : "/default-avatar.png"}
          alt="Avatar"
          onClick={handleAvatarClick}
          width={44}
          height={44}
          className="rounded-full border-2 border-orange-400 object-cover cursor-pointer"
        />
      </div>

      <main className="relative z-10 text-center px-6 py-6 w-full mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-400 mb-2">TasteAI</h1>
        <p className="text-slate-300 mb-4 text-center">Temukan rekomendasi kuliner unik di seluruh dunia.</p>

        {/* Input Form */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-10 mx-auto w-full max-w-2xl text-white shadow-lg">
          {/* Textarea Prompt */}
          <textarea
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-orange-500 outline-none mb-4"
            placeholder="Cari rekomendasi kuliner yang anda inginkan..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          {/* Drag & Drop Area */}
          <div
            ref={dropRef}
            className={`relative flex flex-col items-center justify-center w-full h-60 py-3 text-center rounded-lg border-2 border-dashed border-slate-500 mb-4 ${
              imageFile ? "border-none" : "hover:border-orange-500"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {!imageFile && (
              <>
                <input type="file" id="generate" className="hidden" onChange={handleFileInputChange} />
                <label htmlFor="generate" className="flex flex-col items-center justify-center cursor-pointer">
                  <FolderUp size={40} className="text-slate-400 mb-1" />
                  <span className="text-orange-500 text-lg font-semibold mb-2">Upload atau Drag & Drop Gambar Kuliner <br/> opsional</span>
                </label>
              </>
            )}

            {/* Preview Image */}
            {imageFile && (
              <div className="absolute inset-0">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button onClick={handleRemoveFile} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-red-600 cursor-pointer">
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Input Location */}
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-orange-500 outline-none mb-4"
            placeholder="Prioritas lokasi (contoh: Bandung)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {/* Button */}
          <button className="bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-lg w-full cursor-pointer" onClick={handleGenerate} disabled={aiLoading}>
            {aiLoading ? "Mencari..." : "Cari Rekomendasi"}
          </button>
        </div>

        {/* Recommendation Card */}
        {cards.length > 0 && (
          <section className="relative w-full flex flex-col items-center justify-center overflow-hidden">
            <h2 className="text-2xl font-bold text-orange-500 mb-0">Rekomendasi untukmu</h2>
            <div className="relative w-[90%] md:w-[50%] h-[500px] flex items-center justify-center perspective-[1000px]">
              {cards.map((card, i) => (
                <div
                  key={card.id}
                  className={`absolute transition-all duration-700 ease-in-out bg-slate-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-slate-700 text-white ${getTransform(
                    i
                  )}`}
                  style={{ transformStyle: "preserve-3d", width: "350px" }}
                >
                  {card.image && <Image src={card.image} alt={card.title} width={400} height={200} className="w-full h-44 object-cover" />}
                  <div className="p-4 pb-6 text-start">
                    <h3 className="font-bold text-lg mb-1 text-orange-400">{card.title}</h3>
                    <p className="flex gap-1 items-center justify-center text-sm text-slate-300 mb-2 leading-snug">{card.location}</p>
                    {card.rating && <p className="text-sm text-yellow-400 font-semibold mb-3">⭐ {card.rating.toFixed(1)} / 5</p>}
                    <p className="text-sm text-slate-300 mb-5 leading-snug">{card.description}</p>
                    <div className="items-center mx-auto text-center">
                      <a href={card.link} target="_blank" rel="noopener noreferrer" className="bg-orange-500 text-white px-10 py-2 rounded-lg text-sm hover:bg-orange-600 transition">
                        Lihat di Google Maps
                      </a>
                    </div>
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

            <div className="flex gap-2">
              {cards.map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === active ? "bg-orange-500 scale-110" : "bg-slate-500 scale-90"}`} />
              ))}
            </div>
          </section>
        )}
      </main>

      {modalMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-[90%] sm:w-[400px] text-white shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-1">
              Info <Info size={15} className="mt-[7px]" />
            </h2>
            <p className="mb-6">{modalMessage}</p>
            <div className="flex justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg cursor-pointer" onClick={() => setModalMessage(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Profile */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-[90%] sm:w-[400px] text-white shadow-lg relative">
            <h2 className="text-2xl font-semibold mb-8">Edit Profil</h2>

            {/* Avatar preview */}
            <div className="relative w-28 h-28 mx-auto mb-4">
              <Image src={preview || "/default-avatar.png"} alt="Preview" fill className="rounded-full object-cover border-2 border-orange-400" />
              <label htmlFor="avatarUpload" className="absolute bottom-1 right-1 bg-orange-500 hover:bg-orange-600 rounded-full p-2 cursor-pointer">
                <Pencil size={16} />
              </label>
              <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Name input */}
            <div className="mb-4">
              <label className="block mb-1 text-sm text-slate-300">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-orange-500 outline-none"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition cursor-pointer">
                Batal
              </button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition cursor-pointer" disabled={editLoading}>
                {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { FileText, ImageUp, MapPin, Sparkles, LogOut, Pencil } from "lucide-react";
import useAuth from "../utils/useAuth";
import { useState } from "react";
import api from "../utils/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { user, setUser, loading } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const router = useRouter();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");

  if (loading) return null;

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 text-white overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-50"
        style={{
          backgroundImage: "url('/home.avif')",
        }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/90" />

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
          width={44}
          height={44}
          onClick={handleAvatarClick}
          className="rounded-full border-2 border-orange-400 object-cover cursor-pointer"
        />
      </div>

      {/* Content */}
      <main className="relative z-10 text-center px-6 md:px-12 py-6 md:py-0 max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-400 mb-4">Selamat Datang di TasteAI</h1>
        <p className="text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Temukan tempat kuliner unik di seluruh dunia dari kecerdasan buatan. Biarkan AI kami memahami seleramu dan menciptakan pengalaman rasa terbaik!
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <FeatureCard icon={<FileText size={28} />} title="Tulis Deskripsi" desc="Ceritakan makanan yang kamu inginkan." />
          <FeatureCard icon={<ImageUp size={28} />} title="Unggah Gambar" desc="Berikan referensi visual untuk inspirasi rasa." />
          <FeatureCard icon={<MapPin size={28} />} title="Prioritas Lokasi" desc="Tentukan lokasi yang anda inginkan." />
          <FeatureCard icon={<Sparkles size={28} />} title="Dapatkan Hasil" desc="Biarkan AI kami menemukan tempat kuliner terbaik." />
        </div>

        {/* CTA Button */}
        <div className="flex gap-5 justify-center">
          <Link href="/generate" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold shadow-lg transition cursor-pointer">
            Mulai Sekarang
          </Link>
        </div>
      </main>

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
              <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
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

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 hover:border-orange-400 transition">
      <div className="flex flex-col items-center text-center">
        <div className="text-orange-400 mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}

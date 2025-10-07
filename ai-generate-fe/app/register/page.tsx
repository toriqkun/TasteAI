"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";
import api from "../utils/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError((prev) => ({ ...prev, [name]: "" }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (value && value.length < 4) newErrors.name = "Nama minimal 4 karakter";
        else if (value.length > 20) newErrors.name = "Nama maksimal 20 karakter";
        else delete newErrors.name;
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = "Format email tidak valid";
        else delete newErrors.email;
        break;

      case "password":
        if (value && value.length < 8) newErrors.password = "Password minimal 8 karakter";
        else delete newErrors.password;
        break;

      case "confirmPassword":
        if (value && value !== form.password) newErrors.confirmPassword = "Konfirmasi password tidak cocok";
        else delete newErrors.confirmPassword;
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", form);
      toast.success(res.data.message || "Registrasi berhasil!");
      router.push("/login")
      setErrors({});
      setSubmitError({});
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg?.toLowerCase().includes("email")) {
        setSubmitError({ email: msg });
      } else {
        toast.error(msg || "Gagal mendaftar");
      }
    }
  };

  const getBorderClass = (field: string) => {
    if (errors[field]) return "border-red-500 focus-within:border-red-500";
    if (form[field as keyof typeof form]) return "border-orange-400";
    return "border-slate-700";
  };

  const getIconColor = (field: string) => {
    if (errors[field]) return "text-red-500";
    if (form[field as keyof typeof form]) return "text-orange-400";
    return "text-slate-400";
  };

  const showError = (field: string) => touched[field] && (errors[field] || submitError[field]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6 py-12">
      <div className="w-full max-w-md bg-slate-800/70 p-8 rounded-2xl shadow-lg border border-slate-700">
        <h1 className="text-3xl font-bold text-center text-orange-400 mb-8">Daftar di TasteAI</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div className="relative">
            <label className="block text-sm text-slate-300 mb-2">Nama Lengkap</label>
            <div className={`flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border ${getBorderClass("name")}`}>
              <User className={getIconColor("name")} size={18} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Masukan nama lengkap"
                className="w-full bg-transparent outline-none text-white placeholder-slate-500"
              />
            </div>
            {showError("name") && <p className="absolute bottom-[-15px] left-1 text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <div className={`flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border ${getBorderClass("email")}`}>
              <Mail className={getIconColor("email")} size={18} />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Masukan email" className="w-full bg-transparent outline-none text-white placeholder-slate-500" />
            </div>
            {showError("email") && <p className="absolute bottom-[-15px] left-1 text-red-500 text-xs mt-1">{errors.email || submitError.email}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm text-slate-300 mb-2">Kata Sandi</label>
            <div className={`flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border ${getBorderClass("password")}`}>
              <Lock className={getIconColor("password")} size={18} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukan kata sandi"
                className="w-full bg-transparent outline-none text-white placeholder-slate-500"
              />
            </div>
            {showError("password") && <p className="absolute bottom-[-15px] left-1 text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Konfirmasi Password */}
          <div className="relative">
            <label className="block text-sm text-slate-300 mb-2">Ulangi Kata Sandi</label>
            <div className={`flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border ${getBorderClass("confirmPassword")}`}>
              <Lock className={getIconColor("confirmPassword")} size={18} />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi kata sandi"
                className="w-full bg-transparent outline-none text-white placeholder-slate-500"
              />
            </div>
            {showError("confirmPassword") && <p className="absolute bottom-[-15px] left-1 text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="w-full py-2 mt-2 rounded-full bg-orange-500 hover:bg-orange-600 transition font-semibold text-white cursor-pointer">
            Daftar
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-orange-400 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../utils/axios";
import toast from "react-hot-toast";
import { Mail, Lock, CircleX, CircleCheckBig } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verified = params.get("verified");
    if (verified === "true") {
      setShowModal(true);
    }
  }, [params]);

  const handleModalVerify = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      toast.success(res.data.message);
      router.push("/home");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === "Email belum diverifikasi, silakan periksa kotak masuk Anda.") {
        setErrorModal(true);
      } else if (msg === "Email atau password salah") {
        setErrorMsg(msg);
      } else {
        toast.error(msg || "Login gagal");
      }
    }
  };

  const handleModalOk = () => {
    setErrorModal(false);
  };

  const getIconColor = (field: string, focused: boolean) => {
    if (focused || field) return "text-orange-400";
    return "text-slate-400";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6 py-12">
      <div className="w-full max-w-md bg-slate-800/70 p-8 rounded-2xl shadow-lg border border-slate-700">
        <h1 className="text-3xl font-bold text-center text-orange-400 mb-8">Masuk ke TasteAI</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${emailFocus || email ? "border-orange-400" : "border-slate-700"} bg-slate-900`}>
              <Mail size={18} className={getIconColor(email, emailFocus)} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="Masukan email"
                className="w-full bg-transparent outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm text-slate-300 mb-2">Kata Sandi</label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${passwordFocus || password ? "border-orange-400" : "border-slate-700"} bg-slate-900`}>
              <Lock size={18} className={getIconColor(password, passwordFocus)} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                placeholder="Masukan kata sandi"
                className="w-full bg-transparent outline-none text-white placeholder-slate-500"
              />
            </div>
            {/* Error */}
            {errorMsg && <p className="text-red-500 text-sm mt-1 absolute left-2 bottom-[-22px]">{errorMsg}</p>}
          </div>

          <button type="submit" className="w-full py-2 mt-2 rounded-full bg-orange-500 hover:bg-orange-600 transition font-semibold text-white cursor-pointer">
            Masuk
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-orange-400 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* Modal Error */}
      {errorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-120 text-center border border-slate-700">
            <CircleX className="text-red-600 text-center mx-auto mb-2 w-25 h-25" />
            <h2 className="text-2xl font-bold text-white mb-3">Oops!</h2>
            <p className="text-gray-100 text-lg mb-4">Email belum diverifikasi, silakan periksa kotak masuk Anda.</p>
            <button onClick={handleModalOk} className="mt-2 py-2 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer">
              OKE
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-100 text-center border border-slate-700">
            <CircleCheckBig className="text-green-600 text-center mx-auto mb-2 w-25 h-25" />
            <h2 className="text-2xl font-bold text-gray-100 mb-3">Success!</h2>
            <p className="text-white text-lg mb-4">Email berhasil diverifikasi, silakan login.</p>
            <button onClick={handleModalVerify} className="mt-2 py-2 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

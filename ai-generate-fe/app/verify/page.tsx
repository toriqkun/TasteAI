"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/utils/axios";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      router.push("/login?verified=false&error=TokenTidakDitemukan");
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify?token=${token}`);
        router.push("/login?verified=true");
      } catch (err: any) {
        router.push(`/login?verified=false&error=${encodeURIComponent(err.response?.data?.message || "Verifikasi gagal")}`);
      }
    };

    verify();
  }, [params, router]);

  return null
}

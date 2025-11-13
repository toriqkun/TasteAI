"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, MapPin, History, Star } from "lucide-react";
import api from "../utils/axios";
import Link from "next/link";

interface AiHistory {
  id: string;
  prompt: string;
  location: string | null;
  imageUrl?: string | null;
  result: {
    name: string;
    location: string;
    description: string;
    googleMapsUrl: string;
    imageUrl?: string;
    rating?: number;
  }[];
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<AiHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/ai/history");
        setHistory(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading history...</p>;

  return (
    <div className="w-full bg-slate-900 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        {history.length === 0 ? (
          <div className="flex flex-col items-center mt-20 text-gray-400">
            <Clock size={48} className="mb-2" />
            <p>Belum ada riwayat generate.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-white">AI Generation History</h1>

            <div className="space-y-8">
              {history.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl shadow-md bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.prompt}</h2>
                      <p className="flex text-gray-500 dark:text-gray-400 items-center gap-1 text-sm">
                        <MapPin size={15} /> {item.location || "Tanpa lokasi"}
                      </p>
                    </div>
                    <span className="flex gap-1 items-center text-xs text-gray-400">
                      <History size={20} /> {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {item.imageUrl && (
                    <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden">
                      <Image src={item.imageUrl} alt="Uploaded" fill className="object-cover" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {item.result?.map((r, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{r.name}</h3>
                          {r.rating && (
                            <div className="flex items-center text-yellow-400 text-sm">
                              <Star size={14} className="fill-yellow-400 mr-1" />
                              {r.rating.toFixed(1)} / 5
                            </div>
                          )}
                        </div>

                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <MapPin className="w-3 h-3 mr-1" />
                          {r.location}
                        </div>

                        {r.imageUrl && (
                          <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden">
                            <Image src={r.imageUrl} alt={r.name} fill className="object-cover" />
                          </div>
                        )}

                        <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow mb-5">{r.description}</p>

                        <Link href={r.googleMapsUrl} target="_blank" className="text-sm bg-orange-500 py-2 px-4 text-center text-white rounded-xl hover:bg-orange-600">
                          Lihat di Maps
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

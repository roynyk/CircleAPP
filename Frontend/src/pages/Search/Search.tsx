import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import RightBar from "@/components/common/RightBar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import api from "@/lib/axios";
import { getAvatarUrl } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { ProfileHoverCard } from "@/components/common/ProfileHoverCard";
import { SearchedUser } from "@/types/user";

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Memicu pencarian ketika debouncedQuery berubah
  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedQuery.trim() === "") {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get("/users/search", {
          params: { q: debouncedQuery },
        });
        setResults(response.data.data);
      } catch (error) {
        console.error("Gagal memuat hasil pencarian:", error);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex items-start space-x-6 min-w-0">
        {/* Kolom Kiri: Tampilan Pencarian */}
        <div className="flex-1 max-w-4xl w-full min-w-0 bg-white rounded-xl shadow-md p-6 text-left min-h-[600px] flex flex-col">
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center mb-6">
            <SearchIcon size={22} className="text-blue-500 mr-2" />
            Search Users
          </h1>

          {/* Kotak Input Pencarian */}
          <div className="relative mb-6">
            <SearchIcon
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Enter full name or username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-blue-500 focus-visible:bg-white transition duration-200 text-sm"
            />
          </div>

          {/* Render Hasil */}
          <div className="flex-1 flex flex-col">
            {loading ? (
              // Tampilan Loading Skeleton
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 border border-slate-50 rounded-xl animate-pulse"
                  >
                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
                      <div className="h-2.5 w-24 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              // Tampilan default kosong
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
                <Sparkles
                  size={40}
                  className="text-slate-300 mb-3 animate-pulse"
                />
                <p className="text-xs font-medium">
                  {query.trim() === ""
                    ? "Type name or username to find new friends."
                    : "No matching users found."}
                </p>
              </div>
            ) : (
              // Tampilan hasil pencarian (Tanpa tombol follow di list)
              <div className="space-y-3">
                {results.map((user) => (
                  <ProfileHoverCard key={user.id} userId={user.id}>
                    <div className="flex items-center space-x-3 p-3 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/10 rounded-xl transition duration-200 group">
                      <Avatar className="h-10 w-10 border border-slate-100 group-hover:border-blue-400/30 transition duration-300">
                        <AvatarImage
                          src={getAvatarUrl(user.photoProfile)}
                          alt={user.fullName}
                        />
                        <AvatarFallback className="bg-blue-50 text-blue-600 text-sm font-bold uppercase">
                          {user.fullName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition duration-150">
                          {user.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-[10px] text-slate-500 truncate mt-1 max-w-[280px]">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </ProfileHoverCard>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: RightBar */}
        <RightBar />
      </div>
    </div>
  );
};

export default Search;

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setProfile } from "@/redux/authSlice";
import api from "@/lib/axios";

export const useProfile = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.get("/users/user");
      // Simpan data lengkap profil ke Redux
      dispatch(setProfile(response.data.data));
    } catch (error) {
      console.error("Gagal mengambil data profil detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Jalankan fetch jika token ada dan data detail (misal followingCount) belum pernah di-load
    if (token) {
      const timer = setTimeout(() => {
        fetchProfile();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token]);

  return { loading };
};

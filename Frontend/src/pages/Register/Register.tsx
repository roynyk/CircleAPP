import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "@/lib/axios";
import { loginSuccess } from "@/redux/authSlice";
import { Circle } from "lucide-react";
import {
  type RegisterForm,
  registerSchemaForm,
} from "@/validations/auth-validations";
import { INITIAL_REGISTER_FORM } from "@/constants/auth-constants";

const Register = () => {
  const [formData, setFormData] = useState<RegisterForm>(INITIAL_REGISTER_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = registerSchemaForm.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      // Auto-login setelah register berhasil
      dispatch(
        loginSuccess({
          token: response.data.token,
          user: response.data.data,
        }),
      );
      navigate("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      {/* SISI KIRI: Banner Gradien Premium (Hanya muncul di desktop/md ke atas) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden flex-col justify-between p-12 text-white text-left">
        {/* Dekorasi efek cahaya glowing di background */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

        {/* Logo Pojok Atas */}
        <div className="flex items-center space-x-2.5 z-10">
          <Circle className="h-6 w-6 fill-white/10 text-white" />
          <span className="text-base font-black tracking-wider">TALKHIVE</span>
        </div>

        {/* Tagline Tengah */}
        <div className="my-auto z-10 max-w-sm">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Start Your Story Now.
          </h1>
          <p className="mt-4 text-xs text-blue-100/80 leading-relaxed font-medium">
            Create your new account now for free, connect with millions of other
            users, and share your exciting moments today.
          </p>
        </div>

        {/* Hak Cipta di Bawah */}
        <div className="z-10 text-[10px] text-blue-200/50">
          © 2026 TalkHive. All Rights Reserved.
        </div>
      </div>

      {/* SISI KANAN: Kotak Form Register */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-left">
          {/* Header Brand di atas Box Form */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="flex items-center space-x-1.5 text-blue-600 mb-2">
              <Circle className="h-7 w-7 fill-blue-600/10" />
              <span className="text-base font-black tracking-wider text-slate-800">
                TALK<span className="text-blue-600">HIVE</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Create New Account
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Register for free to start sharing your best moments.
            </p>
          </div>

          {error && (
            <p className="mb-4 text-xs text-red-500 bg-red-50/80 border border-red-100 p-2.5 rounded-lg font-semibold text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="e.g. adit123"
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none transition duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="e.g. Adit Muhijriawan"
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none transition duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@email.com"
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none transition duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none transition duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition duration-200 cursor-pointer shadow-sm shadow-blue-200/50"
            >
              {loading ? "Processing..." : "Register New Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500 font-semibold">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

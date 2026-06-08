import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, Circle, Home, Compass, Search, User } from "lucide-react";

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Navigasi menu tengah
  const navLinks = [
    { name: "Feed", path: "/home", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Search", path: "/search", icon: Search },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      {/* max-w-5xl menyelaraskan lebar konten navbar dengan kolom di bawahnya */}
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* KIPi: Logo */}
        <Link
          to="/home"
          className="flex items-start space-x-2 text-blue-600 group"
        >
          <Circle className="h-6 w-6 fill-blue-600/10 group-hover:rotate-45 transition duration-500" />
          <span className="text-lg font-black tracking-wider text-slate-800">
            CIRCLE<span className="text-blue-600">APP</span>
          </span>
        </Link>

        {/* TENGAH: Menu Navigasi Horizontal */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon size={16} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* KANAN: Avatar & Logout */}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3 border-r border-gray-200 pr-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-none">
                  @{user.username}
                </p>
              </div>
              <Avatar className="h-8 w-8 border border-blue-500/20 shadow-sm">
                {user.photoProfile && (
                  <AvatarImage src={user.photoProfile} alt={user.fullName} />
                )}
                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold uppercase text-xs">
                  {user.fullName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer flex items-center space-x-2 h-9 px-3 transition duration-200"
          >
            <LogOut size={15} />
            <span className="text-xs font-bold hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

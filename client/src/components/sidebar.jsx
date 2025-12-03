import {
  Home, LayoutGrid, Heart, LogOut, Calendar,
  Users, Clock, Settings, Gamepad2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const isActiveGame =
    location.pathname === "/game" ||
    location.pathname === "/gameMemoryMatch";

  // ----------------------------------------------
  //  DEFINE ALL SIDEBAR ITEMS HERE
  // ----------------------------------------------
  const items = [
    { path: "/dashboard", icon: Home },
    { path: "/home", icon: LayoutGrid },
    { path: "/game", icon: Gamepad2, active: isActiveGame },
    { path: "/calendar", icon: Calendar },
    { path: "/users", icon: Users },
    { path: "/favorites", icon: Heart },
    { path: "/time", icon: Clock },
  ];

  const settingsItem = { path: "/settings", icon: Settings };
  const logoutItem = { path: "/login", icon: LogOut };

  // ----------------------------------------------

  return (
    <div className="fixed left-0 top-20 h-full flex flex-col items-center justify-center py-6 gap-2 w-16 bg-transparent z-50">

      {/* MAIN MENU ITEMS */}
      {items.map((item, idx) => {
        const Icon = item.icon;
        const active = item.active ?? isActive(item.path);

        return (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              active ? "bg-[#e74c3c]" : "bg-white hover:bg-gray-100"
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`} />
          </button>
        );
      })}

      <div className="flex-1" />

      {/* SETTINGS BUTTON */}
      <button
        onClick={() => navigate(settingsItem.path)}
        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <settingsItem.icon className="w-5 h-5 text-gray-500" />
      </button>

      {/* LOGOUT BUTTON */}
      <button
        onClick={() => navigate(logoutItem.path)}
        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-red-50 transition-colors"
      >
        <logoutItem.icon className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}

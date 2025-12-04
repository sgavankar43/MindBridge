import {
  Home, LayoutGrid, Heart, LogOut, Calendar,
  Users, Clock, Settings, Gamepad2, MessageCircle, User, X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const isActive = (path) => location.pathname === path;

  const isActiveGame =
    location.pathname === "/game" ||
    location.pathname === "/gameMemoryMatch";

  const handleNavigate = (path) => {
    navigate(path);
    closeSidebar();
  };

  // ----------------------------------------------
  //  DEFINE ALL SIDEBAR ITEMS HERE
  // ----------------------------------------------
  const items = [
    { path: "/dashboard", icon: Home },
    { path: "/home", icon: LayoutGrid },
    { path: "/messages", icon: MessageCircle },
    { path: "/profile", icon: User },
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
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen flex flex-col items-center py-6 gap-2 w-16 bg-transparent z-50 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Spacer for header */}
        <div className="h-20" />

        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors mb-2"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* MAIN MENU ITEMS */}
        <div className="flex flex-col gap-2">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const active = item.active ?? isActive(item.path);

            return (
              <button
                key={idx}
                onClick={() => handleNavigate(item.path)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  active ? "bg-[#e74c3c]" : "bg-white hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`} />
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* SETTINGS BUTTON */}
        <button
          onClick={() => handleNavigate(settingsItem.path)}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <settingsItem.icon className="w-5 h-5 text-gray-500" />
        </button>

        {/* LOGOUT BUTTON */}
        <button
          onClick={() => handleNavigate(logoutItem.path)}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-red-50 transition-colors mb-2"
        >
          <logoutItem.icon className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </>
  );
}

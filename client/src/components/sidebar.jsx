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
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/home", icon: LayoutGrid, label: "Home" },
    { path: "/ai-chat", icon: MessageCircle, label: "AI Chat" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/game", icon: Gamepad2, label: "Games", active: isActiveGame },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/community", icon: Users, label: "Community" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/time", icon: Clock, label: "Time" },
  ];

  const settingsItem = { path: "/settings", icon: Settings, label: "Settings" };
  const logoutItem = { path: "/login", icon: LogOut, label: "Logout" };

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
      <div className={`fixed left-0 top-0 h-screen flex flex-col items-center py-6 gap-2 w-16 bg-transparent z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
              <div key={idx} className="relative group">
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${active ? "bg-[#e74c3c] scale-110" : "bg-white hover:bg-gray-100 hover:scale-110"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`} />
                </button>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* SETTINGS BUTTON */}
        <div className="relative group">
          <button
            onClick={() => handleNavigate(settingsItem.path)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 hover:scale-110 transition-all duration-200"
          >
            <settingsItem.icon className="w-5 h-5 text-gray-500" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
            {settingsItem.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="relative group mb-2">
          <button
            onClick={() => handleNavigate(logoutItem.path)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all duration-200"
          >
            <logoutItem.icon className="w-5 h-5 text-gray-500" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
            {logoutItem.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        </div>
      </div>
    </>
  );
}

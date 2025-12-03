import React from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import Coloring from "@/components/Coloring";

export default function GameColoring() {
  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />
      <div className="flex-1 ml-16 p-8 pt-24">
        <Header />
        <div className="h-full flex items-center justify-center p-6">
          <Coloring />
        </div>
      </div>
    </div>
  );
}

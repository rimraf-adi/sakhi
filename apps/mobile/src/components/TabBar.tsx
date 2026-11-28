"use client";

import { BookOpen, Mic, Users } from "lucide-react";
import type { MobileTab } from "@/lib/types";

interface TabBarProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
  dark: boolean;
}

const TABS = [
  { id: "feed" as const, label: "Circle", Icon: Users },
  { id: "journal" as const, label: "Journal", Icon: BookOpen },
];

export function TabBar({ activeTab, onChange, dark }: TabBarProps) {
  return (
    <div
      className={`relative z-10 grid shrink-0 grid-cols-3 items-center border-t px-4 py-2 ${
        dark
          ? "border-white/10 bg-[#081210] text-[#8EA39C]"
          : "border-[#EAE3D5] bg-[#FAF6EE] text-[#475467]"
      }`}
    >
      <button
        type="button"
        onClick={() => onChange("feed")}
        className={`flex cursor-pointer flex-col items-center justify-center py-1 text-[11px] font-semibold ${
          activeTab === "feed" ? "text-[#101828]" : ""
        }`}
      >
        <Users size={17} />
        <span className="mt-0.5">Circle</span>
      </button>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onChange("voice")}
          title="Talk to Sakhi"
          className={`grid h-11 w-11 cursor-pointer place-items-center rounded-full transition ${
            activeTab === "voice" ? "bg-[#D96B4F] text-[#FAF6EE]" : "bg-[#0B1715] text-[#EAB685]"
          }`}
        >
          <Mic size={18} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onChange("journal")}
        className={`flex cursor-pointer flex-col items-center justify-center py-1 text-[11px] font-semibold ${
          activeTab === "journal" ? "text-[#101828]" : ""
        }`}
      >
        <BookOpen size={17} />
        <span className="mt-0.5">Journal</span>
      </button>
    </div>
  );
}

export { TABS };

"use client";

import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";
import { ReactNode, useState } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const [openSidebar, setOpenSidebar] = useState(true);
  return (
    <main className="flex justify-between">
      <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
      <div
        className="flex-1 px-8 min-h-screen"
        onClick={() => (openSidebar ? setOpenSidebar(false) : {})}
      >
        <div className="py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Menu
              className="cursor-pointer block md:hidden text-primary-hover size-5"
              onClick={() => setOpenSidebar(true)}
            />
            <h2 className="text-2xl font-semibold">Dashboard</h2>
          </div>
          <button className="py-2 px-11 rounded-full bg-white border border-[#E5E7EB] text-sm">
            Sunset Bar
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
};

export default Layout;

"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

interface ItemType {
  title: string;
  link: string;
}

const items: ItemType[] = [
  {
    title: "Dashboard",
    link: "/",
  },
  {
    title: "Inventory",
    link: "/inventory",
  },
  {
    title: "Revisions",
    link: "/revisions",
  },
  {
    title: "Reports",
    link: "/reports",
  },
  {
    title: "Settings",
    link: "/settings",
  },
];

interface IProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: IProps) => {
  const pathname = usePathname();

  // 1. Find the active item (might be undefined if no match)
  const activeItem = items.find((item: ItemType) => item.link === pathname);

  // 2. Get all other items
  const otherItems = items.filter((item) => item.link !== pathname);
  return (
    <div
      className={`fixed ${
        open ? "left-0" : "-left-full"
      } md:left-0 top-0 w-[90%] z-50 md:relative md:w-65 bg-white shadow-2xl transition-all duration-300 md:shadow-none min-h-screen px-4 py-6`}
    >
      <div className="flex items-center justify-between gap-4">
        <Logo />
        <X
          onClick={() => setOpen(false)}
          className="cursor-pointer text-primary-hover block md:hidden"
        />
      </div>
      <ul className="mt-5">
        <li>
          <Link
            href={activeItem?.link || "/"}
            className="text-center py-2.5 w-full block rounded-full bg-[#E5EDFF] text-primary"
          >
            {activeItem?.title}
          </Link>
        </li>

        {otherItems.map((item) => (
          <li key={item.link}>
            <Link
              href={item.link}
              className="text-left transition-all text-primary-hover py-2.5 w-full block rounded-full text-secondary"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

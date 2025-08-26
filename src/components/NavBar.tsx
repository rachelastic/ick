"use client";

import Link from "next/link";
import Image from "next/image";

const NavBar = () => {
  return (
    <nav className="flex justify-between items-center px-2 py-2 shadow-md top-0 w-full bg-gradient-to-r bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md">
      <Link href="/">
      <Image src="/cream.png" width={48} height={48} alt="pfp"></Image>
      </Link>
     

      <ul className="flex gap-6 text-rose-500 font-bold text-sm font-medium text-[var(--muted-foreground)]">
        <li>
          <Link href="/ick" className="hover:text-[var(--accent)]">
            Ick it!
          </Link>
        </li>
        <li>
          <Link href="/insights" className="hover:text-[var(--accent)]">
            Insights
          </Link>
        </li>
      </ul>

      <div className="flex gap-4">
        <Link href="">
          <button className="text-sm px-4 py-1.5 rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]">
            Extension
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { ChartBarIcon, CheckCircleIcon, Cog6ToothIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useState, useEffect } from 'react';

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div suppressHydrationWarning className={`w-64 ${resolvedTheme === 'dark' ? 'bg-gradient-to-b from-slate-900 to-slate-800 text-white' : 'bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900'} h-screen fixed left-0 top-0 shadow-2xl z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div suppressHydrationWarning className={`p-6 border-b ${resolvedTheme === 'dark' ? 'border-slate-700' : 'border-slate-300'} flex items-center justify-between`}>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Todo List
        </h2>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Bars3Icon className="h-6 w-6" />
        </Button>
      </div>
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          <li>
            <Button
              variant="ghost"
              asChild
              suppressHydrationWarning
              className={`w-full justify-start px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                pathname === '/' ? `${resolvedTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} shadow-lg border-l-4 border-blue-400` : ''
              }`}
            >
              <Link href="/">
                <ChartBarIcon className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              asChild
              suppressHydrationWarning
              className={`w-full justify-start px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                pathname === '/task' ? `${resolvedTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} shadow-lg border-l-4 border-blue-400` : ''
              }`}
            >
              <Link href="/task">
                <CheckCircleIcon className="mr-3 h-5 w-5" />
                Task
              </Link>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              asChild
              suppressHydrationWarning
              className={`w-full justify-start px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                pathname === '/settings' ? `${resolvedTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} shadow-lg border-l-4 border-blue-400` : ''
              }`}
            >
              <Link href="/settings">
                <Cog6ToothIcon className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
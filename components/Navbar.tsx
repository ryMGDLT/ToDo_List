'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BellIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [hasNotification, setHasNotification] = useState(true); // For demo

  return (
    <nav className="fixed top-0 left-64 right-0 z-10 backdrop-blur-md bg-white/10 dark:bg-slate-900/10 border-b border-white/20 dark:border-slate-700/20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setHasNotification(false)}>
            <BellIcon className="h-5 w-5" />
            {hasNotification && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </Button>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            U
          </div>
        </div>
      </div>
    </nav>
  );
}
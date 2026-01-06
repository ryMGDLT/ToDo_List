'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bars3Icon } from "@heroicons/react/24/outline";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [hasNotification, setHasNotification] = useState(true);

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-white/10 dark:bg-slate-900/10 border-b border-white/20 dark:border-slate-700/20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Bars3Icon className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationDropdown />
        </div>
      </div>
    </nav>
  );
}

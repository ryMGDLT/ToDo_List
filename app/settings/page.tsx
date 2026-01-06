'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { SwatchIcon } from "@heroicons/react/24/outline";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex-1">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Customize your experience.</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                <SwatchIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200">Theme</h2>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
  );
}
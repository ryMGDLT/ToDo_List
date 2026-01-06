'use client';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "next-themes";
import { SwatchIcon, BellIcon, UserIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <Sidebar />
      <Navbar />
      <main className="flex-1 ml-64 p-8 pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Customize your experience.</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                <SwatchIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Theme</h2>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                <BellIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Notifications</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox />
              <label className="text-slate-700 dark:text-slate-300">Enable notifications</label>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Account</h2>
            </div>
            <Button variant="destructive">
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
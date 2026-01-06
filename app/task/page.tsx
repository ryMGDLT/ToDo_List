'use client';

import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, PencilIcon, CheckIcon, TrashIcon, DocumentTextIcon, ListBulletIcon, Squares2X2Icon, FolderIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

export default function Task() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); 
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const tasks = [
    { id: 1, title: 'Complete project proposal', priority: 'high', category: 'Work', startDate: '2024-01-08', endDate: '2024-01-15', status: 'pending', description: 'Write and finalize the Q1 project proposal for the new client.' },
    { id: 2, title: 'Buy groceries', priority: 'medium', category: 'Personal', startDate: '2024-01-09', endDate: '2024-01-10', status: 'completed', description: 'Weekly grocery shopping list.' },
    { id: 3, title: 'Schedule team meeting', priority: 'low', category: 'Work', startDate: '2024-01-10', endDate: '2024-01-12', status: 'in-progress', description: 'Organize weekly team sync meeting.' },
    { id: 4, title: 'Review code changes', priority: 'high', category: 'Work', startDate: '2024-01-11', endDate: '2024-01-14', status: 'pending', description: 'Review pull requests for the authentication module.' },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'all' || task.status === activeTab;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const TaskSkeleton = ({ viewMode }: { viewMode: string }) => {
    if (viewMode === 'list') {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex space-x-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-3" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex flex-col space-y-1 ml-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-full mb-3" />
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <Skeleton className="h-3 w-3 mr-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-3 w-3 mr-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <Sidebar />
      <Navbar />
      <main className="flex-1 ml-64 p-8 pt-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Tasks
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your tasks efficiently with advanced filtering and organization.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </div>


        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex space-x-2">
              {['all', 'pending', 'in-progress', 'completed'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' ? 'All' : tab === 'in-progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

    
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Your Tasks ({filteredTasks.length})
            </h2>
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <ListBulletIcon className="mr-2 h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Squares2X2Icon className="mr-2 h-4 w-4" />
                Grid
              </Button>
            </div>
          </div>
          {isLoading ? (
            viewMode === 'list' ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <TaskSkeleton key={index} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <TaskSkeleton key={index} viewMode={viewMode} />
                ))}
              </div>
            )
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">No tasks found matching your criteria.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <div className="flex space-x-2">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{task.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <FolderIcon className="h-4 w-4" />
                        <span>{task.category}</span>
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>{task.startDate} - {task.endDate}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-semibold line-clamp-2">{task.title}</h3>
                      <div className="flex flex-col space-y-1 ml-2">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{task.description}</p>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <FolderIcon className="h-3 w-3 mr-1" />
                        <span>{task.category}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-3 w-3 mr-1" />
                        <span>{task.startDate} - {task.endDate}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <PencilIcon className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <CheckIcon className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

    
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Task Title</label>
                <Input placeholder="Enter task title..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      if (value === 'add_new') {
                        setIsAddCategoryModalOpen(true);
                      } else {
                        setSelectedCategory(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="add_new">➕ Add new category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <Textarea placeholder="Enter task description..." rows={4} />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

  
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category Name</label>
            <Input
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setNewCategory('');
                setIsAddCategoryModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                
                console.log('Adding category:', newCategory);
                setNewCategory('');
                setIsAddCategoryModalOpen(false);
              }}
            >
              Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
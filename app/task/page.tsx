'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, PencilIcon, CheckIcon, TrashIcon, DocumentTextIcon, ListBulletIcon, Squares2X2Icon, FolderIcon, CalendarDaysIcon, PlayIcon, PauseIcon } from "@heroicons/react/24/outline";
import { useNotifications } from '@/contexts/NotificationContext';

interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  ongoing: boolean;
  priority?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  completedAt?: string;
  createdAt: string;
}

interface TaskForm {
  title: string;
  description: string;
  priority: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface ValidationErrors {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  priority: string;
  category: string;
}

export default function Task() {
  const { checkNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('list');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [categories, setCategories] = useState<string[]>(['Work', 'Personal', 'Health']);
  const [showDeleteCategoryConfirmation, setShowDeleteCategoryConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    priority: '',
    category: '',
  });
  const [editErrors, setEditErrors] = useState<ValidationErrors>({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    priority: '',
    category: '',
  });
  const [originalEditTask, setOriginalEditTask] = useState<TaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Personal',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });
  const [newTask, setNewTask] = useState<TaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Personal',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });
  const [editTask, setEditTask] = useState<TaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Personal',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchTodos();
    const savedCategories = localStorage.getItem('taskCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Intersection Observer for infinite scrolling
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTodos(nextPage, true);
    }
  }, [isLoadingMore, hasMore, isLoading, page]);

  useEffect(() => {
    if (loadMoreRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );
      
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoadingMore]);

  useEffect(() => {
    if (todos.length > 0) {
      checkNotifications(todos);
    }
  }, [todos, checkNotifications]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (todos.length > 0) {
        await checkNotifications(todos);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [todos, checkNotifications]);

  useEffect(() => {
    localStorage.setItem('taskCategories', JSON.stringify(categories));
  }, [categories]);

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setNewTask({ ...newTask, category: newCategory });
      setEditTask({ ...editTask, category: newCategory });
    }
    setNewCategory('');
    setIsAddCategoryModalOpen(false);
  };

  const handleDeleteCategoryClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setShowDeleteCategoryConfirmation(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      const updatedCategories = categories.filter(c => c !== categoryToDelete);
      setCategories(updatedCategories);
      if (newTask.category === categoryToDelete) {
        setNewTask({ ...newTask, category: updatedCategories[0] || 'Personal' });
      }
      if (editTask.category === categoryToDelete) {
        setEditTask({ ...editTask, category: updatedCategories[0] || 'Personal' });
      }
    }
    setShowDeleteCategoryConfirmation(false);
    setCategoryToDelete(null);
  };

  const fetchTodos = async (pageNum: number = 1, append: boolean = false) => {
    const limit = 10;
    const skip = (pageNum - 1) * limit;
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const res = await fetch(`/api/todos?skip=${skip}&limit=${limit}`);
      const data = await res.json();
      console.log('API Response (raw):', JSON.stringify(data, null, 2));
      const todosArray = Array.isArray(data.todos) ? data.todos : [];
      const normalizedTodos: Todo[] = todosArray.map((todo: Todo) => ({
        ...todo,
        startDate: todo.startDate,
        endDate: todo.endDate,
        startTime: todo.startTime,
        endTime: todo.endTime,
        completedAt: todo.completedAt,
      }));
      console.log('Todos with dates:', JSON.stringify(normalizedTodos.map((t: Todo) => ({ _id: t._id, title: t.title, startDate: t.startDate, endDate: t.endDate })), null, 2));
      
      // Artificial delay to show skeleton for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Deduplicate todos based on _id
      const existingIds = new Set(append ? todos.map(t => t._id) : []);
      const newTodos = normalizedTodos.filter(todo => !existingIds.has(todo._id));
      
      if (append) {
        setTodos(prev => [...prev, ...newTodos]);
      } else {
        setTodos(newTodos);
      }
      
      setHasMore(data.pagination?.hasMore ?? normalizedTodos.length === limit);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      if (!append) {
        setTodos([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const validateTask = (task: TaskForm, isEdit: boolean = false): boolean => {
    const newErrors: ValidationErrors = {
      title: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      priority: '',
      category: '',
    };
    let isValid = true;

    if (!task.title.trim()) {
      newErrors.title = 'Task title is required';
      isValid = false;
    }

    if (!task.startDate) {
      newErrors.startDate = 'Start date is required';
      isValid = false;
    }

    if (!task.endDate) {
      newErrors.endDate = 'End date is required';
      isValid = false;
    }

    if (!task.startTime) {
      newErrors.startTime = 'Start time is required';
      isValid = false;
    }

    if (!task.endTime) {
      newErrors.endTime = 'End time is required';
      isValid = false;
    }

    if (!task.priority) {
      newErrors.priority = 'Priority is required';
      isValid = false;
    }

    if (!task.category) {
      newErrors.category = 'Category is required';
      isValid = false;
    }

    if (task.startDate && task.endDate && task.startTime && task.endTime) {
      const startDateTime = new Date(`${task.startDate}T${task.startTime}`);
      const endDateTime = new Date(`${task.endDate}T${task.endTime}`);
      
      if (startDateTime >= endDateTime) {
        newErrors.endDate = 'End date/time must be after start date/time';
        isValid = false;
      }
    }

    if (isEdit) {
      setEditErrors(newErrors);
    } else {
      setErrors(newErrors);
    }
    
    return isValid;
  };

  const clearErrors = (isEdit: boolean) => {
    if (isEdit) {
      setEditErrors({
        title: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        priority: '',
        category: '',
      });
    } else {
      setErrors({
        title: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        priority: '',
        category: '',
      });
    }
  };

  const handleAddTask = async () => {
    console.log('Creating task with data:', newTask);
    
    if (!validateTask(newTask)) {
      return;
    }
    
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        fetchTodos();
        setIsModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          category: 'Personal',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
        });
        clearErrors(false);
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    const taskData: TaskForm = {
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority || 'medium',
      category: todo.category || 'Personal',
      startDate: todo.startDate || '',
      endDate: todo.endDate || '',
      startTime: todo.startTime || '',
      endTime: todo.endTime || '',
    };
    setEditTask(taskData);
    setOriginalEditTask(taskData);
    setIsEditModalOpen(true);
    clearErrors(true);
  };

  const hasEditChanges = () => {
    return (
      editTask.title !== originalEditTask.title ||
      editTask.description !== originalEditTask.description ||
      editTask.priority !== originalEditTask.priority ||
      editTask.category !== originalEditTask.category ||
      editTask.startDate !== originalEditTask.startDate ||
      editTask.endDate !== originalEditTask.endDate ||
      editTask.startTime !== originalEditTask.startTime ||
      editTask.endTime !== originalEditTask.endTime
    );
  };

  const handleUpdateTask = async () => {
    if (!editingTodo) return;
    
    if (!validateTask(editTask, true)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/todos/${editingTodo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTask),
      });
      if (res.ok) {
        fetchTodos();
        setIsEditModalOpen(false);
        setShowSaveConfirmation(false);
        setEditingTodo(null);
        clearErrors(true);
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleCancelEdit = () => {
    if (hasEditChanges()) {
      setShowCancelConfirmation(true);
    } else {
      setIsEditModalOpen(false);
      setEditingTodo(null);
      clearErrors(true);
    }
  };

  const confirmCancelEdit = () => {
    setShowCancelConfirmation(false);
    setIsEditModalOpen(false);
    setEditingTodo(null);
    clearErrors(true);
  };

  const confirmSaveEdit = () => {
    setShowSaveConfirmation(false);
    handleUpdateTask();
  };

  const confirmDeleteTodo = () => {
    if (todoToDelete) {
      handleDeleteTodo(todoToDelete);
    }
    setShowDeleteConfirmation(false);
    setTodoToDelete(null);
  };

  const handleDeleteClick = (id: string) => {
    setTodoToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed, ongoing: false }),
      });
      if (res.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleToggleOngoing = async (todo: Todo) => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ongoing: !todo.ongoing, completed: false }),
      });
      if (res.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const todoList = Array.isArray(todos) ? todos : [];
  const filteredTodos = todoList.filter(todo => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && !todo.completed && !todo.ongoing) ||
      (activeTab === 'ongoing' && todo.ongoing && !todo.completed) ||
      (activeTab === 'completed' && todo.completed) ||
      (activeTab === 'high' && todo.priority === 'high') ||
      (activeTab === 'medium' && todo.priority === 'medium') ||
      (activeTab === 'low' && todo.priority === 'low');
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (todo.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
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

  const getStatusColor = (todo: Todo) => {
    if (todo.completed) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (todo.ongoing) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (isOverdue(todo)) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    return 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const isOverdue = (todo: Todo) => {
    if (todo.completed || todo.ongoing) return false;
    if (!todo.endDate) return false;
    
    const now = new Date();
    const endDateTime = new Date(todo.endDate);
    
    if (todo.endTime) {
      const [hours, minutes] = todo.endTime.split(':').map(Number);
      endDateTime.setHours(hours, minutes, 0, 0);
    } else {
      endDateTime.setHours(23, 59, 59, 999);
    }
    
    return now > endDateTime;
  };

  const getStatusBadge = (todo: Todo) => {
    if (todo.completed) return 'completed';
    if (todo.ongoing) return 'ongoing';
    if (isOverdue(todo)) return 'overdue';
    return 'pending';
  };

  const formatCompletedDate = (dateString?: string) => {
    if (!dateString) return '';
    let dateValue = dateString;
    if (dateString.startsWith('{ $date:')) {
      try {
        const parsed = JSON.parse(dateString);
        dateValue = parsed.$date;
      } catch (e) {
        console.error('Failed to parse date:', e);
      }
    }
    const date = new Date(dateValue);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const TaskSkeleton = ({ viewMode }: { viewMode: string }) => {
    if (viewMode === 'list') {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 mb-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-3" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
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
            <div className="flex flex-col gap-2 mb-3">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-14" />
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
              <Skeleton className="h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="flex-1">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-2">
            Tasks
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Manage your tasks efficiently with advanced filtering and organization.</p>
        </div>
        <Button onClick={() => { setIsModalOpen(true); clearErrors(false); }} className="sm:w-auto w-full">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New Task
        </Button>
      </div>


      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'ongoing', 'completed', 'high', 'medium', 'low'].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab)}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Your Tasks ({filteredTodos.length})
          </h2>
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-r-none flex-1 sm:flex-none"
            >
              <ListBulletIcon className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">List</span>
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-l-none flex-1 sm:flex-none"
            >
              <Squares2X2Icon className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Grid</span>
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
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400">No tasks found matching your criteria.</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredTodos.map((todo) => (
                  <Card key={todo._id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 mb-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold">{todo.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getPriorityColor(todo.priority || 'medium')}>{todo.priority || 'medium'}</Badge>
                            <Badge className={getStatusColor(todo)}>{getStatusBadge(todo)}</Badge>
                          </div>
                        </div>
                      </div>
                      {todo.description && <p className="text-muted-foreground mb-3 text-sm">{todo.description}</p>}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex items-center">
                            <FolderIcon className="h-4 w-4 mr-1" />
                            <span>{todo.category || 'Personal'}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            <span className="text-xs">
                              {todo.startDate || 'No date'} {todo.startTime && `- ${todo.startTime}`} - {todo.endDate || 'No date'} {todo.endTime && `- ${todo.endTime}`}
                            </span>
                          </div>
                          {todo.completed && todo.completedAt && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <CheckIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs">Completed at: {formatCompletedDate(todo.completedAt)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" title="Edit" disabled={todo.completed} onClick={() => handleEditClick(todo)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {!todo.ongoing && !todo.completed && (
                            <Button variant="outline" size="sm" onClick={() => handleToggleOngoing(todo)} title="Mark as ongoing">
                              <PlayIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {todo.ongoing && (
                            <Button variant="outline" size="sm" onClick={() => handleToggleOngoing(todo)} title="Pause">
                              <PauseIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleToggleComplete(todo)} title={todo.completed ? 'Mark as pending' : 'Mark as complete'} disabled={todo.completed}>
                            <CheckIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteClick(todo._id)} title="Delete" disabled={todo.completed}>
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTodos.map((todo) => (
                  <Card key={todo._id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="text-base font-semibold line-clamp-2">{todo.title}</h3>
                          <div className="flex flex-wrap gap-1">
                            <Badge className={getPriorityColor(todo.priority || 'medium')}>{todo.priority || 'medium'}</Badge>
                            <Badge className={getStatusColor(todo)}>{getStatusBadge(todo)}</Badge>
                          </div>
                        </div>
                      </div>
                      {todo.description && <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{todo.description}</p>}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <FolderIcon className="h-3 w-3 mr-1" />
                          <span>{todo.category || 'Personal'}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-3 w-3 mr-1" />
                          <span>
                            {todo.startDate || 'No date'} {todo.startTime && `- ${todo.startTime}`} - {todo.endDate || 'No date'} {todo.endTime && `- ${todo.endTime}`}
                          </span>
                        </div>
                        {todo.completed && todo.completedAt && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckIcon className="h-3 w-3 mr-1" />
                            <span>Completed at: {formatCompletedDate(todo.completedAt)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1" title="Edit" disabled={todo.completed} onClick={() => handleEditClick(todo)}>
                          <PencilIcon className="h-3 w-3" />
                        </Button>
                        {!todo.ongoing && !todo.completed && (
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggleOngoing(todo)} title="Mark as ongoing">
                            <PlayIcon className="h-3 w-3" />
                          </Button>
                        )}
                        {todo.ongoing && (
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggleOngoing(todo)} title="Pause">
                            <PauseIcon className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggleComplete(todo)} title={todo.completed ? 'Mark as pending' : 'Mark as complete'} disabled={todo.completed}>
                          <CheckIcon className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDeleteClick(todo._id)} title="Delete" disabled={todo.completed}>
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-4">
                {isLoadingMore && (
                  <div className="space-y-4">
                    {viewMode === 'list' ? (
                      Array.from({ length: 2 }).map((_, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-3 mb-2">
                              <Skeleton className="h-6 w-3/4" />
                              <div className="flex gap-2">
                                <Skeleton className="h-5 w-12" />
                                <Skeleton className="h-5 w-16" />
                              </div>
                            </div>
                            <Skeleton className="h-4 w-full mb-3" />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex flex-wrap gap-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <div className="flex space-x-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex flex-col gap-2 mb-3">
                                <Skeleton className="h-5 w-2/3" />
                                <div className="flex gap-1">
                                  <Skeleton className="h-4 w-10" />
                                  <Skeleton className="h-4 w-14" />
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
                                <Skeleton className="h-8 flex-1" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!hasMore && filteredTodos.length > 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <p>You've reached the end of your tasks</p>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="Enter task title..." 
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => {
                      if (value === 'add_new') {
                        setIsAddCategoryModalOpen(true);
                      } else {
                        setNewTask({ ...newTask, category: value });
                      }
                    }}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="add_new">➕ Add new category</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    value={newTask.endDate}
                    onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startTime ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    value={newTask.startTime}
                    onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                  />
                  {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endTime ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    value={newTask.endTime}
                    onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                  />
                  {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <Textarea 
                  placeholder="Enter task description..." 
                  rows={4} 
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" onClick={handleAddTask}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleCancelEdit();
        } else {
          setIsEditModalOpen(true);
        }
      }}>
        <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="Enter task title..." 
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  className={editErrors.title ? 'border-red-500' : ''}
                />
                {editErrors.title && <p className="text-red-500 text-xs mt-1">{editErrors.title}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={editTask.priority}
                    onValueChange={(value) => setEditTask({ ...editTask, priority: value })}
                  >
                    <SelectTrigger className={editErrors.priority ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {editErrors.priority && <p className="text-red-500 text-xs mt-1">{editErrors.priority}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={editTask.category}
                    onValueChange={(value) => {
                      if (value === 'add_new') {
                        setIsAddCategoryModalOpen(true);
                      } else {
                        setEditTask({ ...editTask, category: value });
                      }
                    }}
                  >
                    <SelectTrigger className={editErrors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="add_new">➕ Add new category</SelectItem>
                    </SelectContent>
                  </Select>
                  {editErrors.category && <p className="text-red-500 text-xs mt-1">{editErrors.category}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.startDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    value={editTask.startDate}
                    onChange={(e) => setEditTask({ ...editTask, startDate: e.target.value })}
                  />
                  {editErrors.startDate && <p className="text-red-500 text-xs mt-1">{editErrors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.endDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    value={editTask.endDate}
                    onChange={(e) => setEditTask({ ...editTask, endDate: e.target.value })}
                  />
                  {editErrors.endDate && <p className="text-red-500 text-xs mt-1">{editErrors.endDate}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.startTime ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    value={editTask.startTime}
                    onChange={(e) => setEditTask({ ...editTask, startTime: e.target.value })}
                  />
                  {editErrors.startTime && <p className="text-red-500 text-xs mt-1">{editErrors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className={`w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.endTime ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                    value={editTask.endTime}
                    onChange={(e) => setEditTask({ ...editTask, endTime: e.target.value })}
                  />
                  {editErrors.endTime && <p className="text-red-500 text-xs mt-1">{editErrors.endTime}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <Textarea 
                  placeholder="Enter task description..." 
                  rows={4} 
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" onClick={() => setShowSaveConfirmation(true)}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      <Dialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
          </DialogHeader>
          <p className="text-slate-700 dark:text-slate-300 mb-4">Are you sure you want to save these changes?</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveConfirmation(false)}
            >
              No
            </Button>
            <Button onClick={confirmSaveEdit}>
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discard Changes</DialogTitle>
          </DialogHeader>
          <p className="text-slate-700 dark:text-slate-300 mb-4">All changes will be discarded. Are you sure you want to cancel?</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirmation(false)}
            >
              No
            </Button>
            <Button onClick={confirmCancelEdit}>
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-slate-700 dark:text-slate-300 mb-4">Are you sure you want to delete this task?</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirmation(false);
                setTodoToDelete(null);
              }}
            >
              No
            </Button>
            <Button onClick={confirmDeleteTodo}>
              Yes
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
              onClick={handleAddCategory}
            >
              Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteCategoryConfirmation} onOpenChange={setShowDeleteCategoryConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-slate-700 dark:text-slate-300 mb-4">Are you sure you want to delete the category "{categoryToDelete}"? Tasks with this category will be unaffected.</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteCategoryConfirmation(false);
                setCategoryToDelete(null);
              }}
            >
              No
            </Button>
            <Button onClick={confirmDeleteCategory}>
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

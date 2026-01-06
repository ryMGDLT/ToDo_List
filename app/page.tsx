'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentTextIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      const todoList = data.todos || (Array.isArray(data) ? data : []);
      setTodos(todoList);
      
      const events: CalendarEvent[] = todoList.map((todo: Todo) => {
        const startDateTime = todo.startTime 
          ? `${todo.startDate}T${todo.startTime}`
          : todo.startDate || todo.createdAt;
        
        const endDateTime = todo.endTime 
          ? `${todo.endDate}T${todo.endTime}`
          : (todo.endDate || todo.startDate || todo.createdAt) + (todo.startTime ? `T${todo.startTime}` : '');
        
        return {
          id: todo._id,
          title: todo.title,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: todo.completed ? '#22c55e' : '#3b82f6',
          borderColor: todo.completed ? '#22c55e' : '#3b82f6',
        };
      });
      setCalendarEvents(events);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      setTodos([]);
      setCalendarEvents([]);
    } finally {
      setIsLoading(false);
    }
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

  const todoList = Array.isArray(todos) ? todos : [];
  const totalTasks = todoList.length;
  const completedTasks = todoList.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="flex-1">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Welcome back! Here's your task overview.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-8 w-12" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Total Tasks</h2>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalTasks}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Completed Tasks</h2>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{completedTasks}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Pending Tasks</h2>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{pendingTasks}</p>
              </div>
            </>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Recent Tasks</h2>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : todoList.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">No tasks yet. Start by adding your first task!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todoList.slice(0, 5).map((todo) => (
                <div key={todo._id} className="flex items-start space-x-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${todo.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                    <DocumentTextIcon className={`h-5 w-5 ${todo.completed ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800 dark:text-slate-200">{todo.title}</h3>
                    {todo.description && <p className="text-sm text-slate-500 dark:text-slate-400">{todo.description}</p>}
                    {todo.completed && todo.completedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">Completed at: {formatCompletedDate(todo.completedAt)}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${todo.completed ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'}`}>
                    {todo.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg md:text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Task Calendar</h2>
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="task-calendar overflow-x-auto">
              <div className="min-w-full calendar-container">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  events={calendarEvents}
                  eventContent={(eventInfo) => (
                    <div className="text-xs px-1 py-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                      {eventInfo.event.title}
                    </div>
                  )}
                  height="auto"
                  aspectRatio={1.8}
                  eventDisplay="block"
                />
              </div>
            </div>
          )}
        </div>
      </div>
  );
}

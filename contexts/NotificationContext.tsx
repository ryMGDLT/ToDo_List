'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Notification {
  _id: string;
  type: 'start_time' | 'end_time' | 'overdue';
  title: string;
  message: string;
  taskId: string;
  taskTitle: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, '_id' | 'createdAt' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  checkNotifications: (todos: any[]) => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_THRESHOLD_MINUTES = 15;

const shownNotificationKeys = new Set<string>();

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        data.forEach((n: Notification) => {
          shownNotificationKeys.add(`${n.taskId}-${n.type}`);
        });
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback(async (notification: Omit<Notification, '_id' | 'createdAt' | 'read'>) => {
    const notificationKey = `${notification.taskId}-${notification.type}`;
    
    if (shownNotificationKeys.has(notificationKey)) {
      return;
    }
    
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
      
      if (res.ok) {
        const newNotification = await res.json();
        shownNotificationKeys.add(notificationKey);
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      });
      
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
      });
      
      setNotifications([]);
      shownNotificationKeys.clear();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, []);

  const checkNotifications = useCallback(async (todos: any[]) => {
    const now = new Date();

    for (const todo of todos) {
      if (todo.completed) continue;

      const startDateTime = todo.startDate && todo.startTime 
        ? new Date(`${todo.startDate}T${todo.startTime}`)
        : null;
      const endDateTime = todo.endDate && todo.endTime
        ? new Date(`${todo.endDate}T${todo.endTime}`)
        : null;

      if (startDateTime && !todo.ongoing && !todo.completed) {
        const timeDiff = startDateTime.getTime() - now.getTime();
        const minutesBefore = timeDiff / (1000 * 60);
        
        if (minutesBefore > 0 && minutesBefore <= NOTIFICATION_THRESHOLD_MINUTES) {
          await addNotification({
            type: 'start_time',
            title: 'Task Starting Soon',
            message: `"${todo.title}" is starting in ${Math.round(minutesBefore)} minutes`,
            taskId: todo._id,
            taskTitle: todo.title,
          });
        }
      }

      if (endDateTime && !todo.completed) {
        const timeDiff = endDateTime.getTime() - now.getTime();
        const minutesBefore = timeDiff / (1000 * 60);

        if (minutesBefore > 0 && minutesBefore <= NOTIFICATION_THRESHOLD_MINUTES) {
          await addNotification({
            type: 'end_time',
            title: 'Task Ending Soon',
            message: `"${todo.title}" is ending in ${Math.round(minutesBefore)} minutes`,
            taskId: todo._id,
            taskTitle: todo.title,
          });
        }
      }

      if (endDateTime && now > endDateTime && !todo.completed) {
        const overdueMinutes = Math.round((now.getTime() - endDateTime.getTime()) / (1000 * 60));
        const overdueText = overdueMinutes < 60 
          ? `${overdueMinutes} minute${overdueMinutes > 1 ? 's' : ''}`
          : `${Math.round(overdueMinutes / 60)} hour${Math.round(overdueMinutes / 60) > 1 ? 's' : ''}`;

        await addNotification({
          type: 'overdue',
          title: 'Task Overdue',
          message: `"${todo.title}" is overdue by ${overdueText}`,
          taskId: todo._id,
          taskTitle: todo.title,
        });
      }
    }
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        checkNotifications,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

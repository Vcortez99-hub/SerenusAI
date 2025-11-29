import { useEffect, useState, useCallback } from 'react';
import { notificationSocket, Notification } from '@/services/notification-socket';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Conectar ao socket
    notificationSocket.connect(userId);
    setConnected(true);

    // Listener para todas as notificações
    const cleanup = notificationSocket.on('*', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Mostrar notificação do navegador se permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: notification.type
        });
      }
    });

    // Pedir permissão para notificações do navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      cleanup();
      // Não desconectar aqui para manter conexão entre páginas
    };
  }, [userId]);

  const markAsRead = useCallback((index: number) => {
    setNotifications(prev => {
      const newNotifications = [...prev];
      newNotifications.splice(index, 1);
      return newNotifications;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const onNotification = useCallback((type: string, callback: (notification: Notification) => void) => {
    return notificationSocket.on(type, callback);
  }, []);

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    onNotification
  };
}

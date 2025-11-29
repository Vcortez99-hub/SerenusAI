import { io, Socket } from 'socket.io-client';

interface Notification {
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
  actions?: Array<{
    label: string;
    action: string;
    [key: string]: any;
  }>;
}

class NotificationSocket {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();
  private connected = false;

  connect(userId: string) {
    if (this.socket && this.connected) {
      console.log('✅ Socket já conectado');
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

    this.socket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO conectado:', this.socket?.id);
      this.connected = true;

      // Registrar usuário
      this.socket?.emit('register', userId);
    });

    this.socket.on('registered', (data) => {
      console.log('✅ Usuário registrado:', data);
    });

    this.socket.on('notification', (notification: Notification) => {
      console.log('🔔 Nova notificação:', notification);

      // Disparar listeners por tipo
      const typeListeners = this.listeners.get(notification.type);
      if (typeListeners) {
        typeListeners.forEach(listener => listener(notification));
      }

      // Disparar listeners gerais
      const allListeners = this.listeners.get('*');
      if (allListeners) {
        allListeners.forEach(listener => listener(notification));
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO desconectado');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('❌ Erro Socket.IO:', error);
    });

    // Heartbeat
    setInterval(() => {
      if (this.socket && this.connected) {
        this.socket.emit('ping');
      }
    }, 30000);

    this.socket.on('pong', () => {
      // console.log('💓 Heartbeat');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  on(type: string, callback: (notification: Notification) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Retornar função de cleanup
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(callback);
      }
    };
  }

  off(type: string, callback?: (notification: Notification) => void) {
    if (!callback) {
      this.listeners.delete(type);
    } else {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(callback);
      }
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton
export const notificationSocket = new NotificationSocket();

export type { Notification };


import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/store/notificationStore';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  children: React.ReactNode;
}

const NotificationDropdown = ({ children }: NotificationDropdownProps) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  } = useNotificationStore();

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'appointment':
        return '📅';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-medium">Notificações</h2>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              className="text-xs h-7"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {sortedNotifications.length > 0 ? (
            <div className="flex flex-col py-1">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start justify-between p-3 hover:bg-muted/50 transition-colors",
                    notification.read ? "" : "bg-primary/5"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <p className={cn("text-sm", notification.read ? "" : "font-medium")}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteNotification(notification.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;

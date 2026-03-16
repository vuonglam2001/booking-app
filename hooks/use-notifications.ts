import { useContext } from 'react';

import { NotificationsContext } from '@/contexts/notifications-context';

export function useNotifications() {
  return useContext(NotificationsContext);
}

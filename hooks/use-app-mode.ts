import { useContext } from 'react';

import { AppModeContext } from '@/contexts/app-mode-context';

export function useAppMode() {
  return useContext(AppModeContext);
}

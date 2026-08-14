import { useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import type { UserRole } from '@/types';

export const HOME_ROUTE_BY_ROLE: Record<UserRole, Href> = {
  CUSTOMER: '/(tabs)',
  PROVIDER: '/(tabs)/provider-dashboard',
  ADMIN: '/(tabs)/admin-overview',
};

/**
 * Safe back navigation: pops the stack when history exists, otherwise replaces
 * to the role's home tab. Needed because the auth gate (and deep links) use
 * router.replace(), which can leave a pushed screen with no history to pop.
 */
export function useSafeGoBack(): () => void {
  const router = useRouter();
  const { role } = useAuth();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(HOME_ROUTE_BY_ROLE[role ?? 'CUSTOMER']);
    }
  }, [router, role]);
}

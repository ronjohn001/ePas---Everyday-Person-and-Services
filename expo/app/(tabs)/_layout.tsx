import { Tabs } from 'expo-router';
import { Home, Calendar, MessageCircle, User, LayoutDashboard, Briefcase, Wallet, Star } from 'lucide-react-native';
import { Platform } from 'react-native';
import { COLORS, ROLE_ACCENT } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import type { UserRole } from '@/types';

type TabDef = {
  name: string;
  title: string;
  icon: React.ComponentType<{ color: string; size: number }>;
};

const CLIENT_TABS: TabDef[] = [
  { name: 'index', title: 'Home', icon: Home },
  { name: 'bookings', title: 'Bookings', icon: Calendar },
  { name: 'messages', title: 'Messages', icon: MessageCircle },
  { name: 'profile', title: 'Profile', icon: User },
];

const PROVIDER_TABS: TabDef[] = [
  { name: 'provider-dashboard', title: 'Dashboard', icon: LayoutDashboard },
  { name: 'provider-jobs', title: 'Jobs', icon: Briefcase },
  { name: 'provider-earnings', title: 'Earnings', icon: Wallet },
  { name: 'provider-reviews', title: 'Reviews', icon: Star },
];

// Admins get a single Dashboard home — no bottom tab bar.
const ADMIN_TABS: TabDef[] = [
  { name: 'admin-overview', title: 'Dashboard', icon: LayoutDashboard },
];

const TABS_BY_ROLE: Record<UserRole, TabDef[]> = {
  CUSTOMER: CLIENT_TABS,
  PROVIDER: PROVIDER_TABS,
  ADMIN: ADMIN_TABS,
};

const ALL_TAB_ROUTES = [
  'index',
  'bookings',
  'messages',
  'profile',
  'provider-dashboard',
  'provider-jobs',
  'provider-earnings',
  'provider-reviews',
  'admin-overview',
] as const;

export default function TabLayout() {
  const { role } = useAuth();
  const activeRole: UserRole = role ?? 'CUSTOMER';
  const accent = ROLE_ACCENT[activeRole];
  const tabs = TABS_BY_ROLE[activeRole];
  const hideTabBar = activeRole === 'ADMIN';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accent.color,
        tabBarInactiveTintColor: 'rgba(242,245,250,0.40)',
        headerShown: false,
        tabBarStyle: hideTabBar
          ? { display: 'none' as const }
          : {
              position: 'absolute' as const,
              bottom: 14,
              left: 16,
              right: 16,
              height: 62,
              backgroundColor: Platform.select({
                ios: 'rgba(7,10,31,0.78)',
                android: 'rgba(7,10,31,0.94)',
              }),
              borderTopWidth: 1,
              borderTopColor: COLORS.glassBorder,
              borderBottomWidth: 0,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderLeftColor: COLORS.glassBorder,
              borderRightColor: COLORS.glassBorder,
              borderRadius: 22,
              elevation: 10,
              shadowColor: accent.color,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 18,
              paddingBottom: 6,
              paddingTop: 6,
            },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: { marginBottom: 0 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <tab.icon color={color} size={22} />,
          }}
        />
      ))}
      {/* Hide every tab screen that isn't part of the active role's tab bar */}
      {ALL_TAB_ROUTES.filter((name) => !tabs.some((t) => t.name === name)).map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

import { Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/auth-store';
import { clearBiometricCredentials } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';
import { router } from 'expo-router';

interface LogoutButtonProps {
  color?: string;
  size?: number;
  style?: object;
}

export function LogoutButton({ color = COLORS.textPrimary, size = 22, style }: LogoutButtonProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearBiometricCredentials();
            await logout();
            router.replace('/login');
          },
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={handleLogout}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="log-out-outline" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

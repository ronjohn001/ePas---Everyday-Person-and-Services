import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isWeb = Platform.OS === 'web';

/**
 * Supabase client — native Supabase Auth mode.
 * supabase-js owns the session (persisted in AsyncStorage) and `auth.uid()` works in RLS.
 * A separate long-lived "remember me" credential blob is stored in SecureStore for
 * biometric re-authentication (never used for RLS itself — the live session is).
 *
 * On web, `detectSessionInUrl` is enabled so OAuth redirects (Google) automatically
 * populate the session from the URL hash on page load.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: isWeb,
    },
  },
);

/** True when real Supabase credentials are configured. */
export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

/** SecureStore keys for biometric fast-relogin. */
export const BIOMETRIC_CRED_KEY = 'epas_biometric_creds';

/** Save email + password to SecureStore so biometric unlock can replay a real sign-in. No-op on web. */
export async function saveBiometricCredentials(email: string, password: string): Promise<void> {
  if (isWeb) return;
  try {
    await SecureStore.setItemAsync(
      BIOMETRIC_CRED_KEY,
      JSON.stringify({ email, password }),
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  } catch (error) {
    console.error('Failed to save biometric credentials:', error);
  }
}

/** Clear stored biometric credentials (on logout or when user disables the feature). No-op on web. */
export async function clearBiometricCredentials(): Promise<void> {
  if (isWeb) return;
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CRED_KEY);
  } catch {
    // already absent — ignore
  }
}

/** Read stored biometric credentials (returns null if none or on web). */
export async function getBiometricCredentials(): Promise<{ email: string; password: string } | null> {
  if (isWeb) return null;
  try {
    const raw = await SecureStore.getItemAsync(BIOMETRIC_CRED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email: string; password: string };
    if (!parsed.email || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

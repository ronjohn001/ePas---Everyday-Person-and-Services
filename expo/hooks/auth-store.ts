import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { supabase, supabaseEnabled, saveBiometricCredentials, clearBiometricCredentials, getBiometricCredentials } from '@/lib/supabase';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User, UserRole, AccountType, UserPhone, ApprovalStatus } from '@/types';

// Required for expo-web-browser OAuth flow — closes the popup after redirect.
WebBrowser.maybeCompleteAuthSession();

/** Redirect URI used to return from the Google OAuth browser flow. */
const GOOGLE_REDIRECT_URI = Linking.createURL('login');

const isWeb = Platform.OS === 'web';

/**
 * Auth store — native Supabase Auth.
 * - Email + password sign-up / sign-in
 * - Phone + OTP sign-in
 * - Biometric re-authentication (replays stored credentials after a Face/Fingerprint scan)
 * - Role is captured at sign-up (CUSTOMER | PROVIDER | ADMIN) and stored on the profile row.
 * Falls back to a local demo session when Supabase isn't configured (preview/dev).
 */

export type AuthMethod = 'email' | 'phone' | 'biometric' | 'google' | 'demo';

export interface AuthUser extends User {
  loginMethod: AuthMethod;
}

type ProfileRow = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: string;
  account_type: string;
  business_name: string | null;
  profile_photo: string | null;
  address: string | null;
  area: string | null;
  approval_status: string | null;
  created_at: string;
};

/** Fetch the profile row for a Supabase auth user. Returns null if not found. */
async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('fetchProfile error:', error.message);
    return null;
  }
  return (data as ProfileRow) ?? null;
}

/** Fetch all phone numbers for a user from the user_phones table. */
async function fetchUserPhones(userId: string): Promise<UserPhone[]> {
  const { data, error } = await supabase
    .from('user_phones')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false });
  if (error) {
    console.error('fetchUserPhones error:', error.message);
    return [];
  }
  return (data as UserPhone[]) ?? [];
}

/** Map a Supabase session + profile row into the app's AuthUser shape. */
function toAuthUser(session: Session | null, profile: ProfileRow | null, loginMethod: AuthMethod, phones: UserPhone[] = []): AuthUser | null {
  const su = session?.user;
  if (!su) return null;
  const role = (profile?.role as UserRole) ?? (su.user_metadata?.role as UserRole) ?? 'CUSTOMER';
  const primaryPhone = phones.find((p) => p.isPrimary)?.phone ?? phones[0]?.phone ?? '';
  return {
    id: su.id,
    email: profile?.email ?? su.email ?? '',
    phone: primaryPhone || (profile?.phone ?? su.phone ?? ''),
    phones,
    name: profile?.name ?? su.user_metadata?.name ?? su.email?.split('@')[0] ?? '',
    role,
    accountType: (profile?.account_type as AccountType) ?? 'PRIVATE',
    businessName: profile?.business_name ?? undefined,
    profilePhoto: profile?.profile_photo ?? undefined,
    address: profile?.address ?? undefined,
    area: profile?.area ?? undefined,
    approvalStatus: ((profile?.approval_status ?? (role === 'ADMIN' ? 'APPROVED' : 'PENDING')) as ApprovalStatus),
    createdAt: profile?.created_at ?? su.created_at ?? new Date().toISOString(),
    loginMethod,
  };
}

/** Biometric availability summary. */
export interface BiometricAvailability {
  available: boolean;
  enrolled: boolean;
  types: LocalAuthentication.AuthenticationType[];
}

export async function checkBiometrics(): Promise<BiometricAvailability> {
  if (isWeb) return { available: false, enrolled: false, types: [] };
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return { available: hasHardware, enrolled, types };
  } catch {
    return { available: false, enrolled: false, types: [] };
  }
}

/** Whether the user has previously opted into biometric fast-relogin. */
export async function hasBiometricCredentials(): Promise<boolean> {
  return (await getBiometricCredentials()) !== null;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  accountType?: AccountType;
  businessName?: string;
  address?: string;
}

export interface SignInResult {
  ok: boolean;
  error?: string;
  needsOtp?: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Guard against the INITIAL_SESSION event racing with bootstrap.
  // We only want to process auth state changes AFTER bootstrap completes.
  const bootstrappedRef = useRef(false);
  const loginMethodRef = useRef<AuthMethod>('email');

  /* -------- session bootstrap -------- */
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!supabaseEnabled) {
        // Dev/preview fallback — no persisted demo session by default.
        if (mounted) setIsLoading(false);
        bootstrappedRef.current = true;
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const currentSession = data.session;
        setSession(currentSession);
        if (currentSession) {
          const profile = await fetchProfile(currentSession.user.id);
          if (!mounted) return;
          const phones = await fetchUserPhones(currentSession.user.id);
          if (!mounted) return;
          setUser(toAuthUser(currentSession, profile, loginMethodRef.current, phones));
        }
      } catch (error) {
        console.error('Session bootstrap error:', error);
      } finally {
        if (mounted) setIsLoading(false);
        bootstrappedRef.current = true;
      }
    }

    bootstrap();

    // Only subscribe to auth state changes AFTER bootstrap is done.
    // This prevents the INITIAL_SESSION event from re-triggering loading state.
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      // Ignore the INITIAL_SESSION event — bootstrap already handled it.
      if (event === 'INITIAL_SESSION') return;

      setSession(newSession);
      if (newSession) {
        const profile = await fetchProfile(newSession.user.id);
        if (!mounted) return;
        const phones = await fetchUserPhones(newSession.user.id);
        if (!mounted) return;
        setUser(toAuthUser(newSession, profile, loginMethodRef.current, phones));
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /* -------- sign in with Google (OAuth) -------- */
  const signInWithGoogle = useCallback(async (): Promise<SignInResult> => {
    setIsAuthenticating(true);
    loginMethodRef.current = 'google';
    try {
      if (!supabaseEnabled) {
        // Dev fallback — fabricate a demo Google user.
        const demoUser: AuthUser = {
          id: `demo-google-${Date.now()}`,
          email: 'google.user@example.com',
          phone: '',
          phones: [],
          name: 'Google User',
          role: 'CUSTOMER',
          accountType: 'PRIVATE',
          approvalStatus: 'APPROVED',
          createdAt: new Date().toISOString(),
          loginMethod: 'google',
        };
        setUser(demoUser);
        return { ok: true };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: GOOGLE_REDIRECT_URI,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        return { ok: false, error: friendlyAuthError(error?.message ?? 'Unable to start Google sign-in.') };
      }

      // On native, open the system browser / in-app browser.
      // On web, the browser top-level window is the browser itself — we let
      // supabase-js do the redirect by opening the URL directly.
      if (isWeb) {
        window.location.href = data.url;
        return { ok: true };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, GOOGLE_REDIRECT_URI);
      if (result.type !== 'success' || !result.url) {
        if (result.type === 'cancel') {
          return { ok: false, error: 'Google sign-in was cancelled.' };
        }
        return { ok: false, error: 'Google sign-in failed. Please try again.' };
      }

      // Parse the redirect URL — Supabase returns tokens in the hash fragment.
      const parsed = new URL(result.url);
      const hashParams = new URLSearchParams(parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      if (errorCode || errorDescription) {
        return { ok: false, error: friendlyAuthError(errorDescription ?? 'Google sign-in was rejected.') };
      }

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          return { ok: false, error: friendlyAuthError(sessionError.message) };
        }
        // onAuthStateChange will populate the user.
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const profile = await fetchProfile(sessionData.session.user.id);
          const phones = await fetchUserPhones(sessionData.session.user.id);
          setUser(toAuthUser(sessionData.session, profile, 'google', phones));
        }
        return { ok: true };
      }

      // No tokens in URL — fall back to getSession in case supabase-js already handled it.
      const { data: sessionData2 } = await supabase.auth.getSession();
      if (sessionData2.session) {
        const profile = await fetchProfile(sessionData2.session.user.id);
        const phones = await fetchUserPhones(sessionData2.session.user.id);
        setUser(toAuthUser(sessionData2.session, profile, 'google', phones));
        return { ok: true };
      }

      return { ok: false, error: 'Google sign-in did not complete. Please try again.' };
    } catch (error) {
      console.error('signInWithGoogle error:', error);
      return { ok: false, error: 'Unable to sign in with Google. Please try again.' };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /* -------- sign up -------- */
  const signUp = useCallback(async (input: SignUpInput): Promise<SignInResult> => {
    setIsAuthenticating(true);
    loginMethodRef.current = 'email';
    try {
      if (!supabaseEnabled) {
        // Dev fallback — create a local demo user.
        const demoUser: AuthUser = {
          id: `demo-${Date.now()}`,
          email: input.email,
          phone: input.phone,
          phones: [{ id: `demo-phone-${Date.now()}`, phone: input.phone, label: 'Main', isPrimary: true, createdAt: new Date().toISOString() }],
          name: input.name,
          role: input.role,
          accountType: input.accountType ?? 'PRIVATE',
          businessName: input.businessName,
          address: input.address,
          approvalStatus: 'APPROVED',
          createdAt: new Date().toISOString(),
          loginMethod: 'demo',
        };
        setUser(demoUser);
        return { ok: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        phone: undefined,
        options: {
          data: {
            name: input.name,
            role: input.role,
            phone: input.phone,
            account_type: input.accountType ?? 'PRIVATE',
            business_name: input.businessName ?? '',
            address: input.address ?? '',
          },
        },
      });

      if (error) {
        return { ok: false, error: friendlyAuthError(error.message) };
      }

      // Some Supabase projects require email confirmation — session may be null until confirmed.
      if (!data.session) {
        return { ok: true, needsOtp: true };
      }
      // Session created immediately (email confirmation disabled).
      // Insert the primary phone into user_phones table.
      if (input.phone) {
        await supabase.from('user_phones').insert({
          user_id: data.session.user.id,
          phone: input.phone,
          label: 'Main',
          is_primary: true,
        });
      }
      const profile = await fetchProfile(data.session.user.id);
      const phones = await fetchUserPhones(data.session.user.id);
      setUser(toAuthUser(data.session, profile, 'email', phones));
      return { ok: true };
    } catch (error) {
      console.error('signUp error:', error);
      return { ok: false, error: 'Unable to create account. Please try again.' };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /* -------- sign in with email + password -------- */
  const signInWithEmail = useCallback(
    async (email: string, password: string, rememberBiometric: boolean = false): Promise<SignInResult> => {
      setIsAuthenticating(true);
      loginMethodRef.current = 'email';
      try {
        if (!supabaseEnabled) {
          // Dev fallback — fabricate a demo user of the default role.
          const demoUser: AuthUser = {
            id: `demo-${Date.now()}`,
            email,
            phone: '',
            phones: [],
            name: email.split('@')[0],
            role: 'CUSTOMER',
            accountType: 'PRIVATE',
            approvalStatus: 'APPROVED',
            createdAt: new Date().toISOString(),
            loginMethod: 'demo',
          };
          setUser(demoUser);
          return { ok: true };
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { ok: false, error: friendlyAuthError(error.message) };
        }
        if (rememberBiometric && !isWeb) {
          await saveBiometricCredentials(email, password);
        }
        // Eagerly fetch the profile so role-based routing works immediately.
        if (data.session) {
          const profile = await fetchProfile(data.session.user.id);
          const phones = await fetchUserPhones(data.session.user.id);
          setUser(toAuthUser(data.session, profile, 'email', phones));
        }
        return { ok: true };
      } catch (error) {
        console.error('signInWithEmail error:', error);
        return { ok: false, error: 'Unable to sign in. Please try again.' };
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

  /* -------- send phone OTP -------- */
  const sendPhoneOtp = useCallback(async (phone: string): Promise<SignInResult> => {
    setIsAuthenticating(true);
    loginMethodRef.current = 'phone';
    try {
      if (!supabaseEnabled) {
        return { ok: true, needsOtp: true };
      }
      const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
      if (error) {
        return { ok: false, error: friendlyAuthError(error.message) };
      }
      return { ok: true, needsOtp: true };
    } catch (error) {
      console.error('sendPhoneOtp error:', error);
      return { ok: false, error: 'Unable to send verification code.' };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /* -------- verify phone OTP -------- */
  const verifyPhoneOtp = useCallback(async (phone: string, token: string): Promise<SignInResult> => {
    setIsAuthenticating(true);
    try {
      if (!supabaseEnabled) {
        // Dev fallback.
        const demoUser: AuthUser = {
          id: `demo-${Date.now()}`,
          email: '',
          phone,
          phones: [{ id: `demo-phone-${Date.now()}`, phone, label: 'Main', isPrimary: true, createdAt: new Date().toISOString() }],
          name: 'Phone User',
          role: 'CUSTOMER',
          accountType: 'PRIVATE',
          approvalStatus: 'APPROVED',
          createdAt: new Date().toISOString(),
          loginMethod: 'phone',
        };
        setUser(demoUser);
        return { ok: true };
      }
      const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) {
        return { ok: false, error: friendlyAuthError(error.message) };
      }
      if (data.session) {
        const profile = await fetchProfile(data.session.user.id);
        const phones = await fetchUserPhones(data.session.user.id);
        setUser(toAuthUser(data.session, profile, 'phone', phones));
      }
      return { ok: true };
    } catch (error) {
      console.error('verifyPhoneOtp error:', error);
      return { ok: false, error: 'Invalid verification code.' };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  /* -------- biometric re-auth -------- */
  const signInWithBiometric = useCallback(async (): Promise<SignInResult> => {
    if (isWeb) {
      return { ok: false, error: 'Biometric authentication is not available on web.' };
    }
    setIsAuthenticating(true);
    try {
      const creds = await getBiometricCredentials();
      if (!creds) {
        return { ok: false, error: 'Biometric sign-in is not set up on this device.' };
      }
      const biometrics = await checkBiometrics();
      if (!biometrics.available || !biometrics.enrolled) {
        return { ok: false, error: 'Biometric authentication is not available on this device.' };
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock ePaS',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      if (!result.success) {
        return { ok: false, error: 'Biometric authentication was cancelled.' };
      }
      return signInWithEmail(creds.email, creds.password, true);
    } catch (error) {
      console.error('signInWithBiometric error:', error);
      return { ok: false, error: 'Biometric sign-in failed.' };
    } finally {
      setIsAuthenticating(false);
    }
  }, [signInWithEmail]);

  /* -------- disable biometric -------- */
  const disableBiometric = useCallback(async () => {
    await clearBiometricCredentials();
  }, []);

  /* -------- update profile (name, phone, business, photo, address) -------- */
  const updateProfile = useCallback(
    async (patch: Partial<Pick<AuthUser, 'name' | 'phone' | 'businessName' | 'profilePhoto' | 'accountType' | 'address'>>): Promise<SignInResult> => {
      if (!session?.user) return { ok: false, error: 'Not signed in.' };
      try {
        const update: Record<string, unknown> = {};
        if (patch.name !== undefined) update.name = patch.name;
        if (patch.phone !== undefined) update.phone = patch.phone;
        if (patch.businessName !== undefined) update.business_name = patch.businessName;
        if (patch.profilePhoto !== undefined) update.profile_photo = patch.profilePhoto;
        if (patch.accountType !== undefined) update.account_type = patch.accountType;
        if (patch.address !== undefined) update.address = patch.address;

        if (Object.keys(update).length > 0) {
          const { error } = await supabase.from('profiles').update(update).eq('id', session.user.id);
          if (error) {
            return { ok: false, error: error.message };
          }
        }
        setUser((prev) => (prev ? { ...prev, ...patch } : prev));
        return { ok: true };
      } catch (error) {
        console.error('updateProfile error:', error);
        return { ok: false, error: 'Unable to update profile.' };
      }
    },
    [session],
  );

  /* -------- add a phone number -------- */
  const addPhone = useCallback(async (phone: string, label: string = 'Additional'): Promise<SignInResult> => {
    if (!session?.user) return { ok: false, error: 'Not signed in.' };
    try {
      if (!phone.trim()) return { ok: false, error: 'Phone number is required.' };
      const { data, error } = await supabase
        .from('user_phones')
        .insert({ user_id: session.user.id, phone: phone.trim(), label, is_primary: false })
        .select()
        .single();
      if (error) {
        return { ok: false, error: error.message };
      }
      const newPhone = data as UserPhone;
      setUser((prev) => (prev ? { ...prev, phones: [...prev.phones, newPhone] } : prev));
      return { ok: true };
    } catch (error) {
      console.error('addPhone error:', error);
      return { ok: false, error: 'Unable to add phone number.' };
    }
  }, [session]);

  /* -------- remove a phone number -------- */
  const removePhone = useCallback(async (phoneId: string): Promise<SignInResult> => {
    if (!session?.user) return { ok: false, error: 'Not signed in.' };
    try {
      const { error } = await supabase.from('user_phones').delete().eq('id', phoneId).eq('user_id', session.user.id);
      if (error) {
        return { ok: false, error: error.message };
      }
      setUser((prev) => {
        if (!prev) return prev;
        const updated = prev.phones.filter((p) => p.id !== phoneId);
        const newPrimary = updated.find((p) => p.isPrimary)?.phone ?? updated[0]?.phone ?? '';
        return { ...prev, phones: updated, phone: newPrimary };
      });
      return { ok: true };
    } catch (error) {
      console.error('removePhone error:', error);
      return { ok: false, error: 'Unable to remove phone number.' };
    }
  }, [session]);

  /* -------- set a phone as primary -------- */
  const setPrimaryPhone = useCallback(async (phoneId: string): Promise<SignInResult> => {
    if (!session?.user) return { ok: false, error: 'Not signed in.' };
    try {
      // Unset all other phones for this user
      await supabase.from('user_phones').update({ is_primary: false }).eq('user_id', session.user.id).neq('id', phoneId);
      // Set the chosen one as primary
      const { data, error } = await supabase
        .from('user_phones')
        .update({ is_primary: true })
        .eq('id', phoneId)
        .eq('user_id', session.user.id)
        .select()
        .single();
      if (error) {
        return { ok: false, error: error.message };
      }
      const updatedPhone = data as UserPhone;
      setUser((prev) => {
        if (!prev) return prev;
        const updated = prev.phones.map((p) => ({ ...p, isPrimary: p.id === phoneId }));
        return { ...prev, phones: updated, phone: updatedPhone.phone };
      });
      return { ok: true };
    } catch (error) {
      console.error('setPrimaryPhone error:', error);
      return { ok: false, error: 'Unable to set primary phone.' };
    }
  }, [session]);

  /* -------- refresh profile (e.g. after admin approval) -------- */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!supabaseEnabled || !session?.user) return;
    try {
      const profile = await fetchProfile(session.user.id);
      const phones = await fetchUserPhones(session.user.id);
      setUser(toAuthUser(session, profile, loginMethodRef.current, phones));
    } catch (error) {
      console.error('refreshProfile error:', error);
    }
  }, [session]);

  /* -------- sign out -------- */
  const logout = useCallback(async () => {
    try {
      if (supabaseEnabled) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('logout error:', error);
    } finally {
      setUser(null);
      setSession(null);
      loginMethodRef.current = 'email';
    }
  }, []);

  return useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticating,
      isAuthenticated: !!user,
      role: user?.role ?? null,
      signUp,
      signInWithEmail,
      signInWithGoogle,
      sendPhoneOtp,
      verifyPhoneOtp,
      signInWithBiometric,
      disableBiometric,
      updateProfile,
      addPhone,
      removePhone,
      setPrimaryPhone,
      refreshProfile,
      logout,
    }),
    [user, session, isLoading, isAuthenticating, signUp, signInWithEmail, signInWithGoogle, sendPhoneOtp, verifyPhoneOtp, signInWithBiometric, disableBiometric, updateProfile, addPhone, removePhone, setPrimaryPhone, refreshProfile, logout],
  );
});

/** Convert raw Supabase auth error messages into user-friendly text. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Incorrect email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email before signing in.';
  if (m.includes('user already registered')) return 'An account with this email already exists.';
  if (m.includes('password')) return 'Password must be at least 6 characters.';
  if (m.includes('phone')) return 'Invalid phone number. Use international format (+232…).';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
  return message;
}

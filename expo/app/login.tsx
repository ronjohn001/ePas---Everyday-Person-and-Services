import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { FlashingTick } from '@/components/FlashingTick';
import * as LocalAuthentication from 'expo-local-authentication';
import type { UserRole, AccountType } from '@/types';
import { ROLE_LABELS } from '@/types';

const isWeb = Platform.OS === 'web';

const { height } = Dimensions.get('window');

type Mode = 'welcome' | 'signin' | 'signup' | 'phone' | 'otp';
type FieldRole = UserRole;

export default function LoginScreen() {
  const {
    isAuthenticating,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    sendPhoneOtp,
    verifyPhoneOtp,
    signInWithBiometric,
  } = useAuth();

  const [mode, setMode] = useState<Mode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState<FieldRole>('CUSTOMER');
  const [accountType, setAccountType] = useState<AccountType>('PRIVATE');
  const [businessName, setBusinessName] = useState('');
  const [rememberBiometric, setRememberBiometric] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState('');
  const [biometricReady, setBiometricReady] = useState(false);

  // Note: the root layout (app/_layout.tsx) already swaps between the
  // `login` and `(tabs)` routes based on `isAuthenticated`. Doing our own
  // router.replace here would race with that and cause a visible flicker.

  // Check biometric availability on mount (skip on web — not supported)
  useEffect(() => {
    if (isWeb) {
      setBiometricReady(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        const { hasBiometricCredentials } = await import('@/hooks/auth-store');
        const hasCreds = await hasBiometricCredentials();
        if (mounted) setBiometricReady(hasHardware && enrolled && hasCreds);
      } catch {
        if (mounted) setBiometricReady(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const clearError = () => setError(null);

  const switchMode = (next: Mode) => {
    clearError();
    setMode(next);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    const result = await signInWithEmail(email.trim(), password, rememberBiometric);
    if (!result.ok) setError(result.error ?? 'Sign in failed.');
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password || !name.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (selectedRole === 'PROVIDER' && !businessName.trim() && accountType === 'BUSINESS') {
      setError('Please enter your business name.');
      return;
    }
    const result = await signUp({
      email: email.trim(),
      password,
      name: name.trim(),
      phone: phone.trim(),
      role: selectedRole,
      accountType,
      businessName: accountType === 'BUSINESS' ? businessName.trim() : undefined,
      address: address.trim() || undefined,
    });
    if (!result.ok) {
      setError(result.error ?? 'Sign up failed.');
    } else if (result.needsOtp) {
      Alert.alert(
        'Check your email',
        'We sent a confirmation link to your email. Please confirm to finish creating your account.',
        [{ text: 'OK', onPress: () => switchMode('signin') }],
      );
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    const result = await sendPhoneOtp(phone.trim());
    if (!result.ok) {
      setError(result.error ?? 'Could not send code.');
    } else if (result.needsOtp) {
      setPendingPhone(phone.trim());
      switchMode('otp');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    const result = await verifyPhoneOtp(pendingPhone, otp.trim());
    if (!result.ok) setError(result.error ?? 'Invalid code.');
  };

  const handleBiometric = async () => {
    const result = await signInWithBiometric();
    if (!result.ok) setError(result.error ?? 'Biometric sign-in failed.');
  };

  const handleGoogleSignIn = async () => {
    clearError();
    const result = await signInWithGoogle();
    if (!result.ok) setError(result.error ?? 'Google sign-in failed.');
  };

  // The root layout renders a full-screen loader while the session is being
  // restored. If we ever mount this screen, we are already known to be
  // unauthenticated, so we render the form directly — no second loading gate
  // that would toggle on/off and flicker the UI.
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenBackground variant="login">
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
              <View style={styles.inner}>
                {/* Hero */}
                <View style={styles.heroSection}>
                  <View style={styles.logoWrap}>
                    <Image source={require('@/assets/images/image1.png')} style={styles.logoImage} resizeMode="contain" />
                    <View style={styles.logoGlow} pointerEvents="none" />
                  </View>
                  <View style={styles.brandRow}>
                    <Text style={styles.brandName}>ePaS</Text>
                    <FlashingTick size={26} />
                  </View>
                  <Text style={styles.brandTagline}>everyday People and Skills</Text>
                  <View style={styles.taglineRow}>
                    <Text style={styles.brandSub}>On-Demand Local Services</Text>
                    <View style={styles.locationPill}>
                      <Ionicons name="location" size={11} color={COLORS.accent} />
                      <Text style={styles.locationText}>Sierra Leone</Text>
                    </View>
                  </View>
                </View>

                {/* Card */}
                <View style={styles.card}>
                  {Platform.OS === 'ios' ? (
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(7,10,31,0.78)' }]} pointerEvents="none" />
                  )}
                  <View style={styles.cardBorder} pointerEvents="none" />
                  <View style={styles.cardInner}>
                    {mode === 'welcome' && (
                      <WelcomeMode
                        onSignIn={() => switchMode('signin')}
                        onSignUp={() => switchMode('signup')}
                        onPhone={() => switchMode('phone')}
                        onBiometric={handleBiometric}
                        onGoogle={handleGoogleSignIn}
                        biometricReady={biometricReady}
                        isAuthenticating={isAuthenticating}
                      />
                    )}

                    {mode === 'signin' && (
                      <SignInMode
                        email={email}
                        password={password}
                        showPassword={showPassword}
                        rememberBiometric={rememberBiometric}
                        isAuthenticating={isAuthenticating}
                        error={error}
                        onEmail={setEmail}
                        onPassword={setPassword}
                        onToggleShow={() => setShowPassword((s) => !s)}
                        onToggleBiometric={() => setRememberBiometric((r) => !r)}
                        onSubmit={handleSignIn}
                        onBack={() => switchMode('welcome')}
                        onForgot={() => Alert.alert('Reset Password', 'Please contact support to reset your password.')}
                      />
                    )}

                    {mode === 'signup' && (
                      <SignUpMode
                        name={name}
                        email={email}
                        password={password}
                        phone={phone}
                        address={address}
                        showPassword={showPassword}
                        role={selectedRole}
                        accountType={accountType}
                        businessName={businessName}
                        isAuthenticating={isAuthenticating}
                        error={error}
                        onName={setName}
                        onEmail={setEmail}
                        onPassword={setPassword}
                        onPhone={setPhone}
                        onAddress={setAddress}
                        onToggleShow={() => setShowPassword((s) => !s)}
                        onRole={setSelectedRole}
                        onAccountType={setAccountType}
                        onBusinessName={setBusinessName}
                        onSubmit={handleSignUp}
                        onBack={() => switchMode('welcome')}
                      />
                    )}

                    {mode === 'phone' && (
                      <PhoneMode
                        phone={phone}
                        isAuthenticating={isAuthenticating}
                        error={error}
                        onPhone={setPhone}
                        onSubmit={handleSendOtp}
                        onBack={() => switchMode('welcome')}
                      />
                    )}

                    {mode === 'otp' && (
                      <OtpMode
                        phone={pendingPhone}
                        otp={otp}
                        isAuthenticating={isAuthenticating}
                        error={error}
                        onOtp={setOtp}
                        onSubmit={handleVerifyOtp}
                        onBack={() => switchMode('phone')}
                      />
                    )}
                  </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </Text>
                </View>
              </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

/* ----------------------------- Sub-modes ----------------------------- */

function WelcomeMode({
  onSignIn,
  onSignUp,
  onPhone,
  onBiometric,
  onGoogle,
  biometricReady,
  isAuthenticating,
}: {
  onSignIn: () => void;
  onSignUp: () => void;
  onPhone: () => void;
  onBiometric: () => void;
  onGoogle: () => void;
  biometricReady: boolean;
  isAuthenticating: boolean;
}) {
  return (
    <View style={styles.modeWrap}>
      <Text style={styles.modeTitle}>Welcome back</Text>
      <Text style={styles.modeSubtitle}>Sign in to manage your services, bookings and earnings.</Text>

      <GoogleButton onPress={onGoogle} loading={isAuthenticating} />

      <View style={styles.legalLinksRow}>
        <TouchableOpacity style={styles.legalLinkBtn} onPress={() => router.push('/terms')} activeOpacity={0.7}>
          <Text style={styles.legalLinkText}>Terms & Conditions</Text>
          <Ionicons name="chevron-forward" size={12} color={COLORS.accent} />
        </TouchableOpacity>
        <View style={styles.legalLinkDivider} />
        <TouchableOpacity style={styles.legalLinkBtn} onPress={() => router.push('/privacy')} activeOpacity={0.7}>
          <Text style={styles.legalLinkText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={12} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <PrimaryButton
        label="Sign in with email"
        icon="mail-outline"
        onPress={onSignIn}
        variant="accent"
      />
      <PrimaryButton
        label="Sign in with phone"
        icon="call-outline"
        onPress={onPhone}
        variant="ghost"
      />
      {biometricReady && (
        <PrimaryButton
          label="Use Face / Fingerprint"
          icon="finger-print-outline"
          onPress={onBiometric}
          variant="ghost"
        />
      )}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>New to ePaS?</Text>
        <View style={styles.dividerLine} />
      </View>

      <PrimaryButton
        label="Create an account"
        icon="person-add-outline"
        onPress={onSignUp}
        variant="solid"
      />
    </View>
  );
}

function SignInMode({
  email,
  password,
  showPassword,
  rememberBiometric,
  isAuthenticating,
  error,
  onEmail,
  onPassword,
  onToggleShow,
  onToggleBiometric,
  onSubmit,
  onBack,
  onForgot,
}: {
  email: string;
  password: string;
  showPassword: boolean;
  rememberBiometric: boolean;
  isAuthenticating: boolean;
  error: string | null;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onToggleShow: () => void;
  onToggleBiometric: () => void;
  onSubmit: () => void;
  onBack: () => void;
  onForgot: () => void;
}) {
  return (
    <View style={styles.modeWrap}>
      <View style={styles.modeHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={HIT_SLOP}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.modeTitle}>Sign in</Text>
        <View style={{ width: 20 }} />
      </View>

      <Field
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={onEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={onPassword}
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        rightAccessory={
          <TouchableOpacity onPress={onToggleShow} hitSlop={HIT_SLOP} style={styles.fieldRight}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        }
      />

      <TouchableOpacity style={styles.biometricToggle} onPress={onToggleBiometric} activeOpacity={0.7}>
        <Ionicons
          name={rememberBiometric ? 'checkbox-outline' : 'square-outline'}
          size={18}
          color={rememberBiometric ? COLORS.accent : COLORS.textTertiary}
        />
        <Text style={styles.biometricToggleText}>Enable Face / Fingerprint for next time</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onForgot} hitSlop={HIT_SLOP} style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {error && <ErrorBanner message={error} />}

      <PrimaryButton
        label="Sign in"
        icon="log-in-outline"
        onPress={onSubmit}
        variant="accent"
        loading={isAuthenticating}
      />
    </View>
  );
}

function SignUpMode({
  name,
  email,
  password,
  phone,
  address,
  showPassword,
  role,
  accountType,
  businessName,
  isAuthenticating,
  error,
  onName,
  onEmail,
  onPassword,
  onPhone,
  onAddress,
  onToggleShow,
  onRole,
  onAccountType,
  onBusinessName,
  onSubmit,
  onBack,
}: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  showPassword: boolean;
  role: FieldRole;
  accountType: AccountType;
  businessName: string;
  isAuthenticating: boolean;
  error: string | null;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onPhone: (v: string) => void;
  onAddress: (v: string) => void;
  onToggleShow: () => void;
  onRole: (r: FieldRole) => void;
  onAccountType: (t: AccountType) => void;
  onBusinessName: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.modeWrap}>
      <View style={styles.modeHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={HIT_SLOP}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.modeTitle}>Create account</Text>
        <View style={{ width: 20 }} />
      </View>

      <Text style={styles.fieldLabel}>I am a…</Text>
      <View style={styles.roleRow}>
        {(['CUSTOMER', 'PROVIDER', 'ADMIN'] as FieldRole[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleChip, role === r && styles.roleChipActive]}
            onPress={() => onRole(r)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={r === 'ADMIN' ? 'shield' : r === 'PROVIDER' ? 'briefcase' : 'person'}
              size={14}
              color={role === r ? COLORS.textInverse : COLORS.textSecondary}
            />
            <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
              {ROLE_LABELS[r]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Full name" icon="person-outline" value={name} onChangeText={onName} placeholder="Aminata Sesay" />
      <Field
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={onEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={onPassword}
        placeholder="At least 6 characters"
        secureTextEntry={!showPassword}
        rightAccessory={
          <TouchableOpacity onPress={onToggleShow} hitSlop={HIT_SLOP} style={styles.fieldRight}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        }
      />
      <Field
        label="Phone number"
        icon="call-outline"
        value={phone}
        onChangeText={onPhone}
        placeholder="+232 7X XXX XXX"
        keyboardType="phone-pad"
      />
      <Field
        label="Address (optional)"
        icon="location-outline"
        value={address}
        onChangeText={onAddress}
        placeholder="Street, City, Region"
      />

      {role === 'PROVIDER' && (
        <>
          <Text style={styles.fieldLabel}>Account type</Text>
          <View style={styles.roleRow}>
            {(['PRIVATE', 'BUSINESS'] as AccountType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.roleChip, accountType === t && styles.roleChipActive]}
                onPress={() => onAccountType(t)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={t === 'BUSINESS' ? 'storefront-outline' : 'person-outline'}
                  size={14}
                  color={accountType === t ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text style={[styles.roleChipText, accountType === t && styles.roleChipTextActive]}>
                  {t === 'BUSINESS' ? 'Business' : 'Individual'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {accountType === 'BUSINESS' && (
            <Field
              label="Business name"
              icon="storefront-outline"
              value={businessName}
              onChangeText={onBusinessName}
              placeholder="Sesay Electrical Services"
            />
          )}
        </>
      )}

      {error && <ErrorBanner message={error} />}

      <PrimaryButton
        label="Create account"
        icon="person-add-outline"
        onPress={onSubmit}
        variant="accent"
        loading={isAuthenticating}
      />
    </View>
  );
}

function PhoneMode({
  phone,
  isAuthenticating,
  error,
  onPhone,
  onSubmit,
  onBack,
}: {
  phone: string;
  isAuthenticating: boolean;
  error: string | null;
  onPhone: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.modeWrap}>
      <View style={styles.modeHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={HIT_SLOP}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.modeTitle}>Phone sign-in</Text>
        <View style={{ width: 20 }} />
      </View>
      <Text style={styles.modeSubtitle}>We'll send a verification code by SMS.</Text>

      <Field
        label="Phone number"
        icon="call-outline"
        value={phone}
        onChangeText={onPhone}
        placeholder="+232 7X XXX XXX"
        keyboardType="phone-pad"
      />

      {error && <ErrorBanner message={error} />}

      <PrimaryButton
        label="Send code"
        icon="send-outline"
        onPress={onSubmit}
        variant="accent"
        loading={isAuthenticating}
      />
    </View>
  );
}

function OtpMode({
  phone,
  otp,
  isAuthenticating,
  error,
  onOtp,
  onSubmit,
  onBack,
}: {
  phone: string;
  otp: string;
  isAuthenticating: boolean;
  error: string | null;
  onOtp: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.modeWrap}>
      <View style={styles.modeHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={HIT_SLOP}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.modeTitle}>Enter code</Text>
        <View style={{ width: 20 }} />
      </View>
      <Text style={styles.modeSubtitle}>Enter the 6-digit code sent to {phone}.</Text>

      <Field
        label="Verification code"
        icon="keypad-outline"
        value={otp}
        onChangeText={onOtp}
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
      />

      {error && <ErrorBanner message={error} />}

      <PrimaryButton
        label="Verify & sign in"
        icon="checkmark-circle-outline"
        onPress={onSubmit}
        variant="accent"
        loading={isAuthenticating}
      />
    </View>
  );
}

/* ----------------------------- Shared bits ----------------------------- */

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  maxLength,
  rightAccessory,
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  rightAccessory?: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInputRow}>
        <Ionicons name={icon as any} size={18} color={COLORS.textTertiary} style={styles.fieldIcon} />
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          autoCorrect={false}
          maxLength={maxLength}
        />
        {rightAccessory}
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  icon,
  onPress,
  variant,
  loading = false,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  variant: 'accent' | 'solid' | 'ghost';
  loading?: boolean;
}) {
  const baseStyle =
    variant === 'solid'
      ? styles.btnSolid
      : variant === 'accent'
      ? styles.btnAccent
      : styles.btnGhost;
  const textStyle =
    variant === 'solid'
      ? styles.btnSolidText
      : variant === 'accent'
      ? styles.btnAccentText
      : styles.btnGhostText;
  const iconColor =
    variant === 'solid' ? COLORS.textInverse : variant === 'accent' ? COLORS.textInverse : COLORS.accent;

  return (
    <TouchableOpacity style={[styles.btnBase, baseStyle]} onPress={onPress} activeOpacity={0.82} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Ionicons name={icon as any} size={18} color={iconColor} />
      )}
      <Text style={[styles.btnText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner}>
      <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

/** Official Google "G" logo mark — multi-color, per brand guidelines. */
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: size, height: size }}>
        <View style={{ width: size * 0.5, height: size * 0.5, backgroundColor: '#4285F4', borderTopLeftRadius: size * 0.12 }} />
        <View style={{ width: size * 0.5, height: size * 0.5, backgroundColor: '#EA4335', borderTopRightRadius: size * 0.12 }} />
        <View style={{ width: size * 0.5, height: size * 0.5, backgroundColor: '#FBBC05', borderBottomLeftRadius: size * 0.12 }} />
        <View style={{ width: size * 0.5, height: size * 0.5, backgroundColor: '#34A853', borderBottomRightRadius: size * 0.12 }} />
      </View>
    </View>
  );
}

function GoogleButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.btnBase, styles.googleBtn]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading ? <ActivityIndicator size="small" color={COLORS.textPrimary} /> : <GoogleLogo size={18} />}
      <Text style={styles.googleBtnText}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

/* ----------------------------- Styles ----------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: Math.max(height * 0.04, 24),
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: SPACING.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoWrap: { marginBottom: SPACING.sm, position: 'relative', alignItems: 'center' },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoGlow: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    opacity: 0.1,
    transform: [{ scale: 1.3 }],
    zIndex: -1,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  brandSub: {
    fontSize: 12,
    color: COLORS.accentLight,
    fontWeight: '600',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,217,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.20)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.accentLight,
    fontWeight: '600',
  },

  // Card
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: SPACING.md,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cardInner: {
    padding: SPACING.lg,
    gap: SPACING.md,
    position: 'relative',
    zIndex: 1,
  },

  // Mode
  modeWrap: { gap: SPACING.sm },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  modeSubtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },

  // Field
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  fieldInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  fieldIcon: { marginRight: SPACING.sm },
  fieldInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    padding: 0,
  },
  fieldRight: { padding: SPACING.xs },

  // Role chips
  roleRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  roleChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentDark,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleChipTextActive: {
    color: COLORS.textInverse,
  },

  // Biometric toggle
  biometricToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  biometricToggleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Forgot
  forgotBtn: { alignSelf: 'flex-end', paddingVertical: 2 },
  forgotText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.errorLight,
    fontWeight: '500',
  },

  // Buttons
  btnBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 10,
    borderWidth: 1,
  },
  btnSolid: {
    backgroundColor: COLORS.white,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnSolidText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  btnAccent: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentDark,
  },
  btnAccentText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  btnGhost: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: COLORS.glassBorder,
  },
  btnGhostText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  btnText: {},

  // Google OAuth button
  googleBtn: {
    backgroundColor: COLORS.white,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
  },

  // Footer
  footer: { alignItems: 'center', marginTop: SPACING.sm },
  footerText: {
    fontSize: 10,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 14,
  },

  // Legal links (below OAuth buttons)
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  legalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  legalLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  legalLinkDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.glassBorderLight,
  },

});

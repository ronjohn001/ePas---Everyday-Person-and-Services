import { useAuth } from '@/hooks/auth-store';
import { router, Link } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS, ROLE_ACCENT } from '@/constants/colors';
import { FlashingTick } from '@/components/FlashingTick';
import {
  SUBSCRIPTIONS,
  formatNLe,
} from '@/data/mock';
import { ScreenBackground } from '@/components/ScreenBackground';
import {
  useLoyalty,
  useTransactions,
  useNotifications,
} from '@/hooks/use-data';
import { ROLE_LABELS } from '@/types';

export default function ProfileScreen() {
  const { user, logout, role, addPhone, removePhone, setPrimaryPhone, updateProfile } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddPhoneModal, setShowAddPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newPhoneLabel, setNewPhoneLabel] = useState('Additional');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const accent = role ? ROLE_ACCENT[role].color : COLORS.clientAccent;

  const { data: loyalty } = useLoyalty(user?.id);
  const { data: transactions = [] } = useTransactions(user?.id);
  const { data: notifications = [] } = useNotifications(user?.id);

  const activeSubscription = SUBSCRIPTIONS.find(s => s.isActive);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const loyaltyBalance = loyalty?.balance ?? 0;
  const loyaltyEarned = loyalty?.totalEarned ?? 0;
  const loyaltyRedeemed = loyalty?.totalRedeemed ?? 0;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { clearBiometricCredentials } = await import('@/lib/supabase');
            await clearBiometricCredentials();
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: 'gift-outline', label: 'Loyalty Points', value: `${loyaltyBalance} pts`, color: COLORS.clientAccent, route: '/loyalty' },
    { icon: 'ribbon-outline', label: 'Subscriptions', value: activeSubscription?.tier ?? 'None', color: COLORS.violet, route: '/subscriptions' },
    { icon: 'cash-outline', label: 'Transactions', value: `${transactions.length}`, color: COLORS.sky, route: '/transactions' },
    { icon: 'notifications-outline', label: 'Notifications', value: unreadNotifications > 0 ? `${unreadNotifications} new` : 'None', color: COLORS.amber, route: '/notifications' },
  ];

  const providerMenuItems = [
    { icon: 'briefcase-outline', label: 'Provider Profile', color: COLORS.sky, route: '/provider/onboarding' },
    { icon: 'stats-chart-outline', label: 'Earnings Dashboard', color: COLORS.accent, route: '/admin/revenue' },
  ];

  const adminMenuItems = [
    { icon: 'shield-checkmark-outline', label: 'Trader Approvals', color: COLORS.sky, route: '/admin/traders' },
    { icon: 'bar-chart-outline', label: 'Revenue Dashboard', color: COLORS.accent, route: '/admin/revenue' },
    { icon: 'grid-outline', label: 'Catalog Management', color: COLORS.amber, route: '/admin/catalog' },
    { icon: 'images-outline', label: 'Advert Management', color: COLORS.violet, route: '/admin/adverts' },
  ];

  return (
    <ScreenBackground variant="profile">
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero header — glass panel with gradient */}
          <View style={styles.heroWrap}>
            <LinearGradient
              colors={['rgba(0,217,163,0.12)', 'rgba(11,31,58,0.4)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={styles.heroBorder} />
            <View style={styles.heroContent}>
              {/* Profile */}
              <View style={styles.profileSection}>
                <View style={styles.avatarWrap}>
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={28} color={COLORS.accent} />
                  </View>
                  <View style={styles.avatarRing} />
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.rolePill}>
                  <Ionicons
                    name={role === 'ADMIN' ? 'shield' : role === 'PROVIDER' ? 'briefcase' : 'person'}
                    size={11}
                    color={COLORS.accent}
                  />
                  <Text style={styles.roleText}>{role ? ROLE_LABELS[role] : ''}</Text>
                </View>
              </View>

              {/* Loyalty card — glass */}
              <View style={styles.loyaltyCard}>
                <View style={styles.loyaltyLeft}>
                  <View style={styles.loyaltyIconWrap}>
                    <Ionicons name="gift" size={20} color={accent} />
                  </View>
                  <View>
                    <Text style={styles.loyaltyBalance}>{loyaltyBalance}</Text>
                    <Text style={styles.loyaltyLabel}>Loyalty Points</Text>
                  </View>
                </View>
                <View style={styles.loyaltyRight}>
                  <View style={styles.loyaltyStat}>
                    <Text style={styles.loyaltyStatValue}>{loyaltyEarned}</Text>
                    <Text style={styles.loyaltyStatLabel}>Earned</Text>
                  </View>
                  <View style={styles.loyaltyDivider} />
                  <View style={styles.loyaltyStat}>
                    <Text style={styles.loyaltyStatValue}>{loyaltyRedeemed}</Text>
                    <Text style={styles.loyaltyStatLabel}>Redeemed</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contact info — phones & address */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Contact</Text>

            {/* Phone numbers */}
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={styles.contactHeaderLeft}>
                  <Ionicons name="call-outline" size={16} color={accent} />
                  <Text style={styles.contactHeaderTitle}>Phone Numbers</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddPhoneModal(true)} hitSlop={12}>
                  <Ionicons name="add-circle-outline" size={20} color={accent} />
                </TouchableOpacity>
              </View>
              {(user?.phones ?? []).map((p) => (
                <View key={p.id} style={styles.phoneItem}>
                  <View style={styles.phoneLeft}>
                    <Ionicons name="call" size={14} color={COLORS.textSecondary} />
                    <View>
                      <Text style={styles.phoneText}>{p.phone}</Text>
                      <Text style={styles.phoneLabel}>{p.label}</Text>
                    </View>
                  </View>
                  <View style={styles.phoneRight}>
                    {p.isPrimary ? (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => setPrimaryPhone(p.id)}
                          hitSlop={12}
                          style={styles.miniBtn}
                        >
                          <Ionicons name="star-outline" size={16} color={COLORS.amber} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert(
                              'Remove Number',
                              `Remove ${p.phone}?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Remove',
                                  style: 'destructive',
                                  onPress: () => removePhone(p.id),
                                },
                              ],
                            )
                          }
                          hitSlop={12}
                          style={styles.miniBtn}
                        >
                          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
              {(user?.phones ?? []).length === 0 && (
                <Text style={styles.emptyText}>No phone numbers added yet.</Text>
              )}
            </View>

            {/* Address */}
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={styles.contactHeaderLeft}>
                  <Ionicons name="location-outline" size={16} color={accent} />
                  <Text style={styles.contactHeaderTitle}>Address</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setAddressInput(user?.address ?? '');
                    setIsEditingAddress(true);
                  }}
                  hitSlop={12}
                >
                  <Ionicons name="create-outline" size={18} color={accent} />
                </TouchableOpacity>
              </View>
              {user?.address ? (
                <Text style={styles.addressText}>{user.address}</Text>
              ) : (
                <Text style={styles.emptyText}>No address set (optional).</Text>
              )}
            </View>
          </View>

          {/* Menu items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, i) => (
              <Link key={i} href={item.route as any} asChild>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}18`, borderColor: `${item.color}28` }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuValue}>{item.value}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </Link>
            ))}
          </View>

          {/* Trader menu */}
          {role === 'PROVIDER' && (
            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Trader Tools</Text>
              {providerMenuItems.map((item, i) => (
                <Link key={i} href={item.route as any} asChild>
                  <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}18`, borderColor: `${item.color}28` }]}>
                      <Ionicons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}

          {/* Admin menu */}
          {role === 'ADMIN' && (
            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Admin Console</Text>
              {adminMenuItems.map((item, i) => (
                <Link key={i} href={item.route as any} asChild>
                  <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}18`, borderColor: `${item.color}28` }]}>
                      <Ionicons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}

          {/* Recent transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <Link href="/transactions" asChild>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={styles.txnCard}>
              {transactions.slice(0, 3).map((txn, i) => (
                <View key={txn.id}>
                  <View style={styles.txnItem}>
                    <View style={styles.txnIcon}>
                      <Ionicons name="cash-outline" size={16} color={COLORS.accent} />
                    </View>
                    <View style={styles.txnInfo}>
                      <Text style={styles.txnDesc} numberOfLines={1}>{txn.description}</Text>
                      <Text style={styles.txnDate}>
                        {new Date(txn.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {txn.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Africell Money'}
                      </Text>
                    </View>
                    <Text style={styles.txnAmount}>{formatNLe(txn.amount)}</Text>
                  </View>
                  {i < 2 && <View style={styles.txnDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Suggest provider */}
          <View style={styles.section}>
            <Link href="/provider-suggestion" asChild>
              <TouchableOpacity style={styles.suggestCard} activeOpacity={0.8}>
                <View style={styles.suggestIcon}>
                  <Ionicons name="person-add-outline" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.suggestText}>
                  <Text style={styles.suggestTitle}>Suggest a Provider</Text>
                  <Text style={styles.suggestSub}>Know someone great? Recommend them</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </Link>
          </View>

          {/* Account settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.settingLabel}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.settingLabel}>Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                <Ionicons name="help-circle-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.settingLabel}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout */}
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.82}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.versionRow}>
            <Text style={styles.versionText}>ePaS</Text>
            <FlashingTick size={14} />
            <Text style={styles.versionText}> v1.0.0 — Sierra Leone</Text>
          </View>

          <View style={{ height: SPACING.xxl + 60 }} />
        </ScrollView>

        {/* Add Phone Modal */}
        <Modal visible={showAddPhoneModal} transparent animationType="fade" onRequestClose={() => setShowAddPhoneModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder="+232 7X XXX XXX"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
              <TextInput
                style={styles.modalInput}
                value={newPhoneLabel}
                onChangeText={setNewPhoneLabel}
                placeholder="Label (e.g. Work, Home)"
                placeholderTextColor={COLORS.textTertiary}
                autoCorrect={false}
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => { setShowAddPhoneModal(false); setNewPhone(''); setNewPhoneLabel('Additional'); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSave]}
                  onPress={async () => {
                    if (!newPhone.trim()) { Alert.alert('Required', 'Please enter a phone number.'); return; }
                    setIsSavingPhone(true);
                    const result = await addPhone(newPhone.trim(), newPhoneLabel.trim() || 'Additional');
                    setIsSavingPhone(false);
                    if (result.ok) {
                      setShowAddPhoneModal(false);
                      setNewPhone('');
                      setNewPhoneLabel('Additional');
                    } else {
                      Alert.alert('Error', result.error ?? 'Could not add phone number.');
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={isSavingPhone}
                >
                  {isSavingPhone ? (
                    <ActivityIndicator size="small" color={COLORS.textInverse} />
                  ) : (
                    <Text style={styles.modalBtnSaveText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Address Modal */}
        <Modal visible={isEditingAddress} transparent animationType="fade" onRequestClose={() => setIsEditingAddress(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Address</Text>
              <Text style={styles.modalSub}>Optional — used for service bookings.</Text>
              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                value={addressInput}
                onChangeText={setAddressInput}
                placeholder="Street, City, Region"
                placeholderTextColor={COLORS.textTertiary}
                multiline
                autoCorrect={false}
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setIsEditingAddress(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSave]}
                  onPress={async () => {
                    setIsSavingAddress(true);
                    const result = await updateProfile({ address: addressInput.trim() || undefined });
                    setIsSavingAddress(false);
                    if (result.ok) {
                      setIsEditingAddress(false);
                    } else {
                      Alert.alert('Error', result.error ?? 'Could not update address.');
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={isSavingAddress}
                >
                  {isSavingAddress ? (
                    <ActivityIndicator size="small" color={COLORS.textInverse} />
                  ) : (
                    <Text style={styles.modalBtnSaveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Hero
  heroWrap: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  heroContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    position: 'relative',
    zIndex: 1,
  },
  profileSection: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0,217,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 42,
    borderWidth: 1.5,
    borderColor: 'rgba(0,217,163,0.15)',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,217,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.20)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.xs,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentLight,
    letterSpacing: 0.5,
  },
  // Loyalty card
  loyaltyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  loyaltyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loyaltyIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,217,163,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyBalance: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  loyaltyLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loyaltyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loyaltyStat: {
    alignItems: 'center',
  },
  loyaltyStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  loyaltyStatLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  loyaltyDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.divider,
  },
  // Menu
  menuSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  menuValue: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  // Sections
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  // Transactions
  txnCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  txnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  txnIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,217,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnInfo: { flex: 1 },
  txnDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  txnDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
  },
  txnDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  // Suggest
  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  suggestIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,217,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestText: { flex: 1 },
  suggestTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  suggestSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Settings
  settingsCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  // Logout
  logoutSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: SPACING.lg,
  },

  // Contact card
  contactCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: SPACING.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  contactHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  phoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  phoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  phoneLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  phoneRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  miniBtn: {
    padding: 4,
  },
  primaryBadge: {
    backgroundColor: 'rgba(0,255,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,163,0.20)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentLight,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3,5,15,0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorderLight,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: -SPACING.xs,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    height: 48,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalBtnSave: {
    backgroundColor: COLORS.accent,
  },
  modalBtnSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});

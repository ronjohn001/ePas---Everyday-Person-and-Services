import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { GlassCard } from '@/components/GlassCard';
import { TextField, NumberField, ColorPicker, IconPicker } from '@/components/AdminFormFields';
import { useAds } from '@/hooks/ad-store';
import type { Advertisement } from '@/types';
import { LogoutButton } from '@/components/LogoutButton';

type ModalMode = 'edit' | 'add' | null;

const BACKGROUND_TYPES: Advertisement['backgroundType'][] = ['gradient', 'image', 'video'];
const TEXT_POSITIONS: Advertisement['textPosition'][] = ['top', 'center', 'bottom'];

export default function AdminAdvertsScreen() {
  const { adverts, activeAdverts, updateAdvert, addAdvert, deleteAdvert, resetToSeed } = useAds();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // ─── Form state ──────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [icon, setIcon] = useState('gift');
  const [gradient1, setGradient1] = useState('#1A3C6E');
  const [gradient2, setGradient2] = useState('#2A5494');
  const [backgroundType, setBackgroundType] = useState<Advertisement['backgroundType']>('image');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundVideo, setBackgroundVideo] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [textPosition, setTextPosition] = useState<Advertisement['textPosition']>('bottom');
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [linkRoute, setLinkRoute] = useState('');

  const openEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setSubtitle(ad.subtitle);
    setCtaText(ad.ctaText);
    setIcon(ad.icon);
    setGradient1(ad.gradient[0]);
    setGradient2(ad.gradient[1]);
    setBackgroundType(ad.backgroundType);
    setBackgroundImage(ad.backgroundImage ?? '');
    setBackgroundVideo(ad.backgroundVideo ?? '');
    setOverlayOpacity(ad.overlayOpacity);
    setTextPosition(ad.textPosition);
    setSortOrder(ad.sortOrder);
    setActive(ad.active);
    setLinkRoute(ad.linkRoute ?? '');
    setModalMode('edit');
  };

  const openAdd = () => {
    setEditingAd(null);
    setTitle('');
    setSubtitle('');
    setCtaText('Learn More');
    setIcon('gift');
    setGradient1('#1A3C6E');
    setGradient2('#2A5494');
    setBackgroundType('image');
    setBackgroundImage('');
    setBackgroundVideo('');
    setOverlayOpacity(0.5);
    setTextPosition('bottom');
    setSortOrder(adverts.length + 1);
    setActive(true);
    setLinkRoute('');
    setModalMode('add');
  };

  const save = () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Advert title is required.');
      return;
    }
    const payload: Partial<Advertisement> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      ctaText: ctaText.trim() || 'Learn More',
      icon,
      gradient: [gradient1, gradient2] as [string, string],
      backgroundType,
      backgroundImage: backgroundType === 'image' ? backgroundImage.trim() || undefined : undefined,
      backgroundVideo: backgroundType === 'video' ? backgroundVideo.trim() || undefined : undefined,
      overlayOpacity,
      textPosition,
      sortOrder,
      active,
      linkRoute: linkRoute.trim() || undefined,
    };
    if (modalMode === 'edit' && editingAd) {
      updateAdvert(editingAd.id, payload);
    } else if (modalMode === 'add') {
      addAdvert({
        id: `ad${Date.now()}`,
        ...payload,
      } as Advertisement);
    }
    setModalMode(null);
  };

  const handleDelete = (ad: Advertisement) => {
    Alert.alert(
      'Delete Advert',
      `Are you sure you want to delete "${ad.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAdvert(ad.id),
        },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Adverts',
      'Reset all advertisements to the original seed data? This will discard all your changes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetToSeed(),
        },
      ],
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Advert Management</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Ionicons name="add" size={24} color={COLORS.accent} />
            </TouchableOpacity>
            <LogoutButton color={COLORS.textPrimary} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Summary */}
          <View style={styles.summaryRow}>
            <GlassCard style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{adverts.length}</Text>
              <Text style={styles.summaryLabel}>Total Ads</Text>
            </GlassCard>
            <GlassCard style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{activeAdverts.length}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </GlassCard>
            <GlassCard style={styles.summaryCard}>
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <Ionicons name="refresh-outline" size={18} color={COLORS.coral} />
                <Text style={styles.summaryValueSmall}>{adverts.length}</Text>
                <Text style={styles.summaryLabel}>Reset</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Ad list */}
          <View style={styles.list}>
            {adverts.map((ad) => (
              <GlassCard key={ad.id} style={styles.adCard}>
                <View style={styles.adRow}>
                  <View style={styles.adMediaPreview}>
                    {ad.backgroundType === 'image' && ad.backgroundImage ? (
                      <Image source={{ uri: ad.backgroundImage }} style={styles.adMedia} contentFit="cover" />
                    ) : ad.backgroundType === 'video' ? (
                      <View style={[styles.adMedia, styles.videoPlaceholder]}>
                        <Ionicons name="videocam" size={22} color={COLORS.accent} />
                      </View>
                    ) : (
                      <View style={[styles.adMedia, { backgroundColor: ad.gradient[0] }]} />
                    )}
                    <View style={styles.adTypeBadge}>
                      <Text style={styles.adTypeText}>{ad.backgroundType}</Text>
                    </View>
                    {!ad.active && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveText}>Inactive</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.adInfo}>
                    <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
                    <Text style={styles.adSubtitle} numberOfLines={2}>{ad.subtitle}</Text>
                    <View style={styles.adMeta}>
                      <Text style={styles.adMetaText}>Slot {ad.slot} · Order {ad.sortOrder}</Text>
                      <Text style={styles.adMetaText}>{ad.textPosition} · {Math.round(ad.overlayOpacity * 100)}% overlay</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.adActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(ad)}>
                    <Ionicons name="create-outline" size={16} color={COLORS.sky} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(ad)}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.coral} />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>

          <TouchableOpacity style={styles.addCardBtn} onPress={openAdd}>
            <Ionicons name="add" size={20} color={COLORS.accent} />
            <Text style={styles.addCardBtnText}>Add New Advert</Text>
          </TouchableOpacity>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>

        {/* Modal */}
        <Modal
          visible={modalMode !== null}
          animationType="slide"
          transparent
          onRequestClose={() => setModalMode(null)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScreenBackground variant="default" style={styles.modalWrapper}>
              <SafeAreaView style={styles.modalContainer} edges={['top']}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalMode(null)}>
                    <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{modalMode === 'edit' ? 'Edit Advert' : 'New Advert'}</Text>
                  <TouchableOpacity style={styles.modalSaveBtn} onPress={save}>
                    <Text style={styles.modalSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  <TextField label="Title" value={title} onChangeText={setTitle} placeholder="Promo headline" />
                  <TextField label="Subtitle" value={subtitle} onChangeText={setSubtitle} placeholder="Short description" />
                  <TextField label="CTA Text" value={ctaText} onChangeText={setCtaText} placeholder="Book Now" />
                  <TextField label="Link Route (optional)" value={linkRoute} onChangeText={setLinkRoute} placeholder="e.g. /category/cat1" />

                  {/* Background type */}
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>BACKGROUND TYPE</Text>
                    <View style={styles.typeRow}>
                      {BACKGROUND_TYPES.map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.typeChip, backgroundType === t && styles.typeChipActive]}
                          onPress={() => setBackgroundType(t)}
                        >
                          <Text style={[styles.typeChipText, backgroundType === t && styles.typeChipTextActive]}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {backgroundType === 'image' && (
                    <TextField
                      label="Background Image URL"
                      value={backgroundImage}
                      onChangeText={setBackgroundImage}
                      placeholder="https://..."
                    />
                  )}

                  {backgroundType === 'video' && (
                    <TextField
                      label="Background Video URL"
                      value={backgroundVideo}
                      onChangeText={setBackgroundVideo}
                      placeholder="https://.../video.mp4"
                    />
                  )}

                  {backgroundType === 'gradient' && (
                    <View style={styles.formRow}>
                      <ColorPicker label="Gradient Start" value={gradient1} onChangeColor={setGradient1} style={styles.flex1} />
                      <ColorPicker label="Gradient End" value={gradient2} onChangeColor={setGradient2} style={styles.flex1} />
                    </View>
                  )}

                  <IconPicker label="Icon" value={icon} onChangeIcon={setIcon} />

                  {/* Text position */}
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>TEXT POSITION</Text>
                    <View style={styles.typeRow}>
                      {TEXT_POSITIONS.map((p) => (
                        <TouchableOpacity
                          key={p}
                          style={[styles.typeChip, textPosition === p && styles.typeChipActive]}
                          onPress={() => setTextPosition(p)}
                        >
                          <Text style={[styles.typeChipText, textPosition === p && styles.typeChipTextActive]}>{p}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={styles.flex1}>
                      <Text style={styles.fieldLabel}>OVERLAY OPACITY</Text>
                      <TextInput
                        style={styles.numberInput}
                        value={String(Math.round(overlayOpacity * 100))}
                        onChangeText={(v) => {
                          const n = parseInt(v, 10);
                          if (!isNaN(n)) setOverlayOpacity(Math.max(0, Math.min(100, n)) / 100);
                        }}
                        keyboardType="numeric"
                        placeholder="50"
                        placeholderTextColor={COLORS.textTertiary}
                      />
                    </View>
                    <NumberField label="Sort Order" value={sortOrder} onChangeNumber={setSortOrder} style={styles.flex1} />
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.fieldLabel}>ACTIVE</Text>
                    <Switch value={active} onValueChange={setActive} trackColor={{ false: COLORS.glassBorder, true: COLORS.accent }} thumbColor={COLORS.white} />
                  </View>

                  {/* Preview */}
                  <View style={styles.previewSection}>
                    <Text style={styles.previewLabel}>PREVIEW</Text>
                    <AdPreviewCard
                      ad={{
                        id: 'preview',
                        title: title || 'Advert Title',
                        subtitle: subtitle || 'Advert subtitle',
                        ctaText: ctaText || 'Learn More',
                        gradient: [gradient1, gradient2] as [string, string],
                        icon,
                        slot: 1,
                        sortOrder,
                        active,
                        backgroundType,
                        backgroundImage: backgroundImage.trim() || undefined,
                        backgroundVideo: backgroundVideo.trim() || undefined,
                        overlayOpacity,
                        textPosition,
                        linkRoute: linkRoute.trim() || undefined,
                      }}
                    />
                  </View>

                  <View style={{ height: SPACING.xxl }} />
                </ScrollView>
              </SafeAreaView>
            </ScreenBackground>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function AdPreviewCard({ ad }: { ad: Advertisement }) {
  return (
    <View style={styles.previewCard}>
      {ad.backgroundType === 'image' && ad.backgroundImage ? (
        <Image source={{ uri: ad.backgroundImage }} style={styles.previewBg} contentFit="cover" />
      ) : ad.backgroundType === 'video' ? (
        <View style={[styles.previewBg, { backgroundColor: COLORS.primary }]} />
      ) : (
        <View style={[styles.previewBg, { backgroundColor: ad.gradient[0] }]} />
      )}
      <View style={[styles.previewOverlay, { opacity: ad.overlayOpacity }]} />
      <View style={[styles.previewContent, ad.textPosition === 'top' ? { justifyContent: 'flex-start' } : ad.textPosition === 'center' ? { justifyContent: 'center' } : { justifyContent: 'flex-end' }]}>
        <View style={styles.previewTextWrap}>
          <Text style={styles.previewTitle}>{ad.title}</Text>
          <Text style={styles.previewSubtitle}>{ad.subtitle}</Text>
        </View>
        <View style={styles.previewCta}>
          <Text style={styles.previewCtaText}>{ad.ctaText}</Text>
          <Ionicons name="arrow-forward" size={13} color={COLORS.white} />
        </View>
      </View>
      <View style={styles.previewIcon}>
        <Ionicons name={ad.icon as any} size={44} color="rgba(255,255,255,0.25)" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,217,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.25)',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryValueSmall: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.coral,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  resetBtn: {
    alignItems: 'center',
  },
  list: {
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  adCard: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  adRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  adMediaPreview: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  adMedia: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  adTypeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adTypeText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inactiveBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255,107,107,0.8)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inactiveText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: '700',
  },
  adInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  adTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  adSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  adMeta: {
    marginTop: SPACING.xs,
    gap: 2,
  },
  adMetaText: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  adActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flex: 1,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.sky,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flex: 1,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.coral,
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderStyle: 'dashed',
  },
  addCardBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
  // Modal
  modalOverlay: { flex: 1 },
  modalWrapper: { flex: 1 },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSaveBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(0,217,163,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.30)',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  modalScroll: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  // Form
  field: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flex1: { flex: 1 },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  typeChipActive: {
    backgroundColor: 'rgba(0,217,163,0.15)',
    borderColor: COLORS.accent,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  typeChipTextActive: {
    color: COLORS.accent,
  },
  numberInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Preview
  previewSection: {
    gap: SPACING.xs,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCard: {
    height: 160,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  previewBg: {
    ...StyleSheet.absoluteFillObject,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewContent: {
    ...StyleSheet.absoluteFillObject,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  previewTextWrap: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  previewSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  previewCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  previewCtaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  previewIcon: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    zIndex: 0,
  },
});

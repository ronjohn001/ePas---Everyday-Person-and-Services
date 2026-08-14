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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { GlassCard } from '@/components/GlassCard';
import { TextField, NumberField, ColorPicker, IconPicker } from '@/components/AdminFormFields';
import { useCatalog } from '@/hooks/catalog-store';
import { formatNLe } from '@/data/mock';
import type { ServiceCategory, ServiceJob } from '@/types';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';

type ModalMode = 'category-edit' | 'category-add' | 'job-edit' | 'job-add' | null;

export default function AdminCatalogScreen() {
  const {
    categories,
    jobs,
    updateCategory,
    addCategory,
    deleteCategory,
    updateJob,
    addJob,
    deleteJob,
    resetToSeed,
  } = useCatalog();

  const [expandedId, setExpandedId] = useState<string | null>(categories[0]?.id ?? null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editingJob, setEditingJob] = useState<ServiceJob | null>(null);
  const [jobParentCategoryId, setJobParentCategoryId] = useState<string>('');

  // ─── Category form state ─────────────────────────────────────
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('home');
  const [catColor, setCatColor] = useState('#00D9A3');
  const [catDescription, setCatDescription] = useState('');
  const [catSortOrder, setCatSortOrder] = useState(1);

  // ─── Job form state ──────────────────────────────────────────
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobIcon, setJobIcon] = useState('build');
  const [jobColor, setJobColor] = useState('#00D9A3');
  const [jobBasePrice, setJobBasePrice] = useState(100);
  const [jobAssessmentFee, setJobAssessmentFee] = useState(0);
  const [jobDuration, setJobDuration] = useState('1-2 hours');
  const [jobCategoryId, setJobCategoryId] = useState('');

  // ─── Open modals ─────────────────────────────────────────────

  const openCategoryEdit = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setCatDescription(cat.description);
    setCatSortOrder(cat.sortOrder);
    setModalMode('category-edit');
  };

  const openCategoryAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setCatIcon('home');
    setCatColor('#00D9A3');
    setCatDescription('');
    setCatSortOrder(categories.length + 1);
    setModalMode('category-add');
  };

  const openJobEdit = (job: ServiceJob) => {
    setEditingJob(job);
    setJobName(job.name);
    setJobDescription(job.description);
    setJobIcon(job.icon);
    setJobColor(job.color);
    setJobBasePrice(job.basePrice);
    setJobAssessmentFee(job.assessmentFee);
    setJobDuration(job.estimatedDuration);
    setJobCategoryId(job.categoryId);
    setModalMode('job-edit');
  };

  const openJobAdd = (categoryId: string) => {
    setEditingJob(null);
    setJobName('');
    setJobDescription('');
    setJobIcon('build');
    setJobColor(categories.find((c) => c.id === categoryId)?.color ?? '#00D9A3');
    setJobBasePrice(100);
    setJobAssessmentFee(0);
    setJobDuration('1-2 hours');
    setJobCategoryId(categoryId);
    setJobParentCategoryId(categoryId);
    setModalMode('job-add');
  };

  // ─── Save handlers ───────────────────────────────────────────

  const saveCategory = () => {
    if (!catName.trim()) {
      Alert.alert('Validation', 'Category name is required.');
      return;
    }
    if (modalMode === 'category-edit' && editingCategory) {
      const serviceCount = jobs.filter((j) => j.categoryId === editingCategory.id).length;
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        icon: catIcon,
        color: catColor,
        description: catDescription.trim(),
        sortOrder: catSortOrder,
        serviceCount,
      });
    } else if (modalMode === 'category-add') {
      const id = `cat${Date.now()}`;
      addCategory({
        id,
        name: catName.trim(),
        icon: catIcon,
        color: catColor,
        description: catDescription.trim(),
        sortOrder: catSortOrder,
        serviceCount: 0,
      });
      setExpandedId(id);
    }
    setModalMode(null);
  };

  const saveJob = () => {
    if (!jobName.trim()) {
      Alert.alert('Validation', 'Service name is required.');
      return;
    }
    if (modalMode === 'job-edit' && editingJob) {
      updateJob(editingJob.id, {
        name: jobName.trim(),
        description: jobDescription.trim(),
        icon: jobIcon,
        color: jobColor,
        basePrice: jobBasePrice,
        assessmentFee: jobAssessmentFee,
        estimatedDuration: jobDuration.trim(),
        categoryId: jobCategoryId,
      });
    } else if (modalMode === 'job-add') {
      const id = `job${Date.now()}`;
      addJob({
        id,
        categoryId: jobCategoryId,
        name: jobName.trim(),
        description: jobDescription.trim(),
        icon: jobIcon,
        color: jobColor,
        basePrice: jobBasePrice,
        assessmentFee: jobAssessmentFee,
        estimatedDuration: jobDuration.trim(),
        providerIds: [],
      });
    }
    setModalMode(null);
  };

  const handleDeleteCategory = (cat: ServiceCategory) => {
    const jobCount = jobs.filter((j) => j.categoryId === cat.id).length;
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"?${jobCount > 0 ? `\n\nThis will also remove ${jobCount} service${jobCount > 1 ? 's' : ''} in this category.` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(cat.id),
        },
      ],
    );
  };

  const handleDeleteJob = (job: ServiceJob) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${job.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteJob(job.id),
        },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Catalog',
      'Reset all categories and services to the original seed data? This will discard all your changes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToSeed();
            setExpandedId(null);
          },
        },
      ],
    );
  };

  const modalTitle = modalMode === 'category-edit' ? 'Edit Category'
    : modalMode === 'category-add' ? 'New Category'
    : modalMode === 'job-edit' ? 'Edit Service'
    : modalMode === 'job-add' ? 'New Service'
    : '';

  const isCategoryModal = modalMode === 'category-edit' || modalMode === 'category-add';

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton style={styles.backBtn} />
          <Text style={styles.headerTitle}>Catalog Management</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addBtn} onPress={openCategoryAdd}>
              <Ionicons name="add" size={24} color={COLORS.accent} />
            </TouchableOpacity>
            <LogoutButton color={COLORS.textPrimary} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <GlassCard style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{categories.length}</Text>
              <Text style={styles.summaryLabel}>Categories</Text>
            </GlassCard>
            <GlassCard style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{jobs.length}</Text>
              <Text style={styles.summaryLabel}>Services</Text>
            </GlassCard>
            <GlassCard style={styles.summaryCard}>
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <Ionicons name="refresh-outline" size={18} color={COLORS.coral} />
                <Text style={styles.summaryValueSmall}>{categories.length + jobs.length}</Text>
                <Text style={styles.summaryLabel}>Reset</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Category list */}
          <View style={styles.categoryList}>
            {categories.map((cat) => {
              const catJobs = jobs.filter((j) => j.categoryId === cat.id);
              const isExpanded = expandedId === cat.id;
              return (
                <GlassCard key={cat.id} style={styles.categoryCard}>
                  {/* Category header row */}
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => setExpandedId(isExpanded ? null : cat.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                      <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryDesc}>
                        {catJobs.length} services · {cat.description}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.textTertiary}
                    />
                  </TouchableOpacity>

                  {/* Expanded body — service jobs */}
                  {isExpanded && (
                    <View style={styles.categoryBody}>
                      {catJobs.length > 0 ? (
                        catJobs.map((job) => (
                          <View key={job.id} style={styles.jobRow}>
                            <View style={[styles.jobIcon, { backgroundColor: `${job.color}20` }]}>
                              <Ionicons name={job.icon as any} size={16} color={job.color} />
                            </View>
                            <View style={styles.jobInfo}>
                              <Text style={styles.jobName}>{job.name}</Text>
                              <Text style={styles.jobMeta}>
                                {job.estimatedDuration} · Fee: {formatNLe(job.assessmentFee)}
                              </Text>
                            </View>
                            <Text style={styles.jobPrice}>{formatNLe(job.basePrice)}</Text>
                            <TouchableOpacity
                              style={styles.iconBtn}
                              onPress={() => openJobEdit(job)}
                            >
                              <Ionicons name="create-outline" size={18} color={COLORS.sky} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.iconBtn}
                              onPress={() => handleDeleteJob(job)}
                            >
                              <Ionicons name="trash-outline" size={18} color={COLORS.coral} />
                            </TouchableOpacity>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyJobs}>No services in this category yet</Text>
                      )}

                      {/* Add service + edit/delete category */}
                      <View style={styles.categoryActions}>
                        <TouchableOpacity
                          style={styles.addJobBtn}
                          onPress={() => openJobAdd(cat.id)}
                        >
                          <Ionicons name="add-circle-outline" size={18} color={COLORS.accent} />
                          <Text style={styles.addJobBtnText}>Add Service</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.editCatBtn}
                          onPress={() => openCategoryEdit(cat)}
                        >
                          <Ionicons name="create-outline" size={16} color={COLORS.sky} />
                          <Text style={styles.editCatBtnText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteCatBtn}
                          onPress={() => handleDeleteCategory(cat)}
                        >
                          <Ionicons name="trash-outline" size={16} color={COLORS.coral} />
                          <Text style={styles.deleteCatBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </GlassCard>
              );
            })}
          </View>

          {/* Add category button */}
          <TouchableOpacity style={styles.addCategoryBtn} onPress={openCategoryAdd}>
            <Ionicons name="add" size={20} color={COLORS.accent} />
            <Text style={styles.addCategoryBtnText}>Add New Category</Text>
          </TouchableOpacity>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>

        {/* ─── Edit/Add Modal ────────────────────────────────── */}
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
                {/* Modal header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setModalMode(null)}
                  >
                    <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{modalTitle}</Text>
                  <TouchableOpacity
                    style={styles.modalSaveBtn}
                    onPress={isCategoryModal ? saveCategory : saveJob}
                  >
                    <Text style={styles.modalSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {isCategoryModal ? (
                    <CategoryForm
                      name={catName}
                      setName={setCatName}
                      icon={catIcon}
                      setIcon={setCatIcon}
                      color={catColor}
                      setColor={setCatColor}
                      description={catDescription}
                      setDescription={setCatDescription}
                      sortOrder={catSortOrder}
                      setSortOrder={setCatSortOrder}
                    />
                  ) : (
                    <JobForm
                      name={jobName}
                      setName={setJobName}
                      description={jobDescription}
                      setDescription={setJobDescription}
                      icon={jobIcon}
                      setIcon={setJobIcon}
                      color={jobColor}
                      setColor={setJobColor}
                      basePrice={jobBasePrice}
                      setBasePrice={setJobBasePrice}
                      assessmentFee={jobAssessmentFee}
                      setAssessmentFee={setJobAssessmentFee}
                      duration={jobDuration}
                      setDuration={setJobDuration}
                      categoryId={jobCategoryId}
                      setCategoryId={setJobCategoryId}
                      categories={categories}
                    />
                  )}
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

// ─── Category Form ─────────────────────────────────────────────

interface CategoryFormProps {
  name: string;
  setName: (v: string) => void;
  icon: string;
  setIcon: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  sortOrder: number;
  setSortOrder: (v: number) => void;
}

function CategoryForm(props: CategoryFormProps) {
  return (
    <View style={styles.formContainer}>
      <TextField
        label="Category Name"
        value={props.name}
        onChangeText={props.setName}
        placeholder="e.g. House Care"
      />
      <TextField
        label="Description"
        value={props.description}
        onChangeText={props.setDescription}
        placeholder="Short description of the category"
        multiline
        numberOfLines={2}
      />
      <NumberField
        label="Sort Order"
        value={props.sortOrder}
        onChangeNumber={props.setSortOrder}
      />
      <ColorPicker
        label="Color"
        value={props.color}
        onChangeColor={props.setColor}
      />
      <IconPicker
        label="Icon"
        value={props.icon}
        onChangeIcon={props.setIcon}
      />
      {/* Live preview */}
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>PREVIEW</Text>
        <GlassCard style={styles.previewCard}>
          <View style={styles.previewRow}>
            <View style={[styles.previewIcon, { backgroundColor: `${props.color}20` }]}>
              <Ionicons name={props.icon as any} size={24} color={props.color} />
            </View>
            <View>
              <Text style={styles.previewName}>{props.name || 'Category Name'}</Text>
              <Text style={styles.previewDesc}>
                {props.description || 'Category description'}
              </Text>
            </View>
          </View>
        </GlassCard>
      </View>
    </View>
  );
}

// ─── Job Form ──────────────────────────────────────────────────

interface JobFormProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  icon: string;
  setIcon: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  basePrice: number;
  setBasePrice: (v: number) => void;
  assessmentFee: number;
  setAssessmentFee: (v: number) => void;
  duration: string;
  setDuration: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  categories: ServiceCategory[];
}

function JobForm(props: JobFormProps) {
  return (
    <View style={styles.formContainer}>
      {/* Category selector */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroller}>
          {props.categories.map((cat) => {
            const selected = props.categoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selected && { backgroundColor: `${cat.color}25`, borderColor: cat.color },
                ]}
                onPress={() => {
                  props.setCategoryId(cat.id);
                  if (!selected) props.setColor(cat.color);
                }}
              >
                <Ionicons name={cat.icon as any} size={14} color={cat.color} />
                <Text style={[styles.categoryChipText, selected && { color: cat.color }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TextField
        label="Service Name"
        value={props.name}
        onChangeText={props.setName}
        placeholder="e.g. Housekeeper"
      />
      <TextField
        label="Description"
        value={props.description}
        onChangeText={props.setDescription}
        placeholder="What does this service include?"
        multiline
        numberOfLines={2}
      />
      <TextField
        label="Estimated Duration"
        value={props.duration}
        onChangeText={props.setDuration}
        placeholder="e.g. 2-4 hours"
      />
      <View style={styles.formRow}>
        <NumberField
          label="Base Price"
          value={props.basePrice}
          onChangeNumber={props.setBasePrice}
          prefix="NLe"
          style={styles.flex1}
        />
        <NumberField
          label="Assessment Fee"
          value={props.assessmentFee}
          onChangeNumber={props.setAssessmentFee}
          prefix="NLe"
          style={styles.flex1}
        />
      </View>
      <ColorPicker
        label="Color"
        value={props.color}
        onChangeColor={props.setColor}
      />
      <IconPicker
        label="Icon"
        value={props.icon}
        onChangeIcon={props.setIcon}
      />
      {/* Live preview */}
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>PREVIEW</Text>
        <GlassCard style={styles.previewCard}>
          <View style={styles.previewRow}>
            <View style={[styles.previewIcon, { backgroundColor: `${props.color}20` }]}>
              <Ionicons name={props.icon as any} size={20} color={props.color} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.previewName}>{props.name || 'Service Name'}</Text>
              <Text style={styles.previewDesc}>
                {props.duration || 'Duration'} · Fee: NLe {props.assessmentFee}
              </Text>
            </View>
            <Text style={styles.previewPrice}>
              NLe {props.basePrice.toLocaleString('en-US')}
            </Text>
          </View>
        </GlassCard>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────

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
  categoryList: {
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryCard: {
    padding: 0,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: { flex: 1 },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoryDesc: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  categoryBody: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  jobIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: { flex: 1 },
  jobName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  jobMeta: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  jobPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
  },
  emptyJobs: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
    textAlign: 'center',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  },
  addJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,217,163,0.12)',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.25)',
  },
  addJobBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  editCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  editCatBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.sky,
  },
  deleteCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  deleteCatBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.coral,
  },
  addCategoryBtn: {
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
  addCategoryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
  // ─── Modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
  },
  modalWrapper: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
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
  // ─── Form ───────────────────────────────────────────────────
  formContainer: {
    gap: SPACING.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flex1: { flex: 1 },
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
  categoryScroller: {
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  // ─── Preview ────────────────────────────────────────────────
  previewSection: {
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCard: {
    padding: SPACING.md,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  previewDesc: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  previewPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
  },
});

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import {
  CATEGORIES as MOCK_CATEGORIES,
  SERVICE_JOBS as MOCK_JOBS,
  PROVIDERS as MOCK_PROVIDERS,
  BOOKINGS as MOCK_BOOKINGS,
  REVIEWS as MOCK_REVIEWS,
  ADVERTS as MOCK_ADVERTS,
  TRANSACTIONS as MOCK_TRANSACTIONS,
  NOTIFICATIONS as MOCK_NOTIFICATIONS,
  LOYALTY as MOCK_LOYALTY,
  POINT_TRANSACTIONS as MOCK_POINTS,
  ADMIN_PENDING_PROVIDERS,
  ADMIN_REVENUE,
  PROVIDER_SUGGESTIONS as MOCK_SUGGESTIONS,
  formatNLe,
} from '@/data/mock';

// Re-export formatNLe for convenience across screens.
export { formatNLe };
import type {
  ServiceCategory,
  ServiceJob,
  ProviderProfile,
  Booking,
  Review,
  Advertisement,
  Transaction,
  AppNotification,
  Dispute,
  ApprovalStatus,
  AppealStatus,
  BookingType,
  PaymentMethod,
  ProviderSuggestion,
} from '@/types';

/**
 * Data hooks layer.
 * - When Supabase is configured, queries hit the live database via React Query.
 * - When not configured (preview/dev), falls back to mock data so the UI still works.
 * All hooks use the object API and stable queryKeys.
 */

const FALLBACK_STALE = Infinity;

/* ----------------------------- Categories ----------------------------- */
export function useCategories() {
  return useQuery<ServiceCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_CATEGORIES;
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapCategory);
    },
    staleTime: FALLBACK_STALE,
  });
}

/* ------------------------------- Jobs --------------------------------- */
export function useJobsByCategory(categoryId: string | undefined) {
  return useQuery<ServiceJob[]>({
    queryKey: ['jobs', 'category', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      if (!supabaseEnabled) return MOCK_JOBS.filter((j) => j.categoryId === categoryId);
      const { data, error } = await supabase
        .from('service_jobs')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');
      if (error) throw error;
      return (data ?? []).map(mapJob);
    },
    enabled: !!categoryId,
    staleTime: FALLBACK_STALE,
  });
}

export function useJob(jobId: string | undefined) {
  return useQuery<ServiceJob | null>({
    queryKey: ['jobs', 'single', jobId],
    queryFn: async () => {
      // React Query rejects undefined query data — use null for "not found".
      if (!jobId) return null;
      if (!supabaseEnabled) return MOCK_JOBS.find((j) => j.id === jobId) ?? null;
      const { data, error } = await supabase
        .from('service_jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapJob(data) : null;
    },
    enabled: !!jobId,
    staleTime: FALLBACK_STALE,
  });
}

export function useAllJobs() {
  return useQuery<ServiceJob[]>({
    queryKey: ['jobs', 'all'],
    queryFn: async () => {
      if (!supabaseEnabled) return dedupeJobsByName(MOCK_JOBS);
      const { data, error } = await supabase.from('service_jobs').select('*').order('name');
      if (error) throw error;
      return dedupeJobsByName((data ?? []).map(mapJob));
    },
    staleTime: FALLBACK_STALE,
  });
}

/**
 * The catalog can list the same service name under several categories (the
 * rows differ only by category_id). Searches must not show duplicate services,
 * so collapse case-insensitive name duplicates and keep the first row.
 */
export function dedupeJobsByName(jobs: ServiceJob[]): ServiceJob[] {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    const key = j.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ----------------------------- Providers ------------------------------ */
export function useProviders() {
  return useQuery<ProviderProfile[]>({
    queryKey: ['providers', 'all'],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_PROVIDERS;
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('approval_status', 'APPROVED')
        .order('overall_rating', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapProvider);
    },
    staleTime: 60_000,
  });
}

export function useProvider(providerId: string | undefined) {
  return useQuery<ProviderProfile | null>({
    queryKey: ['providers', 'single', providerId],
    queryFn: async () => {
      // React Query rejects undefined query data — use null for "not found".
      if (!providerId) return null;
      if (!supabaseEnabled) return MOCK_PROVIDERS.find((p) => p.id === providerId) ?? null;
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', providerId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapProvider(data) : null;
    },
    enabled: !!providerId,
    staleTime: 60_000,
  });
}

export function usePendingProviders() {
  return useQuery<ProviderProfile[]>({
    queryKey: ['providers', 'pending'],
    queryFn: async () => {
      if (!supabaseEnabled) return ADMIN_PENDING_PROVIDERS;
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('approval_status', 'PENDING')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapProvider);
    },
    staleTime: 30_000,
  });
}

/* ------------------------------ Bookings ------------------------------ */
export function useCustomerBookings(customerId: string | undefined) {
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'customer', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      if (!supabaseEnabled) return MOCK_BOOKINGS;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapBooking);
    },
    enabled: !!customerId,
    staleTime: 15_000,
  });
}

export function useProviderBookings(providerId: string | undefined) {
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'provider', providerId],
    queryFn: async () => {
      if (!providerId) return [];
      if (!supabaseEnabled) return MOCK_BOOKINGS.filter((b) => b.providerId === providerId);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapBooking);
    },
    enabled: !!providerId,
    staleTime: 15_000,
  });
}

export function useAllBookings() {
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'all'],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_BOOKINGS;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapBooking);
    },
    staleTime: 15_000,
  });
}

export function useBooking(bookingId: string | undefined) {
  return useQuery<Booking | null>({
    queryKey: ['bookings', 'single', bookingId],
    queryFn: async () => {
      // React Query rejects undefined query data — use null for "not found".
      if (!bookingId) return null;
      if (!supabaseEnabled) return MOCK_BOOKINGS.find((b) => b.id === bookingId) ?? null;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapBooking(data) : null;
    },
    enabled: !!bookingId,
    staleTime: 10_000,
  });
}

/** Update booking status (provider lifecycle actions). */
export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: Booking['status'] }) => {
      if (!supabaseEnabled) {
        return { id: bookingId, status };
      }
      const payload: Record<string, unknown> = { status };
      if (status === 'COMPLETED') payload.completed_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', bookingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/* ------------------------------- Reviews ------------------------------ */
export function useReviewsForProvider(providerId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'provider', providerId],
    queryFn: async () => {
      if (!providerId) return [];
      if (!supabaseEnabled) return MOCK_REVIEWS.filter((r) => r.providerId === providerId);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapReview);
    },
    enabled: !!providerId,
    staleTime: 30_000,
  });
}

/** Reviews written by a given customer (newest first). */
export function useReviewsByCustomer(customerId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'customer', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      if (!supabaseEnabled) return MOCK_REVIEWS.filter((r) => r.customerId === customerId);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapReview);
    },
    enabled: !!customerId,
    staleTime: 30_000,
  });
}

export function useAllReviews() {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'all'],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_REVIEWS;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapReview);
    },
    staleTime: 30_000,
  });
}

export function useReplyToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      if (!supabaseEnabled) return { id: reviewId, reply };
      const { data, error } = await supabase
        .from('reviews')
        .update({ provider_reply: reply, provider_reply_at: new Date().toISOString() })
        .eq('id', reviewId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

/* ------------------------------ Adverts ------------------------------- */
export function useAdverts() {
  return useQuery<Advertisement[]>({
    queryKey: ['adverts'],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_ADVERTS;
      const { data, error } = await supabase
        .from('adverts')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapAdvert);
    },
    staleTime: 60_000,
  });
}

/* ---------------------------- Transactions ---------------------------- */
export function useTransactions(userId: string | undefined) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_TRANSACTIONS;
      if (!userId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapTransaction);
    },
    enabled: !!userId || !supabaseEnabled,
    staleTime: 30_000,
  });
}

/* --------------------------- Notifications ---------------------------- */
export function useNotifications(userId: string | undefined) {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_NOTIFICATIONS;
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapNotification);
    },
    enabled: !!userId || !supabaseEnabled,
    staleTime: 15_000,
  });
}

/** Admin: every notification in the system (newest first). */
export function useAllNotifications(enabled: boolean) {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications', 'all'],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_NOTIFICATIONS;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map(mapNotification);
    },
    enabled,
    staleTime: 15_000,
  });
}

interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  type: AppNotification['type'];
  createdBy: string;
}

/** Create a notification owned by the current user (they alone can amend it). */
export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateNotificationInput) => {
      if (!supabaseEnabled) return { ok: true };
      const { error } = await supabase.from('notifications').insert({
        user_id: input.userId,
        title: input.title,
        body: input.body,
        type: input.type,
        created_by: input.createdBy,
      });
      if (error) throw error;
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/** Amend a notification (RLS: only its creator or an admin). */
export function useUpdateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title, body, type }: { id: string; title: string; body: string; type: AppNotification['type'] }) => {
      if (!supabaseEnabled) return { id };
      const { error } = await supabase.from('notifications').update({ title, body, type }).eq('id', id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/** Delete a notification (RLS: only its creator or an admin). */
export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseEnabled) return { id };
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/** Mark a single notification as read (recipient only). */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabaseEnabled) return { id };
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/** Mark every notification for a user as read. */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!supabaseEnabled) return { userId };
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
      return { userId };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/* ------------------------------ Disputes ------------------------------ */
export function useDisputes() {
  return useQuery<Dispute[]>({
    queryKey: ['disputes', 'all'],
    queryFn: async () => {
      if (!supabaseEnabled) return [];
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapDispute);
    },
    staleTime: 30_000,
  });
}

/* ----------------------------- Admin KPIs ----------------------------- */
export function useAdminKpis() {
  return useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: async () => {
      if (!supabaseEnabled) return { ...ADMIN_REVENUE, pendingProviders: ADMIN_PENDING_PROVIDERS.length };
      const [b, p, u, t] = await Promise.all([
        supabase.from('bookings').select('final_price, status, platform_commission'),
        supabase.from('provider_profiles').select('id, approval_status'),
        supabase.from('profiles').select('id, role'),
        supabase.from('transactions').select('amount, type, status, created_at'),
      ]);
      const bookings = b.data ?? [];
      const providers = p.data ?? [];
      const users = u.data ?? [];
      const txns = t.data ?? [];
      const totalRevenue = bookings.reduce((s, x) => s + Number(x.final_price ?? 0), 0);
      const commissionEarned = bookings.reduce((s, x) => s + Number(x.platform_commission ?? 0), 0);
      const completedBookings = bookings.filter((x) => x.status === 'COMPLETED').length;
      const activeBookings = bookings.filter(
        (x) => ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(x.status),
      ).length;
      return {
        totalRevenue,
        commissionEarned,
        activeBookings,
        completedBookings,
        totalUsers: users.length,
        totalProviders: providers.filter((x) => x.approval_status === 'APPROVED').length,
        pendingProviders: providers.filter((x) => x.approval_status === 'PENDING').length,
        monthlyGrowth: 18.5,
        recentTransactions: txns.slice(0, 6).map(mapTransaction),
      };
    },
    staleTime: 30_000,
  });
}

/* ------------------------------ Loyalty ------------------------------- */
export function useLoyalty(userId: string | undefined) {
  return useQuery({
    queryKey: ['loyalty', userId],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_LOYALTY;
      if (!userId) return { balance: 0, totalEarned: 0, totalRedeemed: 0 };
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('type, amount')
        .eq('user_id', userId);
      if (error) throw error;
      const rows = data ?? [];
      const earned = rows.filter((r) => r.type === 'EARNED' || r.type === 'BONUS').reduce((s, r) => s + r.amount, 0);
      const redeemed = rows.filter((r) => r.type === 'REDEEMED').reduce((s, r) => s + Math.abs(r.amount), 0);
      return { balance: earned - redeemed, totalEarned: earned, totalRedeemed: redeemed };
    },
    enabled: !!userId || !supabaseEnabled,
    staleTime: 30_000,
  });
}

export function usePointTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ['loyalty', 'points', userId],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_POINTS;
      if (!userId) return [];
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        type: r.type as 'EARNED' | 'REDEEMED' | 'BONUS',
        amount: r.amount,
        description: r.description ?? '',
        createdAt: r.created_at,
      }));
    },
    enabled: !!userId || !supabaseEnabled,
    staleTime: 30_000,
  });
}

/* ----------------------- Provider profile for user --------------------- */

export function useProviderForUser(userId: string | undefined) {
  return useQuery<ProviderProfile | null>({
    queryKey: ['providers', 'for-user', userId],
    queryFn: async () => {
      // React Query rejects undefined query data — use null for "not found".
      if (!userId) return null;
      if (!supabaseEnabled) {
        return MOCK_PROVIDERS.find((p) => p.userId === userId) ?? MOCK_PROVIDERS[0] ?? null;
      }
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapProvider(data) : null;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

/* ------------------------------ Provider search ------------------------- */

export function useSearchProviders(query: string) {
  const q = query.trim();
  return useQuery<ProviderProfile[]>({
    queryKey: ['providers', 'search', q],
    queryFn: async () => {
      if (!q) return [];
      if (!supabaseEnabled) {
        const lower = q.toLowerCase();
        return MOCK_PROVIDERS.filter(
          (p) => p.name.toLowerCase().includes(lower) && p.approvalStatus === 'APPROVED',
        );
      }
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .ilike('name', `%${q}%`)
        .eq('approval_status', 'APPROVED')
        .limit(10);
      if (error) throw error;
      return (data ?? []).map(mapProvider);
    },
    enabled: q.length > 0,
    staleTime: 30_000,
  });
}

/* ------------------------------ Admin: users ---------------------------- */

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  approvalStatus: ApprovalStatus;
}

export function useAllUsers() {
  return useQuery<AdminUserRow[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      if (!supabaseEnabled) {
        return [
          { id: 'user_admin1', name: 'ePaS Admin', email: 'admin@epas.sl', phone: '+232 76 000 001', role: 'ADMIN' as const, approvalStatus: 'APPROVED' as const },
          { id: 'user1', name: 'Aminata Kamara', email: 'customer@epas.sl', phone: '+232 76 111 222', role: 'CUSTOMER' as const, approvalStatus: 'APPROVED' as const },
          { id: 'user_prov1', name: 'Mohamed Bangura', email: 'trader@epas.sl', phone: '+232 77 333 444', role: 'PROVIDER' as const, approvalStatus: 'APPROVED' as const },
          { id: 'user_pending1', name: 'Fatmata Sesay', email: 'fatmata@epas.sl', phone: '+232 78 555 666', role: 'CUSTOMER' as const, approvalStatus: 'PENDING' as const },
        ];
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone, role, approval_status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id as string,
        name: (r.name as string) ?? 'Unknown',
        email: (r.email as string) ?? '',
        phone: (r.phone as string) ?? '',
        role: r.role as AdminUserRow['role'],
        approvalStatus: ((r.approval_status as ApprovalStatus | null) ?? 'PENDING'),
      }));
    },
    staleTime: 30_000,
  });
}

export function useSetUserApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: ApprovalStatus }) => {
      if (supabaseEnabled) {
        const { error } = await supabase
          .from('profiles')
          .update({ approval_status: status })
          .eq('id', userId);
        if (error) throw error;
        await supabase.from('notifications').insert({
          user_id: userId,
          title: status === 'APPROVED' ? 'Account approved' : status === 'SUSPENDED' ? 'Account suspended' : 'Account review update',
          body:
            status === 'APPROVED'
              ? 'Great news — your ePaS account has been approved. You now have full access.'
              : status === 'SUSPENDED'
                ? 'Your ePaS account has been suspended. Contact support if you believe this is a mistake.'
                : 'Your account application was not approved. Contact support for more information.',
          type: 'SYSTEM',
        });
      }
      return { userId, status };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

/* ---------------------------- Admin: providers --------------------------- */

export function useSetProviderApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ providerId, status }: { providerId: string; status: ApprovalStatus }) => {
      if (supabaseEnabled) {
        const { data: prov, error: fetchErr } = await supabase
          .from('provider_profiles')
          .select('user_id')
          .eq('id', providerId)
          .single();
        if (fetchErr) throw fetchErr;
        const { error } = await supabase
          .from('provider_profiles')
          .update({ approval_status: status })
          .eq('id', providerId);
        if (error) throw error;
        const userId = (prov as any)?.user_id as string | undefined;
        if (userId) {
          await supabase.from('profiles').update({ approval_status: status }).eq('id', userId);
          await supabase.from('notifications').insert({
            user_id: userId,
            title: status === 'APPROVED' ? 'Trader application approved' : 'Trader application update',
            body:
              status === 'APPROVED'
                ? 'Congratulations! Your trader profile is live. Customers can now book you.'
                : status === 'SUSPENDED'
                  ? 'Your trader profile has been suspended. Contact support for details.'
                  : 'Your trader application was not approved at this time. Contact support for details.',
            type: 'SYSTEM',
          });
        }
      }
      return { providerId, status };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['providers'] });
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

/* ----------------------------- Admin: reviews ---------------------------- */

export function useSetReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: 'VISIBLE' | 'HIDDEN' }) => {
      if (supabaseEnabled) {
        const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);
        if (error) throw error;
      }
      return { reviewId, status };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

/* ------------------------- Reviews: create & appeal ---------------------- */

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      bookingId: string;
      customerId: string;
      customerName: string;
      customerPhoto?: string;
      providerId: string;
      ratingTimeliness: number;
      ratingProfessionalism: number;
      ratingQuality: number;
      ratingCommunication: number;
      comment: string;
    }) => {
      const overall = Math.round(
        ((input.ratingTimeliness + input.ratingProfessionalism + input.ratingQuality + input.ratingCommunication) / 4) * 10,
      ) / 10;
      if (!supabaseEnabled) return { id: `rev_${Date.now()}`, overall };
      const reviewId = `rev_${Date.now()}`;
      const { error } = await supabase.from('reviews').insert({
        id: reviewId,
        booking_id: input.bookingId,
        customer_id: input.customerId,
        customer_name: input.customerName,
        customer_photo: input.customerPhoto ?? null,
        provider_id: input.providerId,
        timeliness: input.ratingTimeliness,
        professionalism: input.ratingProfessionalism,
        quality: input.ratingQuality,
        communication: input.ratingCommunication,
        overall,
        comment: input.comment,
        status: 'VISIBLE',
      });
      if (error) throw error;
      await supabase.from('bookings').update({ has_review: true }).eq('id', input.bookingId);
      const { data: prov } = await supabase
        .from('provider_profiles')
        .select('user_id')
        .eq('id', input.providerId)
        .maybeSingle();
      const providerUserId = (prov as any)?.user_id as string | undefined;
      if (providerUserId) {
        await supabase.from('notifications').insert({
          user_id: providerUserId,
          title: 'New review received',
          body: `${input.customerName} rated you ${overall}/5. Tap to view.`,
          type: 'REVIEW',
          related_id: reviewId,
        });
      }
      return { id: reviewId, overall };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['providers'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useAppealReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      if (supabaseEnabled) {
        const { error } = await supabase
          .from('reviews')
          .update({ appeal_status: 'PENDING', appeal_reason: reason })
          .eq('id', reviewId);
        if (error) throw error;
      }
      return { reviewId };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useAppealedReviews() {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'appealed'],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_REVIEWS.filter((r) => r.appealStatus === 'PENDING');
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('appeal_status', 'PENDING')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapReview);
    },
    staleTime: 15_000,
  });
}

export function useResolveAppeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, outcome }: { reviewId: string; outcome: 'UPHELD' | 'OVERTURNED' }) => {
      if (supabaseEnabled) {
        const { error } = await supabase
          .from('reviews')
          .update({
            appeal_status: outcome,
            status: outcome === 'OVERTURNED' ? 'HIDDEN' : 'VISIBLE',
          })
          .eq('id', reviewId);
        if (error) throw error;
      }
      return { reviewId, outcome };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

/* ----------------------------- Admin: disputes --------------------------- */

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      disputeId: string;
      bookingId: string;
      action: 'refund' | 'release';
      resolution: string;
      resolvedBy: string;
      refundAmount?: number;
    }) => {
      if (!supabaseEnabled) return input;
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'RESOLVED',
          resolution: input.resolution,
          refund_amount: input.action === 'refund' ? input.refundAmount ?? null : null,
          resolved_by: input.resolvedBy,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', input.disputeId);
      if (error) throw error;
      await supabase
        .from('bookings')
        .update({ payment_status: input.action === 'refund' ? 'REFUNDED' : 'RELEASED' })
        .eq('id', input.bookingId);
      return input;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['disputes'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

/* --------------------------- Provider suggestions ------------------------ */

export function useSuggestions() {
  return useQuery<ProviderSuggestion[]>({
    queryKey: ['suggestions'],
    queryFn: async () => {
      if (!supabaseEnabled) return MOCK_SUGGESTIONS;
      const { data, error } = await supabase
        .from('provider_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id as string,
        name: (r.name as string) ?? '',
        phone: (r.phone as string) ?? '',
        serviceCategory: (r.service_category as string) ?? '',
        notes: (r.notes as string) ?? '',
        status: ((r.status as ProviderSuggestion['status'] | null) ?? 'PENDING'),
        createdAt: r.created_at as string,
      }));
    },
    staleTime: 30_000,
  });
}

/* ---------------------------- Admin: suggestions -------------------------- */

export function useUpdateSuggestionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProviderSuggestion['status'] }) => {
      if (supabaseEnabled) {
        const { error } = await supabase.from('provider_suggestions').update({ status }).eq('id', id);
        if (error) throw error;
      }
      return { id, status };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
}

/* ----------------------- Provider profile upsert ------------------------- */

export function useUpsertProviderProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      existingId?: string;
      userId: string;
      name: string;
      bio: string;
      experienceYears: number;
      serviceCategoryIds: string[];
      serviceAreas: string[];
    }) => {
      if (!supabaseEnabled) return { id: input.existingId ?? `prov_${Date.now()}` };
      if (input.existingId) {
        const { error } = await supabase
          .from('provider_profiles')
          .update({
            bio: input.bio,
            experience_years: input.experienceYears,
            service_category_ids: input.serviceCategoryIds,
            service_areas: input.serviceAreas,
          })
          .eq('id', input.existingId);
        if (error) throw error;
        return { id: input.existingId };
      }
      const id = `prov_${Date.now()}`;
      const { error } = await supabase.from('provider_profiles').insert({
        id,
        user_id: input.userId,
        name: input.name,
        bio: input.bio,
        experience_years: input.experienceYears,
        service_category_ids: input.serviceCategoryIds,
        service_areas: input.serviceAreas,
        approval_status: 'PENDING',
      });
      if (error) throw error;
      return { id };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['providers'] });
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['providers', 'for-user', vars.userId] });
    },
  });
}

/* ------------------------------ Booking create ---------------------------- */

export interface CreateBookingInput {
  customerId: string;
  customerName: string;
  customerPhoto?: string;
  providerId: string;
  providerName: string;
  providerPhoto?: string;
  serviceJobId: string;
  serviceJobName: string;
  serviceJobIcon?: string;
  serviceJobColor?: string;
  bookingType: BookingType;
  address: string;
  scheduledDate: string;
  notes?: string;
  finalPrice: number;
  serviceFee: number;
  paymentMethod: PaymentMethod;
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const id = `bk_${Date.now()}`;
      const platformCommission = Math.round(input.finalPrice * 0.15);
      const providerPayout = input.finalPrice - platformCommission;
      if (!supabaseEnabled) return { id };
      const { error } = await supabase.from('bookings').insert({
        id,
        customer_id: input.customerId,
        customer_name: input.customerName,
        customer_photo: input.customerPhoto ?? null,
        provider_id: input.providerId,
        provider_name: input.providerName,
        provider_photo: input.providerPhoto ?? null,
        service_job_id: input.serviceJobId,
        service_job_name: input.serviceJobName,
        service_job_icon: input.serviceJobIcon ?? null,
        service_job_color: input.serviceJobColor ?? null,
        status: 'REQUESTED',
        booking_type: input.bookingType,
        final_price: input.finalPrice,
        service_fee: input.serviceFee,
        platform_commission: platformCommission,
        provider_payout: providerPayout,
        scheduled_date: input.scheduledDate || null,
        address: input.address,
        notes: input.notes ?? null,
        payment_method: input.paymentMethod,
        payment_status: 'HELD_IN_ESCROW',
      });
      if (error) throw error;
      await supabase.from('transactions').insert({
        id: `txn_${Date.now()}`,
        booking_id: id,
        user_id: input.customerId,
        amount: input.finalPrice,
        type: 'PAYMENT',
        description: `Booking for ${input.serviceJobName} (held in escrow)`,
        payment_method: input.paymentMethod,
        status: 'HELD_IN_ESCROW',
      });
      const { data: prov } = await supabase
        .from('provider_profiles')
        .select('user_id')
        .eq('id', input.providerId)
        .maybeSingle();
      const providerUserId = (prov as any)?.user_id as string | undefined;
      if (providerUserId) {
        await supabase.from('notifications').insert({
          user_id: providerUserId,
          title: 'New booking request',
          body: `${input.customerName} requested ${input.serviceJobName}. Tap to review.`,
          type: 'BOOKING',
          related_id: id,
        });
      }
      return { id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/* ------------------------------ Mappers ------------------------------- */
type Row = Record<string, unknown>;

function mapCategory(r: Row): ServiceCategory {
  return {
    id: r.id as string,
    name: r.name as string,
    icon: r.icon as string,
    color: r.color as string,
    description: (r.description as string) ?? '',
    sortOrder: r.sort_order as number,
    serviceCount: r.service_count as number,
  };
}

function mapJob(r: Row): ServiceJob {
  return {
    id: r.id as string,
    categoryId: r.category_id as string,
    name: r.name as string,
    description: (r.description as string) ?? '',
    icon: r.icon as string,
    color: r.color as string,
    providerIds: (r.provider_ids as string[]) ?? [],
  };
}

function mapProvider(r: Row): ProviderProfile {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    name: r.name as string,
    bio: (r.bio as string) ?? '',
    experienceYears: r.experience_years as number,
    approvalStatus: r.approval_status as ProviderProfile['approvalStatus'],
    providerTier: r.provider_tier as ProviderProfile['providerTier'],
    overallRating: Number(r.overall_rating ?? 0),
    totalReviews: r.total_reviews as number,
    completedJobs: r.completed_jobs as number,
    badgeLevel: r.badge_level as ProviderProfile['badgeLevel'],
    profilePhoto: (r.profile_photo as string) ?? undefined,
    serviceAreas: (r.service_areas as string[]) ?? [],
    serviceCategoryIds: (r.service_category_ids as string[]) ?? [],
    responseTime: (r.response_time as string) ?? '',
    verified: r.verified as boolean,
  };
}

function mapBooking(r: Row): Booking {
  return {
    id: r.id as string,
    customerId: r.customer_id as string,
    customerName: (r.customer_name as string) ?? '',
    customerPhoto: (r.customer_photo as string) ?? undefined,
    providerId: r.provider_id as string,
    providerName: (r.provider_name as string) ?? '',
    providerPhoto: (r.provider_photo as string) ?? undefined,
    serviceJobId: r.service_job_id as string,
    serviceJobName: (r.service_job_name as string) ?? '',
    serviceJobIcon: (r.service_job_icon as string) ?? 'cube',
    serviceJobColor: (r.service_job_color as string) ?? '#1A3C6E',
    status: r.status as Booking['status'],
    bookingType: r.booking_type as Booking['bookingType'],
    quotedPrice: r.quoted_price != null ? Number(r.quoted_price) : undefined,
    finalPrice: Number(r.final_price ?? 0),
    serviceFee: Number(r.service_fee ?? 0),
    platformCommission: Number(r.platform_commission ?? 0),
    providerPayout: Number(r.provider_payout ?? 0),
    scheduledDate: (r.scheduled_date as string) ?? r.created_at as string,
    address: (r.address as string) ?? '',
    notes: (r.notes as string) ?? undefined,
    paymentMethod: r.payment_method as Booking['paymentMethod'],
    paymentStatus: r.payment_status as Booking['paymentStatus'],
    beforePhoto: (r.before_photo as string) ?? undefined,
    afterPhoto: (r.after_photo as string) ?? undefined,
    createdAt: r.created_at as string,
    completedAt: (r.completed_at as string) ?? undefined,
    hasReview: r.has_review as boolean,
  };
}

function mapReview(r: Row): Review {
  return {
    id: r.id as string,
    bookingId: r.booking_id as string,
    customerId: r.customer_id as string,
    customerName: (r.customer_name as string) ?? '',
    customerPhoto: (r.customer_photo as string) ?? undefined,
    providerId: r.provider_id as string,
    timeliness: r.timeliness as number,
    professionalism: r.professionalism as number,
    quality: r.quality as number,
    communication: r.communication as number,
    overall: Number(r.overall ?? 0),
    comment: (r.comment as string) ?? '',
    createdAt: r.created_at as string,
    status: r.status as Review['status'],
    providerReply: (r.provider_reply as string) ?? undefined,
    providerReplyAt: (r.provider_reply_at as string) ?? undefined,
    appealStatus: (r.appeal_status as AppealStatus | null) ?? undefined,
    appealReason: (r.appeal_reason as string) ?? undefined,
  };
}

function mapAdvert(r: Row): Advertisement {
  return {
    id: r.id as string,
    title: r.title as string,
    subtitle: (r.subtitle as string) ?? '',
    ctaText: (r.cta_text as string) ?? '',
    gradient: (r.gradient as [string, string]) ?? ['#1A3C6E', '#2A5494'],
    icon: r.icon as string,
    slot: r.slot as number,
    sortOrder: r.sort_order as number,
    active: r.active as boolean,
    backgroundType: r.background_type as Advertisement['backgroundType'],
    backgroundImage: (r.background_image as string) ?? undefined,
    backgroundVideo: (r.background_video as string) ?? undefined,
    overlayOpacity: Number(r.overlay_opacity ?? 0.5),
    textPosition: r.text_position as Advertisement['textPosition'],
    linkRoute: (r.link_route as string) ?? undefined,
  };
}

function mapTransaction(r: Row): Transaction {
  return {
    id: r.id as string,
    amount: Number(r.amount ?? 0),
    type: r.type as Transaction['type'],
    description: (r.description as string) ?? '',
    paymentMethod: r.payment_method as Transaction['paymentMethod'],
    status: r.status as Transaction['status'],
    createdAt: r.created_at as string,
  };
}

function mapNotification(r: Row): AppNotification {
  return {
    id: r.id as string,
    title: r.title as string,
    body: (r.body as string) ?? '',
    type: r.type as AppNotification['type'],
    isRead: r.is_read as boolean,
    createdAt: r.created_at as string,
    createdBy: (r.created_by as string) ?? undefined,
  };
}

function mapDispute(r: Row): Dispute {
  return {
    id: r.id as string,
    bookingId: r.booking_id as string,
    raisedBy: r.raised_by as string,
    reason: (r.reason as string) ?? '',
    description: (r.description as string) ?? '',
    evidencePhotos: (r.evidence_photos as string[]) ?? [],
    status: r.status as Dispute['status'],
    resolution: (r.resolution as string) ?? undefined,
    resolvedBy: (r.resolved_by as string) ?? undefined,
    resolvedAt: (r.resolved_at as string) ?? undefined,
    refundAmount: Number(r.refund_amount ?? 0),
    createdAt: r.created_at as string,
  };
}

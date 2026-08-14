export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

/** Display labels for each role. */
export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: 'Customer',
  PROVIDER: 'Trader',
  ADMIN: 'Admin',
};
export type AccountType = 'PRIVATE' | 'BUSINESS';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type BadgeLevel = 'NEW' | 'RISING_STAR' | 'VERIFIED_PRO' | 'MASTER';
export type BookingType = 'INSTANT' | 'IN_PERSON_QUOTE';
export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'DISPUTED';
export type PaymentMethod = 'ORANGE_MONEY' | 'AFRICELL_MONEY';
export type PaymentStatus = 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED' | 'REFUNDED';
export type SubscriptionTier = 'BRONZE' | 'SILVER' | 'GOLD';
export type PointType = 'EARNED' | 'REDEEMED' | 'BONUS';
export type ReviewStatus = 'VISIBLE' | 'REPORTED' | 'HIDDEN';
export type AppealStatus = 'PENDING' | 'UPHELD' | 'OVERTURNED';

export interface UserPhone {
  id: string;
  phone: string;
  label: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  phones: UserPhone[];
  name: string;
  role: UserRole;
  accountType: AccountType;
  businessName?: string;
  profilePhoto?: string;
  address?: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  experienceYears: number;
  approvalStatus: ApprovalStatus;
  providerTier: SubscriptionTier;
  overallRating: number;
  totalReviews: number;
  completedJobs: number;
  badgeLevel: BadgeLevel;
  profilePhoto?: string;
  serviceAreas: string[];
  serviceCategoryIds: string[];
  responseTime: string;
  verified: boolean;
  responseRate?: number;
  onTimeRate?: number;
  serviceRadiusKm?: number;
  portfolioPhotos?: string[];
  certifications?: string[];
  profileCompleteness?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  sortOrder: number;
  serviceCount: number;
}

export interface ServiceJob {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  providerIds: string[];
  featured?: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhoto?: string;
  providerId: string;
  providerName: string;
  providerPhoto?: string;
  serviceJobId: string;
  serviceJobName: string;
  serviceJobIcon: string;
  serviceJobColor: string;
  status: BookingStatus;
  bookingType: BookingType;
  quotedPrice?: number;
  finalPrice: number;
  serviceFee: number;
  platformCommission: number;
  providerPayout: number;
  scheduledDate: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  beforePhoto?: string;
  afterPhoto?: string;
  createdAt: string;
  completedAt?: string;
  hasReview: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhoto?: string;
  providerId: string;
  timeliness: number;
  professionalism: number;
  quality: number;
  communication: number;
  overall: number;
  comment: string;
  createdAt: string;
  status: ReviewStatus;
  providerReply?: string;
  providerReplyAt?: string;
  appealStatus?: AppealStatus;
  appealReason?: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  bookingId: string;
  providerId: string;
  providerName: string;
  providerPhoto?: string;
  customerName: string;
  serviceJobName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  gradient: [string, string];
  icon: string;
  slot: number;
  sortOrder: number;
  active: boolean;
  backgroundType: 'gradient' | 'image' | 'video';
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayOpacity: number;
  textPosition: 'top' | 'bottom' | 'center';
  linkRoute?: string;
}

export interface LoyaltyInfo {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
}

export interface PointTransaction {
  id: string;
  type: PointType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Subscription {
  tier: SubscriptionTier;
  startDate: string;
  endDate: string;
  isActive: boolean;
  monthlyFee: number;
  benefits: string[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'PAYMENT' | 'PAYOUT' | 'COMMISSION' | 'REFUND';
  description: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'BOOKING' | 'MESSAGE' | 'REVIEW' | 'PAYMENT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  /** Auth user id of whoever created it; undefined for system-generated. */
  createdBy?: string;
}

export interface ProviderSuggestion {
  id: string;
  name: string;
  phone: string;
  serviceCategory: string;
  notes: string;
  status: 'PENDING' | 'CONTACTED' | 'ONBOARDED' | 'DECLINED';
  createdAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  raisedBy: string;
  reason: string;
  description: string;
  evidencePhotos: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  refundAmount: number;
  createdAt: string;
}

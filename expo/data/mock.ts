import type {
  ServiceCategory,
  ServiceJob,
  ProviderProfile,
  Booking,
  Review,
  Advertisement,
  Conversation,
  Message,
  LoyaltyInfo,
  PointTransaction,
  Subscription,
  Transaction,
  AppNotification,
  ProviderSuggestion,
  User,
} from '@/types';

export const CATEGORIES: ServiceCategory[] = [
  { id: 'cat1', name: 'House Care', icon: 'home', color: '#1A3C6E', description: 'Housekeeping, cleaning, repairs, trades', sortOrder: 1, serviceCount: 10 },
  { id: 'cat2', name: 'Labour', icon: 'construct', color: '#E67E22', description: 'General labour, construction trades', sortOrder: 2, serviceCount: 6 },
  { id: 'cat3', name: 'Vehicle', icon: 'car', color: '#E74C3C', description: 'Driving, mechanics, security', sortOrder: 3, serviceCount: 6 },
  { id: 'cat4', name: 'Electrical', icon: 'flash', color: '#F39C12', description: 'Electrical, solar, appliances', sortOrder: 4, serviceCount: 6 },
  { id: 'cat5', name: 'Plumbing', icon: 'water', color: '#3498DB', description: 'Pipes, wells, pumps, water supply', sortOrder: 5, serviceCount: 4 },
  { id: 'cat6', name: 'Travel', icon: 'airplane', color: '#2ECC71', description: 'Transport, delivery, logistics', sortOrder: 6, serviceCount: 4 },
  { id: 'cat7', name: 'Personal Care', icon: 'heart', color: '#E91E8C', description: 'Dental and medical consultations', sortOrder: 7, serviceCount: 2 },
  { id: 'cat8', name: 'Hair Dresser', icon: 'cut', color: '#9B59B6', description: 'Braiding, wigs, nails, styling', sortOrder: 8, serviceCount: 7 },
  { id: 'cat9', name: 'Health', icon: 'medkit', color: '#16A085', description: 'Medical, pharmacy, hospital care', sortOrder: 9, serviceCount: 4 },
  { id: 'cat10', name: 'Decorator', icon: 'brush', color: '#D35400', description: 'Painting and decoration', sortOrder: 10, serviceCount: 1 },
  { id: 'cat11', name: 'Solar/Renewables', icon: 'sunny', color: '#F1C40F', description: 'Solar, wind, hydro installation & maintenance', sortOrder: 11, serviceCount: 4 },
];

export const SERVICE_JOBS: ServiceJob[] = [
  // House Care (cat1) — prov1-prov5
  { id: 'job1', categoryId: 'cat1', name: 'Housekeeper', description: 'Regular housekeeping, cleaning and home maintenance', icon: 'home', color: '#1A3C6E', basePrice: 200, assessmentFee: 0, estimatedDuration: '2-4 hours', providerIds: ['prov1', 'prov2', 'prov3'] },
  { id: 'job2', categoryId: 'cat1', name: 'Cleaner', description: 'Professional cleaning for homes and offices', icon: 'sparkles', color: '#1A3C6E', basePrice: 150, assessmentFee: 0, estimatedDuration: '2-3 hours', providerIds: ['prov1', 'prov4', 'prov5'] },
  { id: 'job3', categoryId: 'cat1', name: 'Painter', description: 'Interior and exterior painting services', icon: 'brush', color: '#D35400', basePrice: 350, assessmentFee: 50, estimatedDuration: '1-2 days', providerIds: ['prov2', 'prov3'] },
  { id: 'job4', categoryId: 'cat1', name: 'Welder', description: 'Metal welding and fabrication work', icon: 'flash', color: '#1A3C6E', basePrice: 400, assessmentFee: 50, estimatedDuration: '3-4 hours', providerIds: ['prov3', 'prov5'] },
  { id: 'job5', categoryId: 'cat1', name: 'Locksmith', description: 'Lock installation, repair and key cutting', icon: 'key', color: '#1A3C6E', basePrice: 120, assessmentFee: 25, estimatedDuration: '1 hour', providerIds: ['prov4'] },
  { id: 'job6', categoryId: 'cat1', name: 'Carpenter', description: 'Furniture repair, woodwork and carpentry', icon: 'hammer', color: '#D35400', basePrice: 250, assessmentFee: 0, estimatedDuration: '2-4 hours', providerIds: ['prov2', 'prov5'] },
  { id: 'job7', categoryId: 'cat1', name: 'Roofer', description: 'Roof repair, installation and waterproofing', icon: 'home', color: '#1A3C6E', basePrice: 500, assessmentFee: 50, estimatedDuration: '1-2 days', providerIds: ['prov1', 'prov3'] },
  { id: 'job8', categoryId: 'cat1', name: 'Gas Cooker', description: 'Gas cooker installation, repair and servicing', icon: 'flame', color: '#E67E22', basePrice: 180, assessmentFee: 25, estimatedDuration: '1-2 hours', providerIds: ['prov4', 'prov5'] },
  { id: 'job9', categoryId: 'cat1', name: 'Masonry', description: 'Block work, plastering and masonry services', icon: 'cube', color: '#1A3C6E', basePrice: 400, assessmentFee: 50, estimatedDuration: '1-2 days', providerIds: ['prov3', 'prov4'] },
  { id: 'job10', categoryId: 'cat1', name: 'Tiler', description: 'Floor and wall tiling installation and repair', icon: 'grid', color: '#1A3C6E', basePrice: 350, assessmentFee: 25, estimatedDuration: '4-8 hours', providerIds: ['prov1', 'prov5'] },

  // Labour (cat2) — prov6-prov8
  { id: 'job11', categoryId: 'cat2', name: 'Labourer', description: 'General labour for construction and site work', icon: 'construct', color: '#E67E22', basePrice: 150, assessmentFee: 0, estimatedDuration: 'Full day', providerIds: ['prov6', 'prov7', 'prov8'] },
  { id: 'job12', categoryId: 'cat2', name: 'Cleaner', description: 'Post-construction and site cleaning', icon: 'sparkles', color: '#E67E22', basePrice: 120, assessmentFee: 0, estimatedDuration: '3-4 hours', providerIds: ['prov6', 'prov8'] },
  { id: 'job13', categoryId: 'cat2', name: 'Painter', description: 'Building and construction painting', icon: 'brush', color: '#D35400', basePrice: 300, assessmentFee: 25, estimatedDuration: '1-2 days', providerIds: ['prov7', 'prov8'] },
  { id: 'job14', categoryId: 'cat2', name: 'Welder', description: 'Structural welding and metal fabrication', icon: 'flash', color: '#E67E22', basePrice: 450, assessmentFee: 50, estimatedDuration: '4-6 hours', providerIds: ['prov6', 'prov7'] },
  { id: 'job15', categoryId: 'cat2', name: 'Carpenter', description: 'Construction carpentry and formwork', icon: 'hammer', color: '#D35400', basePrice: 280, assessmentFee: 0, estimatedDuration: 'Full day', providerIds: ['prov7'] },
  { id: 'job16', categoryId: 'cat2', name: 'Roofer', description: 'Roofing installation and repair for buildings', icon: 'home', color: '#E67E22', basePrice: 550, assessmentFee: 50, estimatedDuration: '1-3 days', providerIds: ['prov6', 'prov8'] },

  // Vehicle (cat3) — prov9-prov11
  { id: 'job17', categoryId: 'cat3', name: 'Biker', description: 'Motorbike transport and delivery services', icon: 'bicycle', color: '#E74C3C', basePrice: 50, assessmentFee: 0, estimatedDuration: '30-60 mins', providerIds: ['prov9', 'prov11'] },
  { id: 'job18', categoryId: 'cat3', name: 'Car Driver', description: 'Private car driver for hire and trips', icon: 'car', color: '#E74C3C', basePrice: 120, assessmentFee: 0, estimatedDuration: 'As needed', providerIds: ['prov10', 'prov11'] },
  { id: 'job19', categoryId: 'cat3', name: 'Mechanic', description: 'Vehicle repair, servicing and diagnostics', icon: 'settings', color: '#E74C3C', basePrice: 350, assessmentFee: 25, estimatedDuration: '2-4 hours', providerIds: ['prov9', 'prov10'] },
  { id: 'job20', categoryId: 'cat3', name: 'Electrical', description: 'Auto electrical repairs and wiring', icon: 'flash', color: '#F39C12', basePrice: 300, assessmentFee: 25, estimatedDuration: '2-3 hours', providerIds: ['prov10'] },
  { id: 'job21', categoryId: 'cat3', name: 'Locks', description: 'Vehicle lock repair and key replacement', icon: 'key', color: '#E74C3C', basePrice: 150, assessmentFee: 25, estimatedDuration: '1 hour', providerIds: ['prov11'] },
  { id: 'job22', categoryId: 'cat3', name: 'Alarms', description: 'Car alarm installation and repair', icon: 'notifications', color: '#E74C3C', basePrice: 200, assessmentFee: 25, estimatedDuration: '1-2 hours', providerIds: ['prov9'] },

  // Electrical (cat4) — prov12-prov14
  { id: 'job23', categoryId: 'cat4', name: 'Electrician', description: 'Wiring, installation and electrical repair', icon: 'flash', color: '#F39C12', basePrice: 400, assessmentFee: 50, estimatedDuration: '3-4 hours', providerIds: ['prov12', 'prov13', 'prov14'] },
  { id: 'job24', categoryId: 'cat4', name: 'Solar Installer', description: 'Solar panel system design and installation', icon: 'sunny', color: '#F1C40F', basePrice: 2500, assessmentFee: 100, estimatedDuration: '1-2 days', providerIds: ['prov13', 'prov14'] },
  { id: 'job25', categoryId: 'cat4', name: 'Fridge', description: 'Refrigerator repair and servicing', icon: 'snow', color: '#3498DB', basePrice: 250, assessmentFee: 25, estimatedDuration: '2-3 hours', providerIds: ['prov12'] },
  { id: 'job26', categoryId: 'cat4', name: 'Fans', description: 'Ceiling and standing fan repair', icon: 'refresh', color: '#F39C12', basePrice: 100, assessmentFee: 0, estimatedDuration: '1 hour', providerIds: ['prov12', 'prov14'] },
  { id: 'job27', categoryId: 'cat4', name: 'AirCon', description: 'Air conditioning installation and repair', icon: 'snow', color: '#3498DB', basePrice: 500, assessmentFee: 50, estimatedDuration: '3-4 hours', providerIds: ['prov13'] },
  { id: 'job28', categoryId: 'cat4', name: 'Car', description: 'Auto electrical systems and battery service', icon: 'car', color: '#E74C3C', basePrice: 300, assessmentFee: 25, estimatedDuration: '2-3 hours', providerIds: ['prov14'] },

  // Plumbing (cat5) — prov15-prov16
  { id: 'job29', categoryId: 'cat5', name: 'Plumber', description: 'Pipe repair, installation and fitting', icon: 'water', color: '#3498DB', basePrice: 200, assessmentFee: 25, estimatedDuration: '2-3 hours', providerIds: ['prov15', 'prov16'] },
  { id: 'job30', categoryId: 'cat5', name: 'Wells', description: 'Well digging and water well maintenance', icon: 'water', color: '#3498DB', basePrice: 800, assessmentFee: 100, estimatedDuration: '2-5 days', providerIds: ['prov15'] },
  { id: 'job31', categoryId: 'cat5', name: 'Pumps', description: 'Water pump installation and repair', icon: 'water', color: '#3498DB', basePrice: 350, assessmentFee: 50, estimatedDuration: '2-4 hours', providerIds: ['prov16'] },
  { id: 'job32', categoryId: 'cat5', name: 'Bowser', description: 'Water bowser supply and delivery', icon: 'water', color: '#3498DB', basePrice: 400, assessmentFee: 0, estimatedDuration: '1-2 hours', providerIds: ['prov15', 'prov16'] },

  // Travel (cat6) — prov17-prov18
  { id: 'job33', categoryId: 'cat6', name: 'Biker', description: 'Motorbike taxi and quick delivery', icon: 'bicycle', color: '#2ECC71', basePrice: 40, assessmentFee: 0, estimatedDuration: '30-60 mins', providerIds: ['prov17', 'prov18'] },
  { id: 'job34', categoryId: 'cat6', name: 'Car Driver', description: 'Hire a car with driver for trips', icon: 'car', color: '#2ECC71', basePrice: 150, assessmentFee: 0, estimatedDuration: 'As needed', providerIds: ['prov18'] },
  { id: 'job35', categoryId: 'cat6', name: 'Mechanic', description: 'On-the-road vehicle repair assistance', icon: 'settings', color: '#2ECC71', basePrice: 300, assessmentFee: 25, estimatedDuration: '1-3 hours', providerIds: ['prov17'] },
  { id: 'job36', categoryId: 'cat6', name: 'Vans', description: 'Van hire for goods transport and moving', icon: 'car', color: '#2ECC71', basePrice: 500, assessmentFee: 0, estimatedDuration: 'As needed', providerIds: ['prov17', 'prov18'] },

  // Personal Care (cat7) — prov19
  { id: 'job37', categoryId: 'cat7', name: 'Dentist', description: 'Dental consultation and treatment', icon: 'medkit', color: '#E91E8C', basePrice: 300, assessmentFee: 0, estimatedDuration: '1 hour', providerIds: ['prov19'] },
  { id: 'job38', categoryId: 'cat7', name: 'Doctor', description: 'General medical consultation at home', icon: 'medkit', color: '#E91E8C', basePrice: 400, assessmentFee: 0, estimatedDuration: '1 hour', providerIds: ['prov19'] },

  // Hair Dresser (cat8) — prov20-prov21
  { id: 'job39', categoryId: 'cat8', name: 'Braider', description: 'Professional hair braiding services', icon: 'cut', color: '#9B59B6', basePrice: 200, assessmentFee: 0, estimatedDuration: '2-4 hours', providerIds: ['prov20', 'prov21'] },
  { id: 'job40', categoryId: 'cat8', name: 'Wig Maintenance', description: 'Wig washing, styling and upkeep', icon: 'cut', color: '#9B59B6', basePrice: 120, assessmentFee: 0, estimatedDuration: '1-2 hours', providerIds: ['prov20'] },
  { id: 'job41', categoryId: 'cat8', name: 'Wigs', description: 'Wig selection, fitting and styling', icon: 'cut', color: '#9B59B6', basePrice: 300, assessmentFee: 0, estimatedDuration: '1-2 hours', providerIds: ['prov21'] },
  { id: 'job42', categoryId: 'cat8', name: 'Installation', description: 'Wig installation and securing service', icon: 'build', color: '#9B59B6', basePrice: 180, assessmentFee: 0, estimatedDuration: '1-2 hours', providerIds: ['prov20', 'prov21'] },
  { id: 'job43', categoryId: 'cat8', name: 'Nails Acrylic', description: 'Acrylic nail application and design', icon: 'hand-right', color: '#9B59B6', basePrice: 150, assessmentFee: 0, estimatedDuration: '1-2 hours', providerIds: ['prov21'] },
  { id: 'job44', categoryId: 'cat8', name: 'Wash', description: 'Professional hair wash and treatment', icon: 'water', color: '#9B59B6', basePrice: 80, assessmentFee: 0, estimatedDuration: '45 mins', providerIds: ['prov20'] },
  { id: 'job45', categoryId: 'cat8', name: 'Blow Dry', description: 'Hair blow drying and styling', icon: 'refresh', color: '#9B59B6', basePrice: 100, assessmentFee: 0, estimatedDuration: '1 hour', providerIds: ['prov20', 'prov21'] },

  // Health (cat9) — prov22-prov24
  { id: 'job46', categoryId: 'cat9', name: 'Dentist', description: 'Dental care, check-up and treatment', icon: 'medkit', color: '#16A085', basePrice: 350, assessmentFee: 0, estimatedDuration: '1 hour', providerIds: ['prov22', 'prov23'] },
  { id: 'job47', categoryId: 'cat9', name: 'Doctor', description: 'Home visit doctor consultation', icon: 'medkit', color: '#16A085', basePrice: 500, assessmentFee: 0, estimatedDuration: '1-2 hours', providerIds: ['prov23', 'prov24'] },
  { id: 'job48', categoryId: 'cat9', name: 'Pharmacy', description: 'Prescription delivery and medication supply', icon: 'medkit', color: '#16A085', basePrice: 100, assessmentFee: 0, estimatedDuration: '30 mins', providerIds: ['prov22'] },
  { id: 'job49', categoryId: 'cat9', name: 'Hospital', description: 'Hospital referral and care coordination', icon: 'medkit', color: '#16A085', basePrice: 600, assessmentFee: 0, estimatedDuration: '2-4 hours', providerIds: ['prov24'] },

  // Decorator (cat10) — prov25
  { id: 'job50', categoryId: 'cat10', name: 'Painter', description: 'Professional painting and decoration services', icon: 'brush', color: '#D35400', basePrice: 350, assessmentFee: 50, estimatedDuration: '1-2 days', providerIds: ['prov25'] },

  // Solar/Renewables (cat11) — prov26-prov27
  { id: 'job51', categoryId: 'cat11', name: 'Installer', description: 'Solar and renewable energy system installation', icon: 'sunny', color: '#F1C40F', basePrice: 2500, assessmentFee: 100, estimatedDuration: '1-2 days', providerIds: ['prov26', 'prov27'] },
  { id: 'job52', categoryId: 'cat11', name: 'Maintenance', description: 'Solar system maintenance and panel cleaning', icon: 'build', color: '#F1C40F', basePrice: 200, assessmentFee: 25, estimatedDuration: '2-3 hours', providerIds: ['prov26'] },
  { id: 'job53', categoryId: 'cat11', name: 'Wind', description: 'Wind turbine installation and repair', icon: 'refresh', color: '#F1C40F', basePrice: 3000, assessmentFee: 150, estimatedDuration: '2-3 days', providerIds: ['prov27'] },
  { id: 'job54', categoryId: 'cat11', name: 'Hydro/Water', description: 'Micro-hydro power system installation', icon: 'water', color: '#F1C40F', basePrice: 3500, assessmentFee: 200, estimatedDuration: '3-5 days', providerIds: ['prov26', 'prov27'] },
];

const PROVIDER_NAMES = [
  'Mohamed Sesay', 'Fatmata Bangura', 'Ibrahim Kamara', 'Aminata Conteh',
  'Saidu Turay', 'Kelfala Koroma', 'Hawanatu Koroma', 'Abu Bakarr Jalloh',
  'Foday Mansaray', 'Isatu Gbla', 'Moses Komeh', 'Santigie Sankoh',
  'Muctarr Conteh', 'Kadiatu Mansaray', 'Brima Alpha', 'Sheku Mansaray',
  'Fatama Kargbo', 'Mariama Conteh', 'Zainab Tarawally', 'Rugiatu Kamara',
  'Adama Bangura', 'Dr. Aisha Sesay', 'Nurse Fanta Komeh', 'Lansana Fofanah',
  'Joseph Sesay', 'Alpha Conteh', 'Morie Kamara',
];

const PHOTOS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-543f23a32550?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1521119989659-a83eee48700e?w=200&h=200&fit=crop&crop=face',
];

const BIOS = [
  'Experienced professional dedicated to quality service. I take pride in my work and ensure every client is satisfied.',
  'Trusted local expert with years of experience. I provide reliable, affordable service with attention to detail.',
  'Verified provider committed to excellence. Fast, thorough, and professional — every time.',
  'Hardworking and detail-oriented. I treat every job as if it were my own home.',
  'Skilled tradesperson with a passion for quality. Satisfaction guaranteed on every job.',
];

const AREAS = ['Freetown', 'Bo', 'Kenema', 'Makeni', 'Koidu', 'Lunsar'];

const BADGES: Array<'NEW' | 'RISING_STAR' | 'VERIFIED_PRO' | 'MASTER'> = ['NEW', 'RISING_STAR', 'VERIFIED_PRO', 'MASTER'];

export const PROVIDERS: ProviderProfile[] = PROVIDER_NAMES.map((name, i) => {
  const categoryIds = SERVICE_JOBS.filter(j => j.providerIds.includes(`prov${i + 1}`)).map(j => j.categoryId);
  const uniqueCategoryIds = [...new Set(categoryIds)];
  const completedJobs = Math.floor(Math.random() * 200) + 5;
  const totalReviews = Math.floor(completedJobs * 0.7);
  const overallRating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
  const badgeIndex = completedJobs > 150 ? 3 : completedJobs > 50 ? 2 : completedJobs > 15 ? 1 : 0;

  return {
    id: `prov${i + 1}`,
    userId: `user_prov${i + 1}`,
    name,
    bio: BIOS[i % BIOS.length],
    experienceYears: Math.floor(Math.random() * 15) + 1,
    approvalStatus: 'APPROVED',
    providerTier: i % 3 === 0 ? 'GOLD' : i % 2 === 0 ? 'SILVER' : 'BRONZE',
    overallRating,
    totalReviews,
    completedJobs,
    badgeLevel: BADGES[badgeIndex],
    profilePhoto: PHOTOS[i % PHOTOS.length],
    serviceAreas: [AREAS[i % AREAS.length], AREAS[(i + 2) % AREAS.length]],
    serviceCategoryIds: uniqueCategoryIds.length > 0 ? uniqueCategoryIds : [CATEGORIES[i % CATEGORIES.length].id],
    responseTime: `${Math.floor(Math.random() * 30) + 5} mins`,
    verified: badgeIndex >= 2,
  };
});

const BOOKING_STATUSES: Array<'REQUESTED' | 'ACCEPTED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED' | 'CANCELLED' | 'DISPUTED'> = [
  'COMPLETED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REQUESTED', 'EN_ROUTE', 'COMPLETED', 'DECLINED',
];

const BOOKING_NOTES = [
  'Please call when you arrive — the gate bell is broken.',
  'Gate code 4521. Park by the blue wall.',
  'Bring a ladder; ours is broken.',
  'Dog on premises — will be kept inside.',
  'Water is off between 10am and noon.',
];

export const BOOKINGS: Booking[] = Array.from({ length: 12 }, (_, i) => {
  const job = SERVICE_JOBS[i % SERVICE_JOBS.length];
  const provider = PROVIDERS[i % PROVIDERS.length];
  const status = BOOKING_STATUSES[i % BOOKING_STATUSES.length];
  const finalPrice = job.basePrice + (i % 3) * 50;
  const platformCommission = Math.round(finalPrice * 0.15);
  const serviceFee = 25;
  const providerPayout = finalPrice - platformCommission - serviceFee;
  const isCompleted = status === 'COMPLETED';
  const createdAt = new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString();
  const scheduledDate = new Date(Date.now() + (i - 4) * 86400000).toISOString();

  return {
    id: `book${i + 1}`,
    customerId: 'user_me',
    customerName: 'You',
    providerId: provider.id,
    providerName: provider.name,
    providerPhoto: provider.profilePhoto,
    serviceJobId: job.id,
    serviceJobName: job.name,
    serviceJobIcon: job.icon,
    serviceJobColor: job.color,
    status,
    bookingType: i % 3 === 0 ? 'IN_PERSON_QUOTE' : 'INSTANT',
    quotedPrice: i % 3 === 0 ? finalPrice : undefined,
    finalPrice,
    serviceFee,
    platformCommission,
    providerPayout,
    scheduledDate,
    address: `${i + 5} Wilkinson Road, Freetown`,
    notes: i % 3 === 1 ? BOOKING_NOTES[i % BOOKING_NOTES.length] : undefined,
    paymentMethod: i % 2 === 0 ? 'ORANGE_MONEY' : 'AFRICELL_MONEY',
    paymentStatus: isCompleted ? 'RELEASED' : status === 'REQUESTED' || status === 'DECLINED' || status === 'CANCELLED' ? 'PENDING' : 'HELD_IN_ESCROW',
    createdAt,
    completedAt: isCompleted ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
    hasReview: isCompleted && i % 2 === 0,
  };
});

export const REVIEWS: Review[] = BOOKINGS.filter(b => b.hasReview).map((b, i) => {
  const timeliness = Math.floor(Math.random() * 2) + 4;
  const professionalism = Math.floor(Math.random() * 2) + 4;
  const quality = Math.floor(Math.random() * 2) + 4;
  const communication = Math.floor(Math.random() * 2) + 4;
  const overall = Math.round(((timeliness + professionalism + quality + communication) / 4) * 10) / 10;
  const comments = [
    'Excellent service! Very professional and on time. Highly recommended.',
    'Great work, very satisfied with the result. Will book again.',
    'Good job overall, arrived a bit late but the quality made up for it.',
    'Fantastic experience from start to finish. The provider was skilled and courteous.',
    'Reliable and efficient. I will definitely use this service again.',
  ];
  return {
    id: `rev${i + 1}`,
    bookingId: b.id,
    customerId: b.customerId,
    customerName: 'Mariama Conteh',
    customerPhoto: PHOTOS[3],
    providerId: b.providerId,
    timeliness,
    professionalism,
    quality,
    communication,
    overall,
    comment: comments[i % comments.length],
    createdAt: b.completedAt ?? new Date().toISOString(),
    status: 'VISIBLE',
  };
});

export const ADVERTS: Advertisement[] = [
  {
    id: 'ad1',
    title: 'Get 20% off your first booking',
    subtitle: 'New customers save on all house care services',
    ctaText: 'Book Now',
    gradient: ['#1A3C6E', '#2A5494'],
    icon: 'gift',
    slot: 1,
    sortOrder: 1,
    active: true,
    backgroundType: 'image',
    backgroundImage: 'https://r2-pub.rork.com/attachments/tjcbefupwlbgqayae3xhg.png',
    overlayOpacity: 0.55,
    textPosition: 'bottom',
    linkRoute: '/category/cat1',
  },
  {
    id: 'ad2',
    title: 'Gold Members get priority booking',
    subtitle: 'Upgrade to Gold and skip the queue',
    ctaText: 'Upgrade',
    gradient: ['#D4AF37', '#F1C40F'],
    icon: 'trophy',
    slot: 2,
    sortOrder: 2,
    active: true,
    backgroundType: 'image',
    backgroundImage: 'https://r2-pub.rork.com/attachments/jffsmgryqklboj4kncnk7.png',
    overlayOpacity: 0.55,
    textPosition: 'bottom',
    linkRoute: '/subscriptions',
  },
  {
    id: 'ad3',
    title: 'Verified local pros at your door',
    subtitle: 'Book trusted providers across Sierra Leone',
    ctaText: 'Explore',
    gradient: ['#16A085', '#2ECC71'],
    icon: 'shield-checkmark',
    slot: 3,
    sortOrder: 3,
    active: true,
    backgroundType: 'gradient',
    overlayOpacity: 0.35,
    textPosition: 'bottom',
  },
];

const messageTemplates = [
  { text: 'Hello! I have received your booking request.', sender: 'provider' },
  { text: 'Great, when can you come?', sender: 'customer' },
  { text: 'I can be there tomorrow morning at 9 AM. Does that work?', sender: 'provider' },
  { text: 'Yes, that works perfectly.', sender: 'customer' },
  { text: 'Perfect. I will bring all the necessary tools.', sender: 'provider' },
  { text: 'I am on my way now. ETA 15 minutes.', sender: 'provider' },
  { text: 'Thank you for the great service!', sender: 'customer' },
];

export const MESSAGES_BY_BOOKING: Record<string, Message[]> = Object.fromEntries(
  BOOKINGS.slice(0, 6).map((b, i) => {
    const count = 3 + (i % 4);
    const msgs: Message[] = Array.from({ length: count }, (_, j) => {
      const template = messageTemplates[j % messageTemplates.length];
      const isProvider = template.sender === 'provider';
      return {
        id: `msg_${b.id}_${j}`,
        bookingId: b.id,
        senderId: isProvider ? b.providerId : b.customerId,
        senderName: isProvider ? b.providerName : b.customerName,
        senderRole: isProvider ? 'PROVIDER' : 'CUSTOMER',
        text: template.text,
        isRead: isProvider ? true : i % 3 !== 0 || j < count - 2,
        createdAt: new Date(Date.now() - (count - j) * 3600000).toISOString(),
      };
    });
    return [b.id, msgs];
  })
);

export const CONVERSATIONS: Conversation[] = BOOKINGS.filter(b => b.status !== 'DECLINED' && b.status !== 'CANCELLED').slice(0, 6).map((b, i) => {
  const messages = MESSAGES_BY_BOOKING[b.id] ?? [];
  const lastMsg = messages[messages.length - 1];
  return {
    id: `conv${i + 1}`,
    bookingId: b.id,
    providerId: b.providerId,
    providerName: b.providerName,
    providerPhoto: b.providerPhoto,
    customerName: b.customerName,
    serviceJobName: b.serviceJobName,
    lastMessage: lastMsg?.text ?? 'No messages yet',
    lastMessageAt: lastMsg?.createdAt ?? b.createdAt,
    unreadCount: i % 3 === 0 ? 2 : 0,
  };
});

export const LOYALTY: LoyaltyInfo = {
  balance: 850,
  totalEarned: 1200,
  totalRedeemed: 350,
};

export const POINT_TRANSACTIONS: PointTransaction[] = [
  { id: 'pt1', type: 'EARNED', amount: 100, description: 'Completed booking: Deep House Cleaning', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'pt2', type: 'EARNED', amount: 75, description: 'Completed booking: Car Wash', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'pt3', type: 'REDEEMED', amount: -200, description: 'Discount on booking: Plumbing Repair', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 'pt4', type: 'BONUS', amount: 100, description: 'Welcome bonus', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'pt5', type: 'EARNED', amount: 50, description: 'Completed booking: Package Delivery', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

export const SUBSCRIPTIONS: Subscription[] = [
  {
    tier: 'BRONZE',
    startDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 300).toISOString(),
    isActive: true,
    monthlyFee: 25,
    benefits: ['5% discount on bookings', 'Standard support', 'Basic loyalty points'],
  },
  {
    tier: 'SILVER',
    startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 330).toISOString(),
    isActive: false,
    monthlyFee: 50,
    benefits: ['10% discount on bookings', 'Priority support', '2x loyalty points', 'Free assessment fees'],
  },
  {
    tier: 'GOLD',
    startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 330).toISOString(),
    isActive: false,
    monthlyFee: 100,
    benefits: ['15% discount on bookings', 'Priority booking', '3x loyalty points', 'Free assessment fees', 'Dedicated support agent'],
  },
];

export const TRANSACTIONS: Transaction[] = BOOKINGS.map((b, i) => ({
  id: `txn${i + 1}`,
  amount: b.finalPrice,
  type: 'PAYMENT',
  description: `${b.serviceJobName} - ${b.providerName}`,
  paymentMethod: b.paymentMethod,
  status: b.paymentStatus,
  createdAt: b.createdAt,
}));

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Booking Accepted', body: 'Your booking for Deep House Cleaning has been accepted.', type: 'BOOKING', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n2', title: 'New Message', body: 'Mohamed Sesay: I am on my way now. ETA 15 minutes.', type: 'MESSAGE', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n3', title: 'Payment Released', body: 'Payment of NLe 250 has been released to the provider.', type: 'PAYMENT', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n4', title: 'Review Reminder', body: 'Please rate your completed booking.', type: 'REVIEW', isRead: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'n5', title: 'Loyalty Points Earned', body: 'You earned 100 points for completing a booking!', type: 'SYSTEM', isRead: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
];

export const PROVIDER_SUGGESTIONS: ProviderSuggestion[] = [
  { id: 'ps1', name: 'Abdul Rahman', phone: '+232 76 123456', serviceCategory: 'Electrical', notes: 'Great electrician in Freetown, very reliable.', status: 'PENDING', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'ps2', name: 'Gladys Williams', phone: '+232 77 654321', serviceCategory: 'Personal Care', notes: 'Excellent massage therapist, works in Bo.', status: 'CONTACTED', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

// Admin data
export const ADMIN_PENDING_PROVIDERS = PROVIDERS.slice(0, 4).map((p, i) => ({
  ...p,
  id: `pending_${i + 1}`,
  approvalStatus: 'PENDING' as const,
  completedJobs: 0,
  totalReviews: 0,
  overallRating: 0,
}));

export const ADMIN_REVENUE = {
  totalRevenue: 45680,
  commissionEarned: 6852,
  activeBookings: 34,
  completedBookings: 280,
  totalUsers: 1240,
  totalProviders: 87,
  monthlyGrowth: 18.5,
  recentTransactions: TRANSACTIONS.slice(0, 6),
};

// Helper functions
export function formatNLe(amount: number): string {
  return `NLe ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function getCategoryById(id: string): ServiceCategory | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getJobsByCategory(categoryId: string): ServiceJob[] {
  return SERVICE_JOBS.filter(j => j.categoryId === categoryId);
}

export function getJobById(id: string): ServiceJob | undefined {
  return SERVICE_JOBS.find(j => j.id === id);
}

export function getProvidersForJob(jobId: string): ProviderProfile[] {
  const job = getJobById(jobId);
  if (!job) return [];
  return PROVIDERS.filter(p => job.providerIds.includes(p.id));
}

export function getProviderById(id: string): ProviderProfile | undefined {
  return PROVIDERS.find(p => p.id === id);
}

export function getReviewsForProvider(providerId: string): Review[] {
  return REVIEWS.filter(r => r.providerId === providerId);
}

export function getBookingsForProvider(providerId: string): Booking[] {
  return BOOKINGS.filter(b => b.providerId === providerId);
}

export function getConversationById(id: string): Conversation | undefined {
  return CONVERSATIONS.find(c => c.id === id);
}

export function getMessagesForBooking(bookingId: string): Message[] {
  return MESSAGES_BY_BOOKING[bookingId] ?? [];
}

export const DEMO_USER: User = {
  id: 'user_me',
  email: 'mariama@gmail.com',
  phone: '+232 76 123 456',
  phones: [{ id: 'phone_demo_1', phone: '+232 76 123 456', label: 'Main', isPrimary: true, createdAt: new Date(Date.now() - 86400000 * 90).toISOString() }],
  name: 'Mariama Conteh',
  role: 'CUSTOMER',
  accountType: 'PRIVATE',
  approvalStatus: 'APPROVED',
  profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
};

export const DEMO_PROVIDER_USER: User = {
  id: 'user_prov1',
  email: 'mohamed@gmail.com',
  phone: '+232 77 555 123',
  phones: [{ id: 'phone_prov_1', phone: '+232 77 555 123', label: 'Main', isPrimary: true, createdAt: new Date(Date.now() - 86400000 * 180).toISOString() }],
  name: 'Mohamed Sesay',
  role: 'PROVIDER',
  accountType: 'BUSINESS',
  businessName: 'Sesay Home Care Services',
  approvalStatus: 'APPROVED',
  profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
};

export const ADMIN_USER: User = {
  id: 'user_admin',
  email: 'admin@epas.sl',
  phone: '+232 78 000 000',
  phones: [{ id: 'phone_admin_1', phone: '+232 78 000 000', label: 'Main', isPrimary: true, createdAt: new Date(Date.now() - 86400000 * 365).toISOString() }],
  name: 'Admin Console',
  role: 'ADMIN',
  accountType: 'BUSINESS',
  businessName: 'ePaS Administration',
  approvalStatus: 'APPROVED',
  createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
};

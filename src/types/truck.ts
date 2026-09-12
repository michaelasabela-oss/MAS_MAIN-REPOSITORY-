export type TruckId = 
  | 'forward-6w' 
  | 'giga-10w' 
  | 'titan-18w' 
  | 'lowbed-heavy' 
  | 'tanker-12w'
  | 'isuzu-giga-2026'
  | 'fuso-supergreat-2026'
  | 'scania-770s-2026'
  | 'volvo-fh16-2026'
  | 'hino-profia-2026';

export interface TruckModel {
  id: TruckId;
  name: string;
  brand?: string;
  yearModel?: number;
  techBadge?: string;
  tagline: string;
  category: 'Light Heavy' | 'Medium Hauler' | 'Articulated Semi' | 'Heavy Equipment' | 'Liquid Bulk';
  baseHorsepower: number;
  baseTorque: number; // Nm
  axles: number;
  payloadCapacityTons: number;
  hasTrailer: boolean;
  trailerLength: number; // in simulation units
  unlocked: boolean;
  pricePhp: number;
  description: string;
  color: string;
  decal: string;
  hornType: 'nautical' | 'dual-air' | 'pinoy-melodic';
  engineLevel: number;
  brakesLevel: number;
  suspensionLevel: number;
  tiresLevel: number;
  model3DType?: 'aero_cab' | 'v8_streamline' | 'curved_nose' | 'hybrid_tanker' | 'wingvan' | 'dropside' | 'heavy_prime';
}

export type CargoCategory = 'dry_goods' | 'cold_chain' | 'fragile_tech' | 'hazardous_fuel' | 'heavy_construction';

export interface CargoItem {
  id: string;
  name: string;
  nameTagalog: string;
  category: CargoCategory;
  origin: string;
  destination: string;
  weightTons: number;
  valuePhp: number;
  fragility: 'low' | 'medium' | 'high';
  requiredTempCelsius?: number; // for cold chain
  iconName: string;
  description: string;
  educationalTip: string;
}

export interface PhilippineRoute {
  id: string;
  name: string;
  region: 'Metro Manila' | 'Luzon' | 'Visayas' | 'Mindanao';
  distanceKm: number;
  terrainType: 'Urban Highway' | 'Mountain Zigzag' | 'Expressway Tollway' | 'Coastal Province' | 'Rural Dirt';
  difficulty: 'Easy' | 'Medium' | 'Challenging' | 'Extreme';
  speedLimitKmh: number;
  hasTolls: boolean;
  tollCostPhp: number;
  description: string;
  landmarks: string[];
  weather: 'sunny' | 'rainy' | 'foggy' | 'night';
  waypoints: Array<{ x: number; y: number; label?: string; hasHazard?: boolean; hazardType?: string }>;
}

export interface TripLog {
  id: string;
  timestamp: number;
  dateString: string;
  truckName: string;
  routeName: string;
  cargoName: string;
  cargoWeightTons: number;
  distanceKm: number;
  payoutPhp: number;
  fuelUsedLiters: number;
  safetyScore: number; // 0 - 100%
  status: 'Completed' | 'Delayed' | 'Damaged';
  notes: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  titleTagalog: string;
  description: string;
  rewardPhp: number;
  rewardXp: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  type: 'deliveries' | 'mechanics' | 'cargo_sort' | 'safety';
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  location: string;
  truckModel: string;
  deliveriesCompleted: number;
  cargoTons: number;
  safetyRating: number; // percentage
  earningsPhp: number;
}

export interface UserProfile {
  name: string;
  companyName: string;
  licenseRank: 'Student Driver' | 'Non-Professional' | 'Professional Code 2/3' | 'Master Articulated Code 8';
  level: number;
  xp: number;
  cashPhp: number;
  safetyScore: number;
  streakDays: number;
  lastLoginDate: string;
  darkMode: boolean;
  language: 'en' | 'tl' | 'ceb' | 'ilo';
  audioVolume: number;
  soundEnabled: boolean;
  offlineSyncStatus: 'synced' | 'pending' | 'offline';
  securityPin: string | null;
  activeTruckId: TruckId;
  subscriptionTier: SubscriptionTier;
  subscriptionRenewsAt?: string;
  hasAdFree: boolean;
  activeAds: BillboardAd[];
}

export type SubscriptionTier = 'free' | 'ad_free_pro' | 'billboard_advertiser';

export interface BillboardAd {
  id: string;
  brandName: string;
  tagline: string;
  targetHighway: string; // 'EDSA', 'NLEX', 'Kennon Road', 'Batangas Port', 'All Highways'
  bgColor: string;
  textColor: string;
  ctaText: string;
  impressionsCount: number;
  monthlyFeeUsd: number; // 10
  status: 'active' | 'paused';
  sponsoredBadge?: boolean;
}

export type AppView = 
  | 'driving' 
  | 'garage' 
  | 'cargo_master' 
  | 'mechanics_bay' 
  | 'freight_exchange' 
  | 'route_sandbox' 
  | 'dashboard' 
  | 'logs'
  | 'advertising';


import { UserProfile, TruckModel, TripLog, DailyChallenge, PhilippineRoute } from '../types/truck';
import { INITIAL_TRUCKS, DAILY_CHALLENGES } from '../data/philippineData';

const PROFILE_KEY = 'byaheng_pinoy_profile_v1';
const TRUCKS_KEY = 'byaheng_pinoy_trucks_v1';
const LOGS_KEY = 'byaheng_pinoy_triplogs_v1';
const CHALLENGES_KEY = 'byaheng_pinoy_challenges_v1';
const CUSTOM_ROUTES_KEY = 'byaheng_pinoy_custom_routes_v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Juan Dela Cruz',
  companyName: 'Luzon-Visayas Trans-Freight Services',
  licenseRank: 'Non-Professional',
  level: 1,
  xp: 150,
  cashPhp: 75000,
  safetyScore: 98,
  streakDays: 3,
  lastLoginDate: new Date().toISOString().split('T')[0],
  darkMode: true,
  language: 'en',
  audioVolume: 0.7,
  soundEnabled: true,
  offlineSyncStatus: 'synced',
  securityPin: null,
  activeTruckId: 'forward-6w',
  subscriptionTier: 'free',
  hasAdFree: false,
  subscriptionRenewsAt: undefined,
  activeAds: [
    {
      id: 'ad-001',
      brandName: 'Petron Blaze & Turbo Diesel',
      tagline: 'Clean Euro-5 Power for Baguio Kennon Climbs',
      targetHighway: 'All Highways',
      bgColor: '#1e3a8a',
      textColor: '#ffffff',
      ctaText: 'Refuel at Petron Batangas & NLEX',
      impressionsCount: 1420,
      monthlyFeeUsd: 10,
      status: 'active',
      sponsoredBadge: true,
    },
    {
      id: 'ad-002',
      brandName: 'San Miguel Logistics Co.',
      tagline: 'Nationwide Cold Chain Refrigerated Hauling',
      targetHighway: 'EDSA & Coastal',
      bgColor: '#b91c1c',
      textColor: '#ffffff',
      ctaText: 'Call Dispatch (02) 8632-2000',
      impressionsCount: 980,
      monthlyFeeUsd: 10,
      status: 'active',
      sponsoredBadge: true,
    },
    {
      id: 'ad-003',
      brandName: 'Baguio Highland Produce Guild',
      tagline: 'Fresh High-Altitude Vegetables Straight to Divisoria',
      targetHighway: 'Kennon Road',
      bgColor: '#14532d',
      textColor: '#ffffff',
      ctaText: 'Visit La Trinidad Trading Post',
      impressionsCount: 650,
      monthlyFeeUsd: 10,
      status: 'active',
      sponsoredBadge: true,
    },
  ],
};

export const INITIAL_LOGS: TripLog[] = [
  {
    id: 'log-001',
    timestamp: Date.now() - 86400000 * 2,
    dateString: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
    truckName: 'Isla Forward 6-Wheeler Dropside',
    routeName: 'Metro Manila: South Harbor to Balintawak',
    cargoName: 'Nueva Ecija Grain Rice Sacks (100 Sacks)',
    cargoWeightTons: 10,
    distanceKm: 22,
    payoutPhp: 28000,
    fuelUsedLiters: 9.4,
    safetyScore: 97,
    status: 'Completed',
    notes: 'Smooth delivery through C5 bypass. All sacks arrived dry without water seepage.',
  },
  {
    id: 'log-002',
    timestamp: Date.now() - 86400000 * 1,
    dateString: new Date(Date.now() - 86400000 * 1).toLocaleDateString(),
    truckName: 'Isla Forward 6-Wheeler Dropside',
    routeName: 'Central Luzon: NLEX Balintawak to Subic Bay',
    cargoName: 'Calabarzon Semiconductor Silicon Wafers',
    cargoWeightTons: 6,
    distanceKm: 85,
    payoutPhp: 120000,
    fuelUsedLiters: 24.2,
    safetyScore: 99,
    status: 'Completed',
    notes: 'Maintained smooth deceleration over Candaba viaduct expansion joints.',
  },
];

export const storageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    } catch {}
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  },

  getTrucks(): TruckModel[] {
    try {
      const data = localStorage.getItem(TRUCKS_KEY);
      if (data) {
        const stored: TruckModel[] = JSON.parse(data);
        const storedIds = new Set(stored.map(t => t.id));
        const missing = INITIAL_TRUCKS.filter(t => !storedIds.has(t.id));
        if (missing.length > 0) {
          const combined = [...stored, ...missing];
          localStorage.setItem(TRUCKS_KEY, JSON.stringify(combined));
          return combined;
        }
        return stored;
      }
    } catch {}
    return INITIAL_TRUCKS;
  },

  saveTrucks(trucks: TruckModel[]): void {
    try {
      localStorage.setItem(TRUCKS_KEY, JSON.stringify(trucks));
    } catch {}
  },

  getTripLogs(): TripLog[] {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_LOGS;
  },

  saveTripLogs(logs: TripLog[]): void {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch {}
  },

  addTripLog(log: TripLog): void {
    const logs = this.getTripLogs();
    logs.unshift(log);
    this.saveTripLogs(logs);
  },

  getChallenges(): DailyChallenge[] {
    try {
      const data = localStorage.getItem(CHALLENGES_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return DAILY_CHALLENGES;
  },

  saveChallenges(challenges: DailyChallenge[]): void {
    try {
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
    } catch {}
  },

  getCustomRoutes(): PhilippineRoute[] {
    try {
      const data = localStorage.getItem(CUSTOM_ROUTES_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  saveCustomRoutes(routes: PhilippineRoute[]): void {
    try {
      localStorage.setItem(CUSTOM_ROUTES_KEY, JSON.stringify(routes));
    } catch {}
  },

  // Export full backup as JSON
  exportBackupJson(): string {
    const backup = {
      version: 1,
      exportDate: new Date().toISOString(),
      profile: this.getProfile(),
      trucks: this.getTrucks(),
      tripLogs: this.getTripLogs(),
      challenges: this.getChallenges(),
      customRoutes: this.getCustomRoutes(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import backup JSON
  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (data.trucks) this.saveTrucks(data.trucks);
      if (data.tripLogs) this.saveTripLogs(data.tripLogs);
      if (data.challenges) this.saveChallenges(data.challenges);
      if (data.customRoutes) this.saveCustomRoutes(data.customRoutes);
      return true;
    } catch {
      return false;
    }
  },

  // Export Past Trip Logs as CSV file
  exportLogsToCSV(logs: TripLog[]): string {
    const headers = ['ID', 'Date', 'Truck', 'Route', 'Cargo', 'Weight (Tons)', 'Distance (Km)', 'Earnings (PHP)', 'Fuel (L)', 'Safety (%)', 'Status', 'Notes'];
    const rows = logs.map(l => [
      l.id,
      `"${l.dateString}"`,
      `"${l.truckName}"`,
      `"${l.routeName}"`,
      `"${l.cargoName}"`,
      l.cargoWeightTons,
      l.distanceKm,
      l.payoutPhp,
      l.fuelUsedLiters,
      l.safetyScore,
      l.status,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },
};

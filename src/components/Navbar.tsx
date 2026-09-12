import React from 'react';
import { 
  Truck, 
  Wrench, 
  Package, 
  TrendingUp, 
  Map, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Cloud, 
  CloudOff, 
  Radio, 
  Settings, 
  Palette,
  FileText,
  Megaphone
} from 'lucide-react';
import { AppView, UserProfile } from '../types/truck';
import { TRANSLATIONS } from '../data/translations';
import { truckAudio } from '../services/audioService';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenDispatcher: () => void;
  onOpenSettings: () => void;
  isOffline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  profile,
  setProfile,
  onOpenDispatcher,
  onOpenSettings,
  isOffline,
}) => {
  const t = TRANSLATIONS[profile.language] || TRANSLATIONS.en;

  const toggleSound = () => {
    const nextSound = !profile.soundEnabled;
    truckAudio.setSoundEnabled(nextSound);
    setProfile(prev => ({ ...prev, soundEnabled: nextSound }));
  };

  const toggleDarkMode = () => {
    setProfile(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode }> = [
    { id: 'driving', label: t.driving, icon: <Truck className="w-4 h-4" /> },
    { id: 'garage', label: t.garage, icon: <Palette className="w-4 h-4" /> },
    { id: 'cargo_master', label: t.cargoMaster, icon: <Package className="w-4 h-4" /> },
    { id: 'mechanics_bay', label: t.mechanicsBay, icon: <Wrench className="w-4 h-4" /> },
    { id: 'freight_exchange', label: t.freightExchange, icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'route_sandbox', label: t.routeSandbox, icon: <Map className="w-4 h-4" /> },
    { id: 'dashboard', label: t.dashboard, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'logs', label: t.tripLogs, icon: <FileText className="w-4 h-4" /> },
    { id: 'advertising', label: 'Ads & Billboards ($10/mo)', icon: <Megaphone className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <header className={`w-full border-b transition-colors select-none ${
      profile.darkMode 
        ? 'bg-slate-900/95 border-slate-800 text-slate-100' 
        : 'bg-white/95 border-slate-200 text-slate-800'
    } backdrop-blur sticky top-0 z-40`}>
      {/* Top Bar: Brand, Stats, System Toggles */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-red-600 to-blue-600 text-white shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight leading-none">
                BYAHENG PINOY
              </h1>
              <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 uppercase">
                Sim & Logistics
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {profile.companyName}
            </p>
          </div>
        </div>

        {/* Status Pills: Money, Level, Cloud Sync, Quick Tools */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Cash Balance */}
          <div className={`px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 border ${
            profile.darkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <span>₱</span>
            <span>{profile.cashPhp.toLocaleString()}</span>
          </div>

          {/* License Rank */}
          <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
            profile.darkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span>🎖️ Lvl {profile.level}</span>
            <span className="text-slate-400">•</span>
            <span className="truncate max-w-[120px]">{profile.licenseRank}</span>
          </div>

          {/* $10/mo Subscription / Highway Billboard Portal Button */}
          <button
            onClick={() => setCurrentView('advertising')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition active:scale-95 ${
              profile.hasAdFree
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title="Free App Supported by Ads • $10/mo Ad-Free Pro or Highway Billboard Sponsorship"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>{profile.hasAdFree ? '★ Ad-Free Pro ($10/mo)' : 'Free Tier ($10/mo Ads)'}</span>
          </button>

          {/* Cloud / Offline Indicator */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition ${
              isOffline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
            }`}
            title="Cloud Save & Sync Status"
          >
            {isOffline ? <CloudOff className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isOffline ? 'Offline Mode' : 'Cloud Synced'}</span>
          </button>

          {/* Ask AI Dispatcher Kuya Jun */}
          <button
            onClick={onOpenDispatcher}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition active:scale-95"
            title="Radio Dispatcher Kuya Jun"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Dispatch Radio</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border transition ${
              profile.darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
            title={profile.soundEnabled ? 'Mute Engine Sounds' : 'Unmute Engine Sounds'}
          >
            {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Dark / Night Mode */}
          <button
            onClick={toggleDarkMode}
            className={`p-1.5 rounded-lg border transition ${
              profile.darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600'
            }`}
            title="Toggle Night Mode"
          >
            {profile.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className={`p-1.5 rounded-lg border transition ${
              profile.darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
            title="Settings, Languages & Cloud Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Navigation Scrollable Tabs */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : profile.darkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

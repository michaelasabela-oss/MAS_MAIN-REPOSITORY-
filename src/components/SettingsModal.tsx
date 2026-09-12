import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Cloud, 
  Download, 
  Upload, 
  Lock, 
  Bell, 
  ShieldCheck, 
  Check, 
  RefreshCw,
  CreditCard,
  Megaphone
} from 'lucide-react';
import { UserProfile } from '../types/truck';
import { storageService } from '../services/storageService';
import { truckAudio } from '../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onReloadData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  onReloadData,
}) => {
  const [syncCode, setSyncCode] = useState<string>('PINOY-TRUCK-9942-X');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLanguageChange = (lang: 'en' | 'tl' | 'ceb' | 'ilo') => {
    truckAudio.playWrenchClick();
    setProfile(prev => ({ ...prev, language: lang }));
  };

  const handleExportBackup = () => {
    truckAudio.playWrenchClick();
    const jsonStr = storageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `byaheng_pinoy_cloud_save_${Date.now()}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importBackupJson(content);
      if (success) {
        truckAudio.playSuccessChime();
        alert('Cloud backup restored successfully!');
        onReloadData();
        onClose();
      } else {
        truckAudio.playAirBrakeHiss();
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateSyncCode = () => {
    truckAudio.playWrenchClick();
    const code = `PINOY-${Math.floor(1000 + Math.random() * 9000)}-SYNC`;
    setSyncCode(code);
    navigator.clipboard?.writeText(code);
    alert(`Sync code ${code} copied! Use this on your other mobile/tablet device for instant cross-sync.`);
  };

  const handleSetPin = () => {
    if (pinInput.length === 4) {
      setProfile(prev => ({ ...prev, securityPin: pinInput }));
      setPinMessage('4-digit PIN security lock successfully activated!');
      truckAudio.playSuccessChime();
    } else {
      setPinMessage('Please enter a 4-digit numeric PIN.');
    }
  };

  const handleTestPushNotification = () => {
    truckAudio.playWrenchClick();
    setPushStatus('🔔 Alert: Kennon Road Zigzag lane closure for maintenance! Take Naguilian Road bypass.');
    setTimeout(() => setPushStatus(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full max-w-lg rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="font-bold text-base">Fleet Settings & Cloud Sync</h3>
              <p className="text-xs text-slate-400">Manage localization, offline saves, and security</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transient Push notification banner */}
        {pushStatus && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 animate-bounce">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{pushStatus}</span>
          </div>
        )}

        {/* 1. Language Localization */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Language Localization (Wika)</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { code: 'en', label: 'English (Default)' },
              { code: 'tl', label: 'Filipino / Tagalog' },
              { code: 'ceb', label: 'Sinugboanong Binisaya' },
              { code: 'ilo', label: 'Ilokano' },
            ].map(l => (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code as any)}
                className={`p-2.5 rounded-xl border text-left font-semibold transition flex items-center justify-between ${
                  profile.language === l.code
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{l.label}</span>
                {profile.language === l.code && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Cross-Device Cloud Sync & Backup */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Cross-Platform Cloud Sync Code</span>
          </label>
          <p className="text-[11px] text-slate-400">
            Keep your unlocked 18-wheelers, earned cash, and custom routes synchronized between your phone, tablet, and PC.
          </p>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700">
            <span className="font-mono font-bold text-emerald-400 text-sm tracking-wider">{syncCode}</span>
            <button
              onClick={handleGenerateSyncCode}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Copy Sync Code</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleExportBackup}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Save JSON</span>
            </button>

            <label className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Save JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>

        {/* 3. Account Privacy & Security PIN */}
        <div className="space-y-2 text-xs">
          <label className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Driver Account Security & Privacy PIN</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              maxLength={4}
              placeholder="Set 4-digit PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="w-32 p-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-center font-mono tracking-widest text-base"
            />
            <button
              onClick={handleSetPin}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Save PIN
            </button>
          </div>
          {pinMessage && <span className="text-[11px] text-emerald-400 block">{pinMessage}</span>}
        </div>

        {/* 4. Subscription & Highway Billboard Ad Monetization */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Subscription & Monetization Tier</span>
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              {profile.hasAdFree ? 'Pro Pass ($10/mo)' : 'Free (Ad-Supported)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Byaheng Pinoy is 100% free with highway sponsor billboards. You can upgrade to the Ad-Free Pro Tier ($10/mo) or launch your own roadside billboard.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                truckAudio.playSuccessChime();
                setProfile(prev => ({
                  ...prev,
                  hasAdFree: !prev.hasAdFree,
                  subscriptionTier: !prev.hasAdFree ? 'ad_free_pro' : 'free',
                }));
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                profile.hasAdFree
                  ? 'bg-red-600/20 text-red-300 border border-red-500/40 hover:bg-red-600/30'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow'
              }`}
            >
              {profile.hasAdFree ? 'Revert to Free Ad-Supported Tier' : 'Upgrade to Ad-Free ($10/mo)'}
            </button>
          </div>
        </div>

        {/* 5. Push Notifications Simulation */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-300 block">Highway Push Alerts</span>
            <span className="text-[10px] text-slate-400">Receive road closures and daily challenge reminders</span>
          </div>
          <button
            onClick={handleTestPushNotification}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700"
          >
            Test Push Alert
          </button>
        </div>
      </div>
    </div>
  );
};

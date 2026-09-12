import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Megaphone, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  Plus, 
  CreditCard, 
  ArrowRight, 
  Trash2, 
  Radio, 
  Tv, 
  Clock, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { UserProfile, BillboardAd, SubscriptionTier } from '../../types/truck';
import { truckAudio } from '../../services/audioService';

interface AdvertisingHubProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onGoDriving: () => void;
}

export const AdvertisingHub: React.FC<AdvertisingHubProps> = ({
  profile,
  setProfile,
  onGoDriving,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ad_free_pro' | 'create_billboard'>('overview');

  // Form state for creating a new custom $10/mo billboard campaign
  const [brandName, setBrandName] = useState<string>('Dela Cruz Heavy Haulers');
  const [tagline, setTagline] = useState<string>('24/7 Luzon Heavy Equipment & Container Moving');
  const [ctaText, setCtaText] = useState<string>('Call Dispatch: (02) 8920-TRUCK');
  const [targetHighway, setTargetHighway] = useState<string>('All Highways');
  const [bgColor, setBgColor] = useState<string>('#1e3a8a');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle subscribing to $10/mo Ad-Free Pro Tier
  const handleToggleAdFreePro = () => {
    truckAudio.playSuccessChime();
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    if (profile.hasAdFree) {
      // Cancel subscription
      setProfile(prev => ({
        ...prev,
        subscriptionTier: 'free',
        hasAdFree: false,
        subscriptionRenewsAt: undefined,
      }));
      alert('Subscription cancelled. Your account will revert to the Free Ad-Supported tier.');
    } else {
      // Subscribe to $10/mo Ad-Free Pro
      const renews = new Date();
      renews.setMonth(renews.getMonth() + 1);
      setProfile(prev => ({
        ...prev,
        subscriptionTier: 'ad_free_pro',
        hasAdFree: true,
        subscriptionRenewsAt: renews.toISOString().split('T')[0],
      }));
      alert('Mabuhay! Welcome to Pro Fleet Pass ($10/mo). All commercial ads removed, +25% contract bonus unlocked!');
    }
  };

  // Handle submitting new $10/mo Billboard Campaign
  const handleCreateBillboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !tagline.trim()) return;

    setIsSubmitting(true);
    truckAudio.playSuccessChime();
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });

    const newAd: BillboardAd = {
      id: `billboard-${Date.now()}`,
      brandName: brandName.trim(),
      tagline: tagline.trim(),
      targetHighway,
      bgColor,
      textColor,
      ctaText: ctaText.trim() || 'Contact Dealer',
      impressionsCount: 0,
      monthlyFeeUsd: 10,
      status: 'active',
      sponsoredBadge: false,
    };

    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        subscriptionTier: 'billboard_advertiser',
        activeAds: [newAd, ...prev.activeAds],
      }));
      setIsSubmitting(false);
      setActiveTab('overview');
      alert(`Success! Your "${brandName}" billboard campaign is now LIVE across Philippine highways ($10/mo)! Drivers on this highway corridor will now view your billboard.`);
    }, 600);
  };

  const handleRemoveAd = (adId: string) => {
    truckAudio.playWrenchClick();
    setProfile(prev => ({
      ...prev,
      activeAds: prev.activeAds.filter(a => a.id !== adId),
    }));
  };

  const totalMonthlySpend = (profile.hasAdFree ? 10 : 0) + 
    profile.activeAds.filter(a => !a.sponsoredBadge).length * 10;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Hero Banner */}
      <div className={`p-6 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-md flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Highway Advertising & Subscription Hub</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                100% Free Core App • $10/mo Ad Services
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Byaheng Pinoy is free to play for everyone. Upgrade to Ad-Free Pro for $10/mo or sponsor highway billboards!
            </p>
          </div>
        </div>

        {/* Current Subscription Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Plan</span>
            <span className="font-bold text-sm text-emerald-400">
              {profile.hasAdFree ? 'VIP Ad-Free Pro ($10/mo)' : 'Free Tier (Ad-Supported)'}
            </span>
          </div>
          {profile.subscriptionRenewsAt && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
              Renews: {profile.subscriptionRenewsAt}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Overview & Live Highway Billboards
        </button>
        <button
          onClick={() => setActiveTab('ad_free_pro')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'ad_free_pro'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ad-Free Pro Pass ($10/mo)</span>
        </button>
        <button
          onClick={() => setActiveTab('create_billboard')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'create_billboard'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Launch Highway Billboard ($10/mo)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ACTIVE HIGHWAY BILLBOARDS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Free vs Paid Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Tier Card */}
            <div className={`p-5 rounded-2xl border ${
              profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Default Plan</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                  FREE FOREVER
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100">Standard Driver Pass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enjoy full unlimited access to realistic Philippine driving physics, heavy truck garages, Kennon Road switchbacks, and Junior Mechanic educational games at zero cost. Supported by authentic highway brand billboards.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All Philippine Highway Corridors & Cargo Types</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Educational BLOWBAGETS & Cargo Weight Mini-Games</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Tv className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Features roadside highway sponsor billboards</span>
                </li>
              </ul>
            </div>

            {/* $10/mo Ad-Free & Advertiser Benefits */}
            <div className={`p-5 rounded-2xl border ${
              profile.hasAdFree 
                ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30' 
                : profile.darkMode 
                ? 'bg-slate-900 border-slate-800' 
                : 'bg-white border-slate-200'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">Premium Monetization</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                  $10.00 / MONTH
                </span>
              </div>
              <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Ad-Free Pro & Advertiser Sponsorship</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose between an ad-free driving experience with +25% payout boosts, OR place your brand's custom billboard across Philippine highways for $10/mo!
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('ad_free_pro')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{profile.hasAdFree ? 'Manage $10/mo Subscription' : 'Upgrade to Ad-Free ($10/mo)'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('create_billboard')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
                >
                  Create Billboard
                </button>
              </div>
            </div>
          </div>

          {/* Active Billboards in the Simulation */}
          <div className={`p-5 rounded-2xl border ${
            profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Active Highway Billboard Ads ({profile.activeAds.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  These banners are currently posted along Metro Manila and provincial highway corridors.
                </p>
              </div>

              <button
                onClick={onGoDriving}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Eye className="w-4 h-4" />
                <span>View Billboards in Driving Simulator</span>
              </button>
            </div>

            {/* Billboards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.activeAds.map(ad => (
                <div
                  key={ad.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col justify-between space-y-3 shadow-md"
                >
                  <div>
                    {/* Realistic Steel Highway Billboard Frame */}
                    <div 
                      className="p-4 rounded-xl border-4 border-slate-700 shadow-inner flex flex-col items-center justify-center text-center min-h-[120px] transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: ad.bgColor, color: ad.textColor }}
                    >
                      <span className="text-[9px] font-mono tracking-widest uppercase opacity-80 mb-1">
                        {ad.targetHighway}
                      </span>
                      <h4 className="font-black text-sm uppercase tracking-tight drop-shadow">
                        {ad.brandName}
                      </h4>
                      <p className="text-[11px] font-medium mt-1 drop-shadow opacity-95">
                        {ad.tagline}
                      </p>
                      <span className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur">
                        {ad.ctaText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        {ad.impressionsCount.toLocaleString()} views
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {ad.sponsoredBadge ? 'Partner Sponsor' : '$10/mo Paid Slot'}
                      </span>
                    </div>
                  </div>

                  {!ad.sponsoredBadge && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                      <span className="text-slate-500 text-[10px]">Monthly Billboard Fee: $10</span>
                      <button
                        onClick={() => handleRemoveAd(ad.id)}
                        className="text-red-400 hover:text-red-300 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Cancel Slot</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: $10/MO AD-FREE PRO SUBSCRIPTION TIER */}
      {activeTab === 'ad_free_pro' && (
        <div className={`max-w-2xl mx-auto p-6 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-6 shadow-xl`}>
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Byaheng Pinoy Pro Fleet Pass</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upgrade your driver carrier fleet for only <strong>$10 per month</strong>. Billed monthly, cancel anytime.
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-3xl font-black text-amber-400 font-mono">$10.00</span>
            <span className="text-slate-400 text-xs font-semibold"> / Month</span>
            <span className="block text-[11px] text-emerald-400 mt-1">
              {profile.hasAdFree ? '✓ You currently have this subscription active' : 'Includes 7-day risk-free trial'}
            </span>
          </div>

          {/* Feature List */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">100% Commercial Ad-Free Driving</span>
                <span className="text-slate-400 text-[11px]">
                  All roadside commercial advertising banners are replaced with scenic Philippine natural landmark murals (Mayon, Banaue, Tubbataha).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">+25% Freight Payout Multiplier</span>
                <span className="text-slate-400 text-[11px]">
                  Earn an extra 25% PHP on every completed delivery trip from the freight exchange board.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">VIP Gold Fleet Decals & Stainless Bullbars</span>
                <span className="text-slate-400 text-[11px]">
                  Unlock exclusive 24K Gold paint jobs and VIP Fleet Owner badges in the garage.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Unlimited Roadside Assistance</span>
                <span className="text-slate-400 text-[11px]">
                  Never run dry: free emergency diesel refills and free air compressor refills when stuck on remote mountain passes.
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleToggleAdFreePro}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2 ${
                profile.hasAdFree
                  ? 'bg-red-600/20 border border-red-500/50 text-red-300 hover:bg-red-600/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{profile.hasAdFree ? 'Cancel $10/mo Subscription' : 'Subscribe to Pro Pass ($10/mo)'}</span>
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Secure subscription simulation. Cancel anytime from Fleet Settings.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE & SPONSOR A HIGHWAY BILLBOARD ($10/MO) */}
      {activeTab === 'create_billboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleCreateBillboard} className={`p-6 rounded-2xl border ${
            profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } space-y-4 text-xs`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Megaphone className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Launch $10/mo Highway Billboard Campaign</h3>
              </div>
              <p className="text-slate-400 text-[11px]">
                Advertise your company, transport brand, or message to players driving on Philippine highways.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">Brand or Company Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. San Pedro Cold Logistics"
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-semibold focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">Billboard Slogan / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Fast, Reliable Inter-Island Freight"
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Call To Action (Contact)</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Call (02) 888-TRUCK"
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Target Highway Corridor</label>
                <select
                  value={targetHighway}
                  onChange={(e) => setTargetHighway(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-medium"
                >
                  <option value="All Highways">All Philippine Corridors</option>
                  <option value="EDSA & Metro Manila">EDSA & Metro Manila</option>
                  <option value="NLEX & SCTEX">NLEX / SCTEX Expressway</option>
                  <option value="Kennon Road Baguio">Kennon Road Baguio</option>
                  <option value="Batangas Port">Batangas Port & Maharlika</option>
                </select>
              </div>
            </div>

            {/* Billboard Color Themes */}
            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1.5">Billboard Color Palette</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { bg: '#1e3a8a', text: '#ffffff', label: 'Navy' },
                  { bg: '#b91c1c', text: '#ffffff', label: 'Crimson' },
                  { bg: '#14532d', text: '#ffffff', label: 'Emerald' },
                  { bg: '#d97706', text: '#ffffff', label: 'Amber' },
                  { bg: '#09090b', text: '#38bdf8', label: 'Cyber' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBgColor(item.bg);
                      setTextColor(item.text);
                    }}
                    className={`h-9 rounded-xl border flex items-center justify-center text-[10px] font-bold shadow ${
                      bgColor === item.bg ? 'ring-2 ring-emerald-400 border-white' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: item.bg, color: item.text }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Confirmation */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
              <div>
                <span className="font-bold block text-xs">Monthly Billboard Sponsorship</span>
                <span className="text-[10px] text-slate-400">Includes active rendering on the highway canvas</span>
              </div>
              <span className="font-mono font-black text-base text-emerald-400">$10 / mo</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Provisioning Billboard...' : 'Post Billboard ($10/mo Subscription)'}</span>
            </button>
          </form>

          {/* Live Preview Panel */}
          <div className={`p-6 rounded-2xl border ${
            profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } space-y-4 flex flex-col justify-between`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Live Highway Billboard Preview
              </span>

              {/* Billboard Rigging Visual */}
              <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center min-h-[260px] relative">
                {/* Spotlights */}
                <div className="flex justify-between w-64 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_12px_#fde047]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_12px_#fde047]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_12px_#fde047]" />
                </div>

                {/* Billboard Surface */}
                <div
                  className="w-full max-w-sm p-6 rounded-xl border-4 border-slate-600 shadow-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all duration-300"
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-80">
                    {targetHighway}
                  </span>
                  <h3 className="font-black text-lg uppercase tracking-tight drop-shadow-md">
                    {brandName || 'YOUR BRAND HERE'}
                  </h3>
                  <p className="text-xs font-medium max-w-xs drop-shadow opacity-95">
                    {tagline || 'Your promotional tagline and services'}
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] px-3 py-1 rounded-full bg-white/20 font-bold backdrop-blur">
                      {ctaText || 'Contact Us'}
                    </span>
                  </div>
                </div>

                {/* Steel Pillar Stand */}
                <div className="w-4 h-16 bg-slate-700 border-x border-slate-600 shadow" />
                <div className="w-24 h-2 bg-slate-800 rounded-full" />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 p-3 rounded-xl bg-slate-950 border border-slate-800">
              💡 <strong>Driver Visibility:</strong> When players drive on <em>{targetHighway}</em>, your steel billboard will appear towering on the right shoulder with authentic night spotlights!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

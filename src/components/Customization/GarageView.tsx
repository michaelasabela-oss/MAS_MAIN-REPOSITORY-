import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Palette, 
  Wrench, 
  Volume2, 
  Check, 
  Lock, 
  ShoppingBag, 
  ArrowUpRight, 
  Sparkles,
  Truck
} from 'lucide-react';
import { TruckModel, UserProfile, TruckId } from '../../types/truck';
import { COLOR_PALETTE, DECALS_LIST } from '../../data/philippineData';
import { truckAudio } from '../../services/audioService';

interface GarageViewProps {
  trucks: TruckModel[];
  setTrucks: React.Dispatch<React.SetStateAction<TruckModel[]>>;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSelectActiveTruck: (truckId: TruckId) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  trucks,
  setTrucks,
  profile,
  setProfile,
  onSelectActiveTruck,
}) => {
  const currentTruck = trucks.find(t => t.id === profile.activeTruckId) || trucks[0];
  const [selectedTruckId, setSelectedTruckId] = useState<TruckId>(currentTruck.id);
  const [fleetFilter, setFleetFilter] = useState<'all' | '2026' | 'classic'>('all');
  const selectedTruck = trucks.find(t => t.id === selectedTruckId) || currentTruck;

  const filteredTrucks = trucks.filter(t => {
    const is2026 = t.yearModel === 2026 || t.id.includes('2026');
    if (fleetFilter === '2026') return is2026;
    if (fleetFilter === 'classic') return !is2026;
    return true;
  });

  const handleBuyTruck = (truck: TruckModel) => {
    if (profile.cashPhp < truck.pricePhp) {
      truckAudio.playAirBrakeHiss();
      return;
    }
    truckAudio.playSuccessChime();
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    setProfile(prev => ({ ...prev, cashPhp: prev.cashPhp - truck.pricePhp }));
    setTrucks(prev => prev.map(t => (t.id === truck.id ? { ...t, unlocked: true } : t)));
  };

  const handleSelectActive = (truckId: TruckId) => {
    truckAudio.playWrenchClick();
    onSelectActiveTruck(truckId);
  };

  const handleChangeColor = (colorHex: string) => {
    truckAudio.playWrenchClick();
    setTrucks(prev => prev.map(t => (t.id === selectedTruck.id ? { ...t, color: colorHex } : t)));
  };

  const handleChangeDecal = (decalStr: string) => {
    truckAudio.playWrenchClick();
    setTrucks(prev => prev.map(t => (t.id === selectedTruck.id ? { ...t, decal: decalStr } : t)));
  };

  const handleUpgrade = (type: 'engineLevel' | 'brakesLevel' | 'suspensionLevel' | 'tiresLevel', cost: number) => {
    if (profile.cashPhp < cost || (selectedTruck[type] || 1) >= 5) {
      truckAudio.playAirBrakeHiss();
      return;
    }
    truckAudio.playSuccessChime();
    setProfile(prev => ({ ...prev, cashPhp: prev.cashPhp - cost }));
    setTrucks(prev => prev.map(t => (t.id === selectedTruck.id ? { ...t, [type]: (t[type] || 1) + 1 } : t)));
  };

  const testHorn = (type: 'nautical' | 'dual-air' | 'pinoy-melodic') => {
    truckAudio.playHorn(type);
    setTrucks(prev => prev.map(t => (t.id === selectedTruck.id ? { ...t, hornType: type } : t)));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-md flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <Palette className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Heavy Vehicle Customization Garage</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                Pinoy Custom Bodyworks
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Equip Philippine stainless steel art, tune diesel torque, and upgrade pneumatic air brakes!
            </p>
          </div>
        </div>

        {/* Current balance */}
        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono font-bold text-emerald-400 text-sm">
          Cash: ₱{profile.cashPhp.toLocaleString()}
        </div>
      </div>

      {/* Fleet Filter Tabs: All, 2026 Modern Fleet, Classic Workhorses */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setFleetFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              fleetFilter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Commercial Fleet ({trucks.length})
          </button>
          <button
            onClick={() => setFleetFilter('2026')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              fleetFilter === '2026'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>★ 2026 Modern Fleet (Next-Gen)</span>
          </button>
          <button
            onClick={() => setFleetFilter('classic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              fleetFilter === 'classic'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Classic Workhorses
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-slate-200">{filteredTrucks.length}</span> heavy haulers
        </div>
      </div>

      {/* Fleet Vehicles Horizontal Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {filteredTrucks.map(truck => {
          const isSelected = truck.id === selectedTruck.id;
          const isActiveFleet = truck.id === profile.activeTruckId;
          const is2026 = truck.yearModel === 2026 || truck.id.includes('2026');
          return (
            <button
              key={truck.id}
              onClick={() => {
                truckAudio.playWrenchClick();
                setSelectedTruckId(truck.id);
              }}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-40 relative ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                  : profile.darkMode
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {is2026 && (
                <span className="absolute -top-2 -right-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-md flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>2026</span>
                </span>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {truck.brand || truck.category}
                  </span>
                  {!truck.unlocked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                  {isActiveFleet && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">DRIVING</span>}
                </div>
                <div className="font-bold text-xs line-clamp-2 leading-tight">{truck.name}</div>
              </div>

              <div className="mt-2">
                <div className="w-full h-8 rounded-lg flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: truck.color }}>
                  <Truck className="w-5 h-5 text-white drop-shadow" />
                  {is2026 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  {truck.unlocked ? `${truck.payloadCapacityTons} T • ${truck.baseHorsepower} HP` : `₱${truck.pricePhp.toLocaleString()}`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Garage Viewport & Tuning Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Visual Truck Inspection & Specs */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {selectedTruck.brand && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 font-bold text-[10px] tracking-wider uppercase border border-blue-500/30">
                    {selectedTruck.brand}
                  </span>
                )}
                {selectedTruck.yearModel === 2026 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-black text-[10px] tracking-wider uppercase border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>2026 Modern Release</span>
                  </span>
                )}
                {selectedTruck.techBadge && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] border border-emerald-500/30">
                    {selectedTruck.techBadge}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold">{selectedTruck.name}</h3>
              <p className="text-xs text-slate-400 italic">"{selectedTruck.tagline}"</p>
              <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
                {selectedTruck.description}
              </p>
            </div>

            {selectedTruck.unlocked ? (
              selectedTruck.id !== profile.activeTruckId && (
                <button
                  onClick={() => handleSelectActive(selectedTruck.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
                >
                  Set as Active Driving Truck
                </button>
              )
            ) : (
              <button
                onClick={() => handleBuyTruck(selectedTruck)}
                disabled={profile.cashPhp < selectedTruck.pricePhp}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy Truck for ₱{selectedTruck.pricePhp.toLocaleString()}</span>
              </button>
            )}
          </div>

          {/* Interactive Truck Body Preview Stage */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
            {/* Custom Painted Truck SVG / Canvas Representation */}
            <div className="relative flex flex-col items-center">
              {/* Semi Trailer if articulated */}
              {selectedTruck.hasTrailer && (
                <div 
                  className="w-48 h-20 rounded-xl border-2 border-slate-600 shadow-xl flex items-center justify-center text-center p-2 mb-2 transition-colors duration-300"
                  style={{ backgroundColor: selectedTruck.color }}
                >
                  <div className="text-white font-bold text-xs tracking-wider drop-shadow-md">
                    <span className="block">{selectedTruck.decal}</span>
                    <span className="text-[9px] opacity-80 uppercase">{selectedTruck.category}</span>
                  </div>
                </div>
              )}

              {/* Truck Cab */}
              <div 
                className="w-36 h-28 rounded-2xl border-2 border-slate-400 shadow-2xl flex flex-col items-center justify-between p-3 transition-colors duration-300 relative"
                style={{ backgroundColor: selectedTruck.color }}
              >
                {/* Windshield */}
                <div className="w-28 h-8 rounded-lg bg-sky-400/90 border border-sky-200 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-sky-950">PILIPINAS</span>
                </div>

                {/* Slogan & Decal Banner */}
                <span className="text-[10px] font-extrabold text-white text-center drop-shadow truncate max-w-[120px]">
                  {selectedTruck.decal}
                </span>

                {/* Chrome Bullbar Bumper */}
                <div className="w-32 h-3 rounded bg-slate-300 border border-slate-500 shadow flex items-center justify-around">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[7px] font-mono text-slate-800 font-bold">STAINLESS BULLBAR</span>
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
              </div>
            </div>

            {/* Wheels & Ground */}
            <div className="w-64 h-1 bg-slate-700 rounded-full mt-2" />
          </div>

          {/* Vehicle Mechanical Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Total Horsepower</span>
              <span className="font-mono font-bold text-base text-white">
                {selectedTruck.baseHorsepower + selectedTruck.engineLevel * 40} HP
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Pulling Torque</span>
              <span className="font-mono font-bold text-base text-amber-400">
                {selectedTruck.baseTorque + selectedTruck.engineLevel * 150} Nm
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Payload Limit</span>
              <span className="font-mono font-bold text-base text-emerald-400">
                {selectedTruck.payloadCapacityTons} Tons
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Axle Layout</span>
              <span className="font-mono font-bold text-base text-cyan-400">
                {selectedTruck.axles * 2} Wheels ({selectedTruck.axles} Axles)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Paint, Slogans & Tuning Upgrades */}
        <div className={`p-6 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-6`}>
          {/* Paint Swatches */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pinoy Fleet Colors
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c.value}
                  onClick={() => handleChangeColor(c.value)}
                  className="h-9 rounded-xl border border-slate-700 flex items-center justify-center shadow transition active:scale-95"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {selectedTruck.color === c.value && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pinoy Slogan Decals */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Cab Decal & Slogan
            </h4>
            <select
              value={selectedTruck.decal}
              onChange={(e) => handleChangeDecal(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs font-medium focus:ring-1 focus:ring-blue-500"
            >
              {DECALS_LIST.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Horn Sound Selector */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Air Horn Sound Tone
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['dual-air', 'nautical', 'pinoy-melodic'] as const).map(ht => (
                <button
                  key={ht}
                  onClick={() => testHorn(ht)}
                  className={`p-2 rounded-xl border font-semibold flex flex-col items-center text-center transition ${
                    selectedTruck.hornType === ht
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Volume2 className="w-4 h-4 mb-1" />
                  <span className="capitalize text-[10px]">{ht.replace('-', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Performance Upgrades (Engine, Brakes, Suspension, Tires) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mechanical Upgrades
            </h4>

            {/* Turbo Intercooler Upgrade */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="font-bold block">Turbo Intercooler (Lvl {selectedTruck.engineLevel}/5)</span>
                <span className="text-[10px] text-slate-400">+40 HP & Faster Hill Climbing</span>
              </div>
              <button
                onClick={() => handleUpgrade('engineLevel', 45000)}
                disabled={selectedTruck.engineLevel >= 5 || profile.cashPhp < 45000}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[11px]"
              >
                {selectedTruck.engineLevel >= 5 ? 'MAX' : '₱45,000'}
              </button>
            </div>

            {/* Pneumatic Air Brakes Upgrade */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="font-bold block">Dual Air Brakes (Lvl {selectedTruck.brakesLevel}/5)</span>
                <span className="text-[10px] text-slate-400">+15% Heavy Braking Distance</span>
              </div>
              <button
                onClick={() => handleUpgrade('brakesLevel', 35000)}
                disabled={selectedTruck.brakesLevel >= 5 || profile.cashPhp < 35000}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[11px]"
              >
                {selectedTruck.brakesLevel >= 5 ? 'MAX' : '₱35,000'}
              </button>
            </div>

            {/* Air Suspension Upgrade */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="font-bold block">Air Ride Suspension (Lvl {selectedTruck.suspensionLevel}/5)</span>
                <span className="text-[10px] text-slate-400">Protects fragile electronics from potholes</span>
              </div>
              <button
                onClick={() => handleUpgrade('suspensionLevel', 40000)}
                disabled={selectedTruck.suspensionLevel >= 5 || profile.cashPhp < 40000}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[11px]"
              >
                {selectedTruck.suspensionLevel >= 5 ? 'MAX' : '₱40,000'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

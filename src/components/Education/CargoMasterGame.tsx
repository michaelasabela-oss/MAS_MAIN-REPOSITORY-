import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Award, 
  Thermometer, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { CARGO_CATALOG } from '../../data/philippineData';
import { CargoItem, UserProfile } from '../../types/truck';
import { truckAudio } from '../../services/audioService';

interface CargoMasterGameProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onCompleteLesson: (rewardPhp: number, rewardXp: number) => void;
}

export const CargoMasterGame: React.FC<CargoMasterGameProps> = ({
  profile,
  setProfile,
  onCompleteLesson,
}) => {
  const [selectedCargo, setSelectedCargo] = useState<CargoItem>(CARGO_CATALOG[0]);
  // Truck bed grid layout: 3 rows (Front, Middle, Rear) x 2 columns (Left, Right)
  const [gridSlots, setGridSlots] = useState<Array<CargoItem | null>>([null, null, null, null, null, null]);
  const [targetTemp, setTargetTemp] = useState<number>(-18);
  const [tieDownsSecured, setTieDownsSecured] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Calculate Center of Gravity balance
  const calculateBalance = () => {
    let frontWeight = 0;
    let rearWeight = 0;
    let leftWeight = 0;
    let rightWeight = 0;
    let totalWeight = 0;

    // Slots: 0=FL, 1=FR, 2=ML, 3=MR, 4=RL, 5=RR
    gridSlots.forEach((item, index) => {
      if (item) {
        const w = item.weightTons;
        totalWeight += w;
        if (index === 0 || index === 1) frontWeight += w;
        if (index === 2 || index === 3) {
          frontWeight += w * 0.5;
          rearWeight += w * 0.5;
        }
        if (index === 4 || index === 5) rearWeight += w;

        if (index % 2 === 0) leftWeight += w;
        else rightWeight += w;
      }
    });

    const frontRearRatio = totalWeight > 0 ? (frontWeight / totalWeight) * 100 : 50;
    const leftRightRatio = totalWeight > 0 ? (leftWeight / totalWeight) * 100 : 50;

    // Ideal front/rear is 45-55%, ideal left/right is 48-52%
    const frScore = 100 - Math.abs(50 - frontRearRatio) * 2;
    const lrScore = 100 - Math.abs(50 - leftRightRatio) * 2;
    const overallBalance = Math.round((frScore + lrScore) / 2);

    return {
      totalWeight,
      frontRearRatio,
      leftRightRatio,
      overallBalance: Math.max(0, Math.min(100, overallBalance)),
      isFrontHeavy: frontRearRatio > 65,
      isRearHeavy: frontRearRatio < 35,
      isSideHeavy: Math.abs(50 - leftRightRatio) > 15,
    };
  };

  const balanceStats = calculateBalance();

  const handlePlaceCargo = (slotIndex: number) => {
    truckAudio.playWrenchClick();
    setGridSlots(prev => {
      const next = [...prev];
      next[slotIndex] = selectedCargo;
      return next;
    });
  };

  const handleRemoveCargo = (slotIndex: number) => {
    truckAudio.playWrenchClick();
    setGridSlots(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const handleReset = () => {
    setGridSlots([null, null, null, null, null, null]);
    setTieDownsSecured(false);
    setIsCompleted(false);
  };

  const handleVerifyLoading = () => {
    const filledCount = gridSlots.filter(Boolean).length;
    if (filledCount === 0) return;

    if (balanceStats.overallBalance >= 80 && tieDownsSecured) {
      setIsCompleted(true);
      truckAudio.playSuccessChime();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      onCompleteLesson(35000, 450);
    } else {
      truckAudio.playAirBrakeHiss();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Kids Introduction Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-md`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Cargo Master: Logistics & Weight Distribution</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                  Kids & Apprentice Academy
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Learn how real freight dispatchers stack truck cargo safely to prevent rollovers and jackknifing!
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Truck Bed</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cargo Catalog Selector & Educational Insights */}
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border ${
            profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
              1. Select Philippine Cargo Type
            </h3>
            <div className="space-y-2">
              {CARGO_CATALOG.map(item => {
                const isSelected = selectedCargo.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      truckAudio.playWrenchClick();
                      setSelectedCargo(item);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-blue-400'
                        : profile.darkMode
                        ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.nameTagalog}</div>
                      <div className="text-[10px] text-amber-500 font-mono mt-0.5">
                        Weight: {item.weightTons} Tons • Category: {item.category.replace('_', ' ')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Educational Fun Fact Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Logistics Science Lesson</span>
            </div>
            <p className="leading-relaxed">
              {selectedCargo.educationalTip}
            </p>
          </div>
        </div>

        {/* Center: Interactive Truck Bed Loading Bay */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-5`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              2. Load Cargo on Truck Bed (Click slot to place or remove)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Total Payload: {balanceStats.totalWeight} Tons
            </span>
          </div>

          {/* Truck Bed Visualization */}
          <div className="relative p-6 rounded-2xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center">
            {/* Cab Header Indicator */}
            <div className="w-48 py-1.5 rounded-t-xl bg-blue-600 text-white font-bold text-xs text-center shadow">
              ▲ TRUCK CAB (Front / Engine) ▲
            </div>

            {/* 3x2 Truck Bed Slots */}
            <div className="w-full max-w-md grid grid-cols-2 gap-3 p-4 bg-slate-900 rounded-b-2xl border border-slate-800">
              {/* Slot labels: Front-Left, Front-Right, Mid-Left, Mid-Right, Rear-Left, Rear-Right */}
              {gridSlots.map((item, idx) => {
                const rowLabel = idx < 2 ? 'FRONT' : idx < 4 ? 'CENTER' : 'REAR';
                const colLabel = idx % 2 === 0 ? 'LEFT' : 'RIGHT';
                return (
                  <button
                    key={idx}
                    onClick={() => (item ? handleRemoveCargo(idx) : handlePlaceCargo(idx))}
                    className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition active:scale-95 ${
                      item
                        ? 'bg-blue-900/30 border-blue-500 text-white'
                        : 'border-slate-700/80 hover:border-slate-500 text-slate-500'
                    }`}
                  >
                    {item ? (
                      <div className="space-y-1">
                        <Package className="w-6 h-6 mx-auto text-blue-400" />
                        <span className="block text-[11px] font-bold line-clamp-1">{item.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono">{item.weightTons} T</span>
                        <span className="text-[9px] text-red-400 block underline">Click to remove</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">{rowLabel} - {colLabel}</span>
                        <span className="text-[11px] text-blue-400 font-semibold">+ Click to Place</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Rear Bumper & Mudflaps Indicator */}
            <div className="w-48 py-1 rounded-b-lg bg-red-800 text-red-200 font-mono text-[10px] text-center mt-1">
              ▼ REAR AXLES & MUDFLAPS ▼
            </div>
          </div>

          {/* Real-time Center of Gravity (CG) Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Front / Rear Balance */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Front / Rear Axle Distribution</span>
                <span className="font-mono font-bold text-amber-400">{Math.round(balanceStats.frontRearRatio)}% Front</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: `${balanceStats.frontRearRatio}%` }} />
                <div className="h-full bg-orange-500" style={{ width: `${100 - balanceStats.frontRearRatio}%` }} />
              </div>
              {balanceStats.isRearHeavy && (
                <div className="flex items-center gap-1 text-red-400 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Warning: Rear-heavy! Steer axle will lose highway grip.</span>
                </div>
              )}
            </div>

            {/* Left / Right Balance */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Left / Right Lateral Balance</span>
                <span className="font-mono font-bold text-emerald-400">{Math.round(balanceStats.leftRightRatio)}% Left</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${balanceStats.leftRightRatio}%` }} />
                <div className="h-full bg-cyan-500" style={{ width: `${100 - balanceStats.leftRightRatio}%` }} />
              </div>
              {balanceStats.isSideHeavy && (
                <div className="flex items-center gap-1 text-red-400 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Warning: Uneven weight! High rollover danger on curves.</span>
                </div>
              )}
            </div>
          </div>

          {/* Cold Chain Reefer Temp / Tie-Down Ratchet Check */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            {selectedCargo.category === 'cold_chain' && (
              <div className="flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold text-slate-300">Reefer Container Temp:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="range"
                      min="-25"
                      max="10"
                      value={targetTemp}
                      onChange={(e) => setTargetTemp(Number(e.target.value))}
                      className="accent-cyan-400 w-28"
                    />
                    <span className="font-mono font-bold text-xs text-cyan-400">{targetTemp}°C</span>
                    <span className="text-[10px] text-slate-400">(-18°C required)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ratchet Straps Verification */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={tieDownsSecured}
                onChange={(e) => {
                  truckAudio.playWrenchClick();
                  setTieDownsSecured(e.target.checked);
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Inspect & Tighten Heavy Ratchet Tie-Down Straps</span>
            </label>
          </div>

          {/* Verification & Submission Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs">
              <span className="text-slate-400">Calculated Safety Rating: </span>
              <span className={`font-mono font-bold text-sm ${balanceStats.overallBalance >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {balanceStats.overallBalance}%
              </span>
            </div>

            <button
              onClick={handleVerifyLoading}
              disabled={isCompleted}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 ${
                balanceStats.overallBalance >= 80 && tieDownsSecured
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Award className="w-4 h-4" />}
              <span>{isCompleted ? 'Logistics Lesson Passed! (+₱35,000)' : 'Dispatch Pre-Trip Inspection'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

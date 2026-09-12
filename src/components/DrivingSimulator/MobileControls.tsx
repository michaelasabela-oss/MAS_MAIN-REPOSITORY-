import React from 'react';
import { ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';

interface MobileControlsProps {
  onThrottleStart: () => void;
  onThrottleEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
  onSteerLeftStart: () => void;
  onSteerLeftEnd: () => void;
  onSteerRightStart: () => void;
  onSteerRightEnd: () => void;
  onShiftUp: () => void;
  onShiftDown: () => void;
  onShiftReverse: () => void;
  gear: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onThrottleStart,
  onThrottleEnd,
  onBrakeStart,
  onBrakeEnd,
  onSteerLeftStart,
  onSteerLeftEnd,
  onSteerRightStart,
  onSteerRightEnd,
  onShiftUp,
  onShiftDown,
  onShiftReverse,
  gear,
}) => {
  return (
    <div className="w-full flex items-end justify-between gap-2 pt-2 select-none touch-none">
      {/* Left Touch Cluster: Steering & Gear Up/Down */}
      <div className="flex items-center gap-2">
        {/* Gear Selector Stack */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={onShiftUp}
            className="w-12 h-11 rounded-xl bg-slate-800 border border-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center shadow"
            title="Shift Up"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={onShiftReverse}
            className={`w-12 h-9 rounded-xl border text-xs font-black flex items-center justify-center shadow transition ${
              gear === -1 ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Reverse Gear"
          >
            REV
          </button>
          <button
            onClick={onShiftDown}
            className="w-12 h-11 rounded-xl bg-slate-800 border border-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center shadow"
            title="Shift Down"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Big Touch Steering Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onMouseDown={onSteerLeftStart}
            onMouseUp={onSteerLeftEnd}
            onTouchStart={(e) => { e.preventDefault(); onSteerLeftStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onSteerLeftEnd(); }}
            className="w-18 sm:w-22 h-24 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 active:from-blue-600 active:to-blue-800 text-white font-bold flex flex-col items-center justify-center shadow-lg active:scale-95 transition"
          >
            <ArrowLeft className="w-8 h-8" />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider text-slate-300">Kaliwa</span>
          </button>

          <button
            onMouseDown={onSteerRightStart}
            onMouseUp={onSteerRightEnd}
            onTouchStart={(e) => { e.preventDefault(); onSteerRightStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onSteerRightEnd(); }}
            className="w-18 sm:w-22 h-24 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 active:from-blue-600 active:to-blue-800 text-white font-bold flex flex-col items-center justify-center shadow-lg active:scale-95 transition"
          >
            <ArrowRight className="w-8 h-8" />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider text-slate-300">Kanan</span>
          </button>
        </div>
      </div>

      {/* Center Helpful Instruction for Keyboard & Touch */}
      <div className="hidden lg:flex flex-col items-center text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
        <span className="font-semibold text-slate-200">⌨️ Keyboard & Touch Ready</span>
        <span>W/▲: Throttle • S/▼: Air Brake • A/D: Steer • Space: Handbrake • H: Horn</span>
      </div>

      {/* Right Touch Cluster: Realistic Truck Pedals */}
      <div className="flex items-end gap-2.5">
        {/* Service Air Brake Pedal (Wide, textured) */}
        <button
          onMouseDown={onBrakeStart}
          onMouseUp={onBrakeEnd}
          onTouchStart={(e) => { e.preventDefault(); onBrakeStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onBrakeEnd(); }}
          className="w-20 sm:w-24 h-26 rounded-2xl bg-gradient-to-b from-red-700 to-red-950 border-2 border-red-500/80 active:from-red-600 active:to-red-800 text-white font-black flex flex-col items-center justify-center shadow-xl active:scale-95 transition"
        >
          <div className="w-10 h-1 bg-red-400/60 rounded-full mb-1" />
          <div className="w-10 h-1 bg-red-400/60 rounded-full mb-1" />
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase mt-1">PRENO</span>
          <span className="text-[9px] opacity-75 font-mono">AIR BRAKE</span>
        </button>

        {/* Throttle / Gas Pedal (Tall, narrow) */}
        <button
          onMouseDown={onThrottleStart}
          onMouseUp={onThrottleEnd}
          onTouchStart={(e) => { e.preventDefault(); onThrottleStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onThrottleEnd(); }}
          className="w-16 sm:w-18 h-32 rounded-2xl bg-gradient-to-b from-emerald-600 to-slate-900 border-2 border-emerald-400 active:from-emerald-500 active:to-emerald-700 text-white font-black flex flex-col items-center justify-center shadow-xl active:scale-95 transition"
        >
          <div className="w-6 h-1 bg-emerald-400/60 rounded-full mb-1" />
          <div className="w-6 h-1 bg-emerald-400/60 rounded-full mb-1" />
          <div className="w-6 h-1 bg-emerald-400/60 rounded-full mb-1" />
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase mt-1">GAS</span>
          <span className="text-[9px] opacity-75 font-mono">ACCEL</span>
        </button>
      </div>
    </div>
  );
};

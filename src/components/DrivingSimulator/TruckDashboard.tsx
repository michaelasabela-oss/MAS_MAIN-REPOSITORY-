import React from 'react';
import { 
  Volume2, 
  Lightbulb, 
  AlertTriangle, 
  Wind, 
  Flame, 
  Power, 
  ShieldAlert
} from 'lucide-react';
import { truckAudio } from '../../services/audioService';

interface TruckDashboardProps {
  speedKmh: number;
  rpm: number;
  gear: number; // -1 = R, 0 = N, 1-6 = gears
  isHighRange: boolean;
  onToggleRange: () => void;
  airPressureBar: number; // 0 - 10 bar
  engineTemp: number; // 70 - 110 C
  fuelPercent: number;
  isEngineOn: boolean;
  onToggleEngine: () => void;
  headlights: 'off' | 'low' | 'high';
  onCycleHeadlights: () => void;
  hazardActive: boolean;
  onToggleHazard: () => void;
  jakeBrakeActive: boolean;
  onToggleJakeBrake: () => void;
  parkingBrakeActive: boolean;
  onToggleParkingBrake: () => void;
  wipersActive: boolean;
  onToggleWipers: () => void;
  hornType?: 'nautical' | 'dual-air' | 'pinoy-melodic';
  darkMode: boolean;
}

export const TruckDashboard: React.FC<TruckDashboardProps> = ({
  speedKmh,
  rpm,
  gear,
  isHighRange,
  onToggleRange,
  airPressureBar,
  engineTemp,
  fuelPercent,
  isEngineOn,
  onToggleEngine,
  headlights,
  onCycleHeadlights,
  hazardActive,
  onToggleHazard,
  jakeBrakeActive,
  onToggleJakeBrake,
  parkingBrakeActive,
  onToggleParkingBrake,
  wipersActive,
  onToggleWipers,
  hornType = 'dual-air',
  darkMode,
}) => {
  const getGearLabel = () => {
    if (gear === -1) return 'R';
    if (gear === 0) return 'N';
    return `${gear}${isHighRange ? 'H' : 'L'}`;
  };

  const handleHornPress = () => {
    truckAudio.playHorn(hornType as 'dual-air' | 'nautical' | 'pinoy-melodic');
  };

  return (
    <div className={`p-3 sm:p-4 rounded-2xl border select-none transition-colors ${
      darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-slate-800 text-white border-slate-700'
    } shadow-xl`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Speedometer & Tachometer Gauges */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Speed Digital & Arc */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 border-2 border-slate-700 shadow-inner">
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                  {Math.round(speedKmh)}
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  km/h
                </span>
              </div>
              {/* Simulated needle ring */}
              <div 
                className="absolute inset-1 rounded-full border-t-2 border-blue-500 transition-transform duration-100"
                style={{ transform: `rotate(${(speedKmh / 120) * 180 - 90}deg)` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 mt-1">SPEED</span>
          </div>

          {/* Tachometer (RPM) */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-slate-950 border-2 border-slate-700 shadow-inner">
              <div className="text-center">
                <span className={`text-xl sm:text-2xl font-black font-mono ${rpm > 2200 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {Math.round(rpm)}
                </span>
                <span className="block text-[9px] uppercase font-bold text-slate-400">
                  RPM
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 mt-1">TACHO</span>
          </div>

          {/* Gear & Range Box */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-18 sm:w-18 sm:h-20 rounded-xl bg-slate-950 border-2 border-amber-500/40 flex flex-col items-center justify-center p-1 shadow-inner">
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
                {getGearLabel()}
              </span>
              <button
                onClick={onToggleRange}
                className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 uppercase"
                title="Splitter Range Switch"
              >
                {isHighRange ? 'HIGH' : 'LOW'}
              </button>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 mt-1">GEARBOX</span>
          </div>
        </div>

        {/* Pneumatics & Vital Telemetry */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
          {/* Air Brake Pressure Gauge */}
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-cyan-400" /> AIR TANK</span>
              <span className="font-mono">{airPressureBar.toFixed(1)} bar</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full transition-all duration-200 ${airPressureBar < 6 ? 'bg-red-500' : 'bg-cyan-400'}`}
                style={{ width: `${(airPressureBar / 10) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 mt-1">
              {airPressureBar < 6 ? '⚠️ LOW AIR PRESSURE' : 'Optimum Pneumatics'}
            </span>
          </div>

          {/* Water / Engine Temp */}
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> ENGINE</span>
              <span className="font-mono">{Math.round(engineTemp)}°C</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full transition-all duration-200 ${engineTemp > 100 ? 'bg-red-500' : 'bg-amber-400'}`}
                style={{ width: `${((engineTemp - 50) / 70) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 mt-1">Cooling Radiator</span>
          </div>

          {/* Fuel Level */}
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>DIESEL</span>
              <span className="font-mono">{Math.round(fuelPercent)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-emerald-400 transition-all duration-200"
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 mt-1">Euro-4 Fuel</span>
          </div>
        </div>

        {/* Realistic Heavy Truck Cab Switches */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Engine Ignition */}
          <button
            onClick={onToggleEngine}
            className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl border font-bold transition active:scale-95 ${
              isEngineOn 
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/30' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title="Ignition Key"
          >
            <Power className="w-4 h-4" />
            <span className="text-[9px] mt-1">{isEngineOn ? 'ON' : 'START'}</span>
          </button>

          {/* Parking Air Brake (The Diamond Knob) */}
          <button
            onClick={onToggleParkingBrake}
            className={`flex flex-col items-center justify-center px-3 h-14 rounded-xl border font-bold transition active:scale-95 ${
              parkingBrakeActive 
                ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/40' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Yellow Diamond Parking Air Brake Valve"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">PARK BRAKE</span>
            <span className="text-[8px] opacity-75">{parkingBrakeActive ? 'SET' : 'RELEASED'}</span>
          </button>

          {/* Jake Brake (Engine Compression Retarder) */}
          <button
            onClick={onToggleJakeBrake}
            className={`flex flex-col items-center justify-center px-2.5 h-14 rounded-xl border font-bold transition active:scale-95 ${
              jakeBrakeActive 
                ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-900/40' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title="Exhaust Compression Retarder for Mountain Descents"
          >
            <Wind className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">JAKE BRAKE</span>
            <span className="text-[8px] opacity-75">{jakeBrakeActive ? 'ACTIVE' : 'OFF'}</span>
          </button>

          {/* Headlights */}
          <button
            onClick={onCycleHeadlights}
            className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl border font-bold transition active:scale-95 ${
              headlights !== 'off' 
                ? 'bg-blue-600 border-blue-400 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title="Toggle Headlights (Off / Low / High)"
          >
            <Lightbulb className={`w-4 h-4 ${headlights === 'high' ? 'text-cyan-300' : ''}`} />
            <span className="text-[9px] mt-1 uppercase">{headlights}</span>
          </button>

          {/* Hazard Flashers */}
          <button
            onClick={onToggleHazard}
            className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl border font-bold transition active:scale-95 ${
              hazardActive 
                ? 'bg-red-700 border-red-500 text-white animate-pulse' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title="Hazard Warning Flashers"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] mt-1">HAZARD</span>
          </button>

          {/* Rain Wipers */}
          <button
            onClick={onToggleWipers}
            className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl border font-bold transition active:scale-95 ${
              wipersActive 
                ? 'bg-cyan-700 border-cyan-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title="Windshield Wipers"
          >
            <span className="text-sm font-black">🌧️</span>
            <span className="text-[9px] mt-0.5">{wipersActive ? 'ON' : 'WIPER'}</span>
          </button>

          {/* Heavy Air Horn Button */}
          <button
            onMouseDown={handleHornPress}
            onTouchStart={handleHornPress}
            className="flex flex-col items-center justify-center px-4 h-14 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold shadow-lg active:scale-95 transition"
            title="Loud Pinoy Marine Truck Air Horn"
          >
            <Volume2 className="w-5 h-5 animate-bounce" />
            <span className="text-[9px] mt-0.5 uppercase tracking-wider font-extrabold">BUSINA!</span>
          </button>
        </div>
      </div>
    </div>
  );
};

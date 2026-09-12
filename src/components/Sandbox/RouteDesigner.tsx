import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Map, 
  Plus, 
  Play, 
  Download, 
  Upload, 
  Trash2, 
  MapPin, 
  AlertTriangle, 
  CloudRain, 
  Sun, 
  Moon, 
  CloudFog 
} from 'lucide-react';
import { PhilippineRoute, UserProfile } from '../../types/truck';
import { truckAudio } from '../../services/audioService';

interface RouteDesignerProps {
  profile: UserProfile;
  customRoutes: PhilippineRoute[];
  setCustomRoutes: React.Dispatch<React.SetStateAction<PhilippineRoute[]>>;
  onTestDriveRoute: (route: PhilippineRoute) => void;
}

export const RouteDesigner: React.FC<RouteDesignerProps> = ({
  profile,
  customRoutes,
  setCustomRoutes,
  onTestDriveRoute,
}) => {
  const [routeName, setRouteName] = useState<string>('Marilaque Mountain Pass Express');
  const [region, setRegion] = useState<'Metro Manila' | 'Luzon' | 'Visayas' | 'Mindanao'>('Luzon');
  const [terrain, setTerrain] = useState<'Urban Highway' | 'Mountain Zigzag' | 'Expressway Tollway' | 'Coastal Province' | 'Rural Dirt'>('Mountain Zigzag');
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'foggy' | 'night'>('foggy');
  const [distanceKm, setDistanceKm] = useState<number>(38);
  const [speedLimit, setSpeedLimit] = useState<number>(50);
  const [hasTolls, setHasTolls] = useState<boolean>(true);
  const [tollCost, setTollCost] = useState<number>(120);
  const [importCode, setImportCode] = useState<string>('');

  const [waypoints, setWaypoints] = useState<Array<{ x: number; y: number; label: string; hasHazard?: boolean; hazardType?: string }>>([
    { x: 100, y: 300, label: 'Pililla Windmill Depot' },
    { x: 400, y: 220, label: 'Tanay Sierra Madre Lookout', hasHazard: true, hazardType: 'Steep 10% Downhill' },
    { x: 750, y: 180, label: 'Infanta Ridge Hairpin Curves', hasHazard: true, hazardType: 'Rock Fall Zone' },
    { x: 1100, y: 280, label: 'Real Quezon Coastal Terminal' },
  ]);

  const handleAddWaypoint = () => {
    truckAudio.playWrenchClick();
    const count = waypoints.length + 1;
    setWaypoints(prev => [
      ...prev,
      {
        x: 100 + count * 220,
        y: 200 + (count % 2 === 0 ? 80 : -60),
        label: `Waypoint ${count}: Provincial Checkpoint`,
        hasHazard: count % 2 === 1,
        hazardType: 'Pothole & Slick Asphalt',
      },
    ]);
  };

  const handleRemoveWaypoint = (index: number) => {
    truckAudio.playWrenchClick();
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveRoute = () => {
    if (!routeName.trim()) return;
    truckAudio.playSuccessChime();
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

    const newRoute: PhilippineRoute = {
      id: `custom-route-${Date.now()}`,
      name: routeName,
      region,
      distanceKm,
      terrainType: terrain,
      difficulty: terrain === 'Mountain Zigzag' ? 'Extreme' : 'Medium',
      speedLimitKmh: speedLimit,
      hasTolls,
      tollCostPhp: tollCost,
      description: `Custom designed ${region} transport corridor featuring ${waypoints.length} checkpoints.`,
      landmarks: waypoints.map(w => w.label),
      weather,
      waypoints,
    };

    setCustomRoutes(prev => [newRoute, ...prev]);
  };

  const handleImportRoute = () => {
    try {
      const decoded = JSON.parse(atob(importCode));
      if (decoded.name && decoded.waypoints) {
        setCustomRoutes(prev => [decoded, ...prev]);
        setImportCode('');
        truckAudio.playSuccessChime();
      }
    } catch {
      truckAudio.playAirBrakeHiss();
    }
  };

  const exportRouteCode = (route: PhilippineRoute) => {
    const str = btoa(JSON.stringify(route));
    navigator.clipboard?.writeText(str);
    alert('Route code copied to clipboard! Share it with friends or across devices.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-md flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Map className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Sandbox Creative Mode: Route Designer</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                Philippine Map Architect
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft custom transport arteries across Metro Manila, Cordillera mountain passes, or Visayas coastal highways!
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveRoute}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Save Route to Fleet GPS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration Settings */}
        <div className={`p-5 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-4 text-xs`}>
          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Route Corridor Name</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-medium"
              >
                <option value="Metro Manila">Metro Manila</option>
                <option value="Luzon">Luzon</option>
                <option value="Visayas">Visayas</option>
                <option value="Mindanao">Mindanao</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Terrain</label>
              <select
                value={terrain}
                onChange={(e) => setTerrain(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-medium"
              >
                <option value="Urban Highway">Urban Highway</option>
                <option value="Mountain Zigzag">Mountain Zigzag</option>
                <option value="Expressway Tollway">Expressway Tollway</option>
                <option value="Coastal Province">Coastal Province</option>
                <option value="Rural Dirt">Rural Dirt</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Atmosphere & Weather</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sunny', label: 'Sunny', icon: <Sun className="w-4 h-4 text-amber-400" /> },
                { id: 'rainy', label: 'Rain', icon: <CloudRain className="w-4 h-4 text-cyan-400" /> },
                { id: 'foggy', label: 'Fog', icon: <CloudFog className="w-4 h-4 text-slate-300" /> },
                { id: 'night', label: 'Night', icon: <Moon className="w-4 h-4 text-yellow-300" /> },
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setWeather(w.id as any)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    weather === w.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {w.icon}
                  <span className="text-[10px]">{w.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Distance (km)</label>
              <input
                type="number"
                min="5"
                max="150"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Speed Limit</label>
              <input
                type="number"
                min="30"
                max="100"
                value={speedLimit}
                onChange={(e) => setSpeedLimit(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={hasTolls}
                onChange={(e) => setHasTolls(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Includes RFID Toll Plazas</span>
            </label>
            {hasTolls && (
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Toll Fee (EasyTrip/Autosweep):</span>
                <span className="font-mono text-amber-400 font-bold">₱{tollCost}</span>
              </div>
            )}
          </div>
        </div>

        {/* Center / Right: Visual Waypoint Editor & Custom Route List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Waypoints Sequence Builder */}
          <div className={`p-5 rounded-2xl border ${
            profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Route Waypoints & Road Hazards ({waypoints.length})
              </h3>
              <button
                onClick={handleAddWaypoint}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Checkpoint</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {waypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <input
                        type="text"
                        value={wp.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWaypoints(prev => prev.map((item, i) => (i === idx ? { ...item, label: val } : item)));
                        }}
                        className="bg-transparent text-slate-100 font-semibold focus:outline-none border-b border-transparent focus:border-indigo-500"
                      />
                      {wp.hasHazard && (
                        <div className="flex items-center gap-1 text-amber-400 text-[10px] mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Hazard: {wp.hazardType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveWaypoint(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition"
                    title="Remove Waypoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Custom Routes List */}
          {customRoutes.length > 0 && (
            <div className={`p-5 rounded-2xl border ${
              profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } space-y-3`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Saved Philippine Custom Routes ({customRoutes.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customRoutes.map(rt => (
                  <div
                    key={rt.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between h-36"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>{rt.region}</span>
                        <span className="font-mono text-amber-400">{rt.distanceKm} KM</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-200 line-clamp-1">{rt.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{rt.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                      <button
                        onClick={() => exportRouteCode(rt)}
                        className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Share Code</span>
                      </button>

                      <button
                        onClick={() => onTestDriveRoute(rt)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Test Drive</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

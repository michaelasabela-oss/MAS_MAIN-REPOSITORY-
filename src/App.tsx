import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TruckCanvas } from './components/DrivingSimulator/TruckCanvas';
import { TruckSimulator3D } from './components/DrivingSimulator/TruckSimulator3D';
import { SimulatorErrorBoundary } from './components/DrivingSimulator/SimulatorErrorBoundary';
import { TruckDashboard } from './components/DrivingSimulator/TruckDashboard';
import { MobileControls } from './components/DrivingSimulator/MobileControls';
import { GarageView } from './components/Customization/GarageView';
import { CargoMasterGame } from './components/Education/CargoMasterGame';
import { MechanicsBayGame } from './components/Education/MechanicsBayGame';
import { FreightExchange } from './components/Marketplace/FreightExchange';
import { RouteDesigner } from './components/Sandbox/RouteDesigner';
import { FleetDashboard } from './components/Dashboard/FleetDashboard';
import { PastTripLogs } from './components/Dashboard/PastTripLogs';
import { AdvertisingHub } from './components/Advertising/AdvertisingHub';
import { DispatcherModal } from './components/DispatcherModal';
import { SettingsModal } from './components/SettingsModal';

import { 
  AppView, 
  UserProfile, 
  TruckModel, 
  PhilippineRoute, 
  CargoItem, 
  TripLog, 
  DailyChallenge, 
  TruckId 
} from './types/truck';
import { 
  PHILIPPINE_ROUTES, 
  CARGO_CATALOG 
} from './data/philippineData';
import { storageService } from './services/storageService';
import { truckAudio } from './services/audioService';
import { MapPin, Package, AlertCircle, Sparkles, Box, Eye } from 'lucide-react';

function checkIsWebGLAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return Boolean(gl && gl instanceof WebGLRenderingContext);
  } catch (e) {
    return false;
  }
}

export default function App() {
  // 1. Persistent State
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [trucks, setTrucks] = useState<TruckModel[]>(() => storageService.getTrucks());
  const [tripLogs, setTripLogs] = useState<TripLog[]>(() => storageService.getTripLogs());
  const [challenges, setChallenges] = useState<DailyChallenge[]>(() => storageService.getChallenges());
  const [customRoutes, setCustomRoutes] = useState<PhilippineRoute[]>(() => storageService.getCustomRoutes());

  // 2. Navigation & UI State
  const [currentView, setCurrentView] = useState<AppView>('driving');
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean>(() => checkIsWebGLAvailable());
  const [simDimension, setSimDimension] = useState<'3D' | '2D'>(() => checkIsWebGLAvailable() ? '3D' : '2D');
  const [isDispatcherOpen, setIsDispatcherOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // 3. Active Vehicle, Route & Cargo
  const activeTruck = trucks.find(t => t.id === profile.activeTruckId) || trucks[0];
  const [activeRoute, setActiveRoute] = useState<PhilippineRoute>(PHILIPPINE_ROUTES[0]);
  const [activeCargo, setActiveCargo] = useState<CargoItem>(CARGO_CATALOG[0]);

  // 4. Vehicle Physics & Telemetry State
  const [isEngineOn, setIsEngineOn] = useState<boolean>(false);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [rpm, setRpm] = useState<number>(0);
  const [gear, setGear] = useState<number>(1); // 1 to 6, -1 is Reverse, 0 is Neutral
  const [isHighRange, setIsHighRange] = useState<boolean>(false);
  const [airPressureBar, setAirPressureBar] = useState<number>(8.5);
  const [engineTemp, setEngineTemp] = useState<number>(82);
  const [fuelPercent, setFuelPercent] = useState<number>(95);
  const [parkingBrakeActive, setParkingBrakeActive] = useState<boolean>(true);
  const [jakeBrakeActive, setJakeBrakeActive] = useState<boolean>(false);
  const [headlights, setHeadlights] = useState<'off' | 'low' | 'high'>('low');
  const [hazardActive, setHazardActive] = useState<boolean>(false);
  const [wipersActive, setWipersActive] = useState<boolean>(false);
  const [safetyScore, setSafetyScore] = useState<number>(100);

  // Touch / Keyboard Control Inputs
  const [throttlePressed, setThrottlePressed] = useState<boolean>(false);
  const [brakePressed, setBrakePressed] = useState<boolean>(false);
  const [steerLeftPressed, setSteerLeftPressed] = useState<boolean>(false);
  const [steerRightPressed, setSteerRightPressed] = useState<boolean>(false);

  // Sync state changes to storage
  useEffect(() => {
    storageService.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    storageService.saveTrucks(trucks);
  }, [trucks]);

  useEffect(() => {
    storageService.saveTripLogs(tripLogs);
  }, [tripLogs]);

  useEffect(() => {
    storageService.saveChallenges(challenges);
  }, [challenges]);

  useEffect(() => {
    storageService.saveCustomRoutes(customRoutes);
  }, [customRoutes]);

  // Network offline/online listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard Event Handlers for Desktop Players
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setThrottlePressed(true);
          break;
        case 's':
        case 'arrowdown':
          setBrakePressed(true);
          break;
        case 'a':
        case 'arrowleft':
          setSteerLeftPressed(true);
          break;
        case 'd':
        case 'arrowright':
          setSteerRightPressed(true);
          break;
        case ' ': // Spacebar for parking air brake
          e.preventDefault();
          truckAudio.playAirBrakeHiss();
          setParkingBrakeActive(prev => !prev);
          break;
        case 'j':
          truckAudio.playJakeBrake();
          setJakeBrakeActive(prev => !prev);
          break;
        case 'h':
          truckAudio.playHorn(activeTruck.hornType);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setThrottlePressed(false);
          break;
        case 's':
        case 'arrowdown':
          setBrakePressed(false);
          truckAudio.playAirBrakeHiss();
          break;
        case 'a':
        case 'arrowleft':
          setSteerLeftPressed(false);
          break;
        case 'd':
        case 'arrowright':
          setSteerRightPressed(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTruck.hornType]);

  // Handle Engine Ignition Toggle
  const handleToggleEngine = useCallback(() => {
    truckAudio.playWrenchClick();
    if (!isEngineOn) {
      setIsEngineOn(true);
      truckAudio.startEngine();
      setRpm(650);
    } else {
      setIsEngineOn(false);
      truckAudio.stopEngine();
      setRpm(0);
      setSpeedKmh(0);
    }
  }, [isEngineOn]);

  // Handle Parking Air Brake Release
  const handleToggleParkingBrake = useCallback(() => {
    truckAudio.playAirBrakeHiss();
    setParkingBrakeActive(prev => !prev);
  }, []);

  // Gearbox Shift Actions
  const handleShiftUp = () => {
    truckAudio.playWrenchClick();
    setGear(prev => {
      if (prev === -1) return 1;
      return Math.min(6, prev + 1);
    });
  };

  const handleShiftDown = () => {
    truckAudio.playWrenchClick();
    setGear(prev => {
      if (prev <= 1) return -1;
      return prev - 1;
    });
  };

  const handleShiftReverse = () => {
    truckAudio.playWrenchClick();
    setGear(prev => (prev === -1 ? 1 : -1));
  };

  // Switch Active Truck
  const handleSelectActiveTruck = (truckId: TruckId) => {
    setProfile(prev => ({ ...prev, activeTruckId: truckId }));
    setCurrentView('driving');
  };

  // Complete a Delivery Mission from Canvas
  const handleMissionComplete = (log: TripLog) => {
    const bonusPayout = profile.hasAdFree ? Math.round(log.payoutPhp * 1.25) : log.payoutPhp;
    const updatedLog: TripLog = {
      ...log,
      payoutPhp: bonusPayout,
      notes: profile.hasAdFree ? `${log.notes} (+25% Pro VIP Payout Boost Applied)` : log.notes,
    };
    setTripLogs(prev => [updatedLog, ...prev]);
    setProfile(prev => ({
      ...prev,
      cashPhp: prev.cashPhp + bonusPayout,
      xp: prev.xp + 350,
      safetyScore: Math.round((prev.safetyScore * 0.8) + (log.safetyScore * 0.2)),
    }));
  };

  // Award for completing an educational lesson
  const handleCompleteEducationalLesson = (rewardPhp: number, rewardXp: number) => {
    setProfile(prev => ({
      ...prev,
      cashPhp: prev.cashPhp + rewardPhp,
      xp: prev.xp + rewardXp,
      level: prev.xp + rewardXp > prev.level * 500 ? prev.level + 1 : prev.level,
    }));
  };

  // Accept Contract from Freight Exchange
  const handleAcceptContract = (cargo: CargoItem, route: PhilippineRoute) => {
    setActiveCargo(cargo);
    setActiveRoute(route);
    setSafetyScore(100);
    setCurrentView('driving');
  };

  // Test drive custom route from Sandbox
  const handleTestDriveRoute = (route: PhilippineRoute) => {
    setActiveRoute(route);
    setSafetyScore(100);
    setCurrentView('driving');
  };

  // Reload data after backup import
  const handleReloadData = () => {
    setProfile(storageService.getProfile());
    setTrucks(storageService.getTrucks());
    setTripLogs(storageService.getTripLogs());
    setChallenges(storageService.getChallenges());
    setCustomRoutes(storageService.getCustomRoutes());
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      profile.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Universal App Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        profile={profile}
        setProfile={setProfile}
        onOpenDispatcher={() => setIsDispatcherOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOffline={isOffline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {/* VIEW 1: DRIVING SIMULATOR */}
        {currentView === 'driving' && (
          <div className="space-y-4">
            {/* Quick Route & Cargo Selection Dropdowns */}
            <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              profile.darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            } shadow-sm`}>
              {/* Route Selector */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="w-full">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Philippine Route</span>
                  <select
                    value={activeRoute.id}
                    onChange={(e) => {
                      const all = [...PHILIPPINE_ROUTES, ...customRoutes];
                      const found = all.find(r => r.id === e.target.value);
                      if (found) {
                        setActiveRoute(found);
                        setSafetyScore(100);
                      }
                    }}
                    className="w-full bg-transparent font-bold text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <optgroup label="Iconic Philippine Highways">
                      {PHILIPPINE_ROUTES.map(r => (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                          {r.name} ({r.distanceKm} km • {r.terrainType})
                        </option>
                      ))}
                    </optgroup>
                    {customRoutes.length > 0 && (
                      <optgroup label="Custom Sandbox Routes">
                        {customRoutes.map(r => (
                          <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                            {r.name} ({r.distanceKm} km)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Cargo Selector */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Package className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="w-full">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Cargo Manifest</span>
                  <select
                    value={activeCargo.id}
                    onChange={(e) => {
                      const found = CARGO_CATALOG.find(c => c.id === e.target.value);
                      if (found) setActiveCargo(found);
                    }}
                    className="w-full bg-transparent font-bold text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {CARGO_CATALOG.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.name} ({c.weightTons} T • ₱{c.valuePhp.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vehicle Indicator & Fast Selector */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Driving Vehicle</span>
                  <select
                    value={activeTruck.id}
                    onChange={(e) => {
                      const newId = e.target.value as TruckId;
                      setProfile(p => ({ ...p, activeTruckId: newId }));
                      truckAudio.playWrenchClick();
                    }}
                    className="bg-slate-900 border border-slate-700 text-amber-400 font-bold text-xs rounded-lg px-2 py-1 max-w-[200px] truncate cursor-pointer focus:outline-none"
                  >
                    <optgroup label="★ 2026 Modern Fleet">
                      {trucks.filter(t => t.yearModel === 2026).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} (2026 • {t.brand})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Classic Fleet">
                      {trucks.filter(t => t.yearModel !== 2026).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Mode Selector & 2026 Highlights Banner */}
            <div className="flex items-center justify-between gap-2 flex-wrap px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => {
                      if (!isWebGLSupported) {
                        truckAudio.playAirBrakeHiss();
                        return;
                      }
                      setSimDimension('3D');
                    }}
                    title={isWebGLSupported ? 'Switch to 3D Next-Gen View' : 'WebGL hardware acceleration is disabled in this environment'}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                      simDimension === '3D'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                        : isWebGLSupported
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>3D Next-Gen View</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">2026</span>
                  </button>
                  <button
                    onClick={() => setSimDimension('2D')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                      simDimension === '2D'
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>2D Top-Down View</span>
                  </button>
                </div>

                {activeTruck.yearModel === 2026 && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    <span>{activeTruck.techBadge || '2026 Aerodynamic Flagship'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                {simDimension === '3D' ? (
                  <span>Camera: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">C</kbd> or <Eye className="inline w-3 h-3 text-amber-400" /> switch views (Cockpit / Chase / Drone)</span>
                ) : (
                  <span>Classic 2D Highway view</span>
                )}
              </div>
            </div>

            {/* Driving Simulator Canvas (3D Modern Engine or 2D Top-Down) */}
            {simDimension === '3D' && isWebGLSupported ? (
              <SimulatorErrorBoundary
                fallback={
                  <TruckCanvas
                    truck={activeTruck}
                    route={activeRoute}
                    cargo={activeCargo}
                    isEngineOn={isEngineOn}
                    speedKmh={speedKmh}
                    setSpeedKmh={setSpeedKmh}
                    rpm={rpm}
                    setRpm={setRpm}
                    gear={gear}
                    isHighRange={isHighRange}
                    airPressureBar={airPressureBar}
                    setAirPressureBar={setAirPressureBar}
                    engineTemp={engineTemp}
                    setEngineTemp={setEngineTemp}
                    fuelPercent={fuelPercent}
                    setFuelPercent={setFuelPercent}
                    parkingBrakeActive={parkingBrakeActive}
                    jakeBrakeActive={jakeBrakeActive}
                    headlights={headlights}
                    hazardActive={hazardActive}
                    wipersActive={wipersActive}
                    throttlePressed={throttlePressed}
                    brakePressed={brakePressed}
                    steerLeftPressed={steerLeftPressed}
                    steerRightPressed={steerRightPressed}
                    onMissionComplete={handleMissionComplete}
                    safetyScore={safetyScore}
                    setSafetyScore={setSafetyScore}
                    activeAds={profile.activeAds}
                    hasAdFree={profile.hasAdFree}
                    onOpenAdvertising={() => setCurrentView('advertising')}
                  />
                }
                onError={() => {
                  setIsWebGLSupported(false);
                  setSimDimension('2D');
                }}
              >
                <TruckSimulator3D
                  truck={activeTruck}
                  route={activeRoute}
                  cargo={activeCargo}
                  isEngineOn={isEngineOn}
                  speedKmh={speedKmh}
                  setSpeedKmh={setSpeedKmh}
                  rpm={rpm}
                  setRpm={setRpm}
                  gear={gear}
                  isHighRange={isHighRange}
                  airPressureBar={airPressureBar}
                  setAirPressureBar={setAirPressureBar}
                  engineTemp={engineTemp}
                  setEngineTemp={setEngineTemp}
                  fuelPercent={fuelPercent}
                  setFuelPercent={setFuelPercent}
                  parkingBrakeActive={parkingBrakeActive}
                  jakeBrakeActive={jakeBrakeActive}
                  headlights={headlights}
                  hazardActive={hazardActive}
                  wipersActive={wipersActive}
                  throttlePressed={throttlePressed}
                  brakePressed={brakePressed}
                  steerLeftPressed={steerLeftPressed}
                  steerRightPressed={steerRightPressed}
                  onMissionComplete={handleMissionComplete}
                  safetyScore={safetyScore}
                  setSafetyScore={setSafetyScore}
                  activeAds={profile.activeAds}
                  hasAdFree={profile.hasAdFree}
                  onOpenAdvertising={() => setCurrentView('advertising')}
                  onFallbackTo2D={() => {
                    setIsWebGLSupported(false);
                    setSimDimension('2D');
                  }}
                />
              </SimulatorErrorBoundary>
            ) : (
              <TruckCanvas
                truck={activeTruck}
                route={activeRoute}
                cargo={activeCargo}
                isEngineOn={isEngineOn}
                speedKmh={speedKmh}
                setSpeedKmh={setSpeedKmh}
                rpm={rpm}
                setRpm={setRpm}
                gear={gear}
                isHighRange={isHighRange}
                airPressureBar={airPressureBar}
                setAirPressureBar={setAirPressureBar}
                engineTemp={engineTemp}
                setEngineTemp={setEngineTemp}
                fuelPercent={fuelPercent}
                setFuelPercent={setFuelPercent}
                parkingBrakeActive={parkingBrakeActive}
                jakeBrakeActive={jakeBrakeActive}
                headlights={headlights}
                hazardActive={hazardActive}
                wipersActive={wipersActive}
                throttlePressed={throttlePressed}
                brakePressed={brakePressed}
                steerLeftPressed={steerLeftPressed}
                steerRightPressed={steerRightPressed}
                onMissionComplete={handleMissionComplete}
                safetyScore={safetyScore}
                setSafetyScore={setSafetyScore}
                activeAds={profile.activeAds}
                hasAdFree={profile.hasAdFree}
                onOpenAdvertising={() => setCurrentView('advertising')}
              />
            )}

            {/* Realistic Truck Dashboard Telemetry & Switches */}
            <TruckDashboard
              speedKmh={speedKmh}
              rpm={rpm}
              gear={gear}
              isHighRange={isHighRange}
              onToggleRange={() => {
                truckAudio.playWrenchClick();
                setIsHighRange(prev => !prev);
              }}
              airPressureBar={airPressureBar}
              engineTemp={engineTemp}
              fuelPercent={fuelPercent}
              isEngineOn={isEngineOn}
              onToggleEngine={handleToggleEngine}
              headlights={headlights}
              onCycleHeadlights={() => {
                truckAudio.playWrenchClick();
                setHeadlights(prev => (prev === 'off' ? 'low' : prev === 'low' ? 'high' : 'off'));
              }}
              hazardActive={hazardActive}
              onToggleHazard={() => {
                truckAudio.playWrenchClick();
                setHazardActive(prev => !prev);
              }}
              jakeBrakeActive={jakeBrakeActive}
              onToggleJakeBrake={() => {
                truckAudio.playJakeBrake();
                setJakeBrakeActive(prev => !prev);
              }}
              parkingBrakeActive={parkingBrakeActive}
              onToggleParkingBrake={handleToggleParkingBrake}
              wipersActive={wipersActive}
              onToggleWipers={() => {
                truckAudio.playWrenchClick();
                setWipersActive(prev => !prev);
              }}
              hornType={activeTruck.hornType}
              darkMode={profile.darkMode}
            />

            {/* Mobile & Tablet Pedals & Virtual Touch Steering */}
            <MobileControls
              onThrottleStart={() => setThrottlePressed(true)}
              onThrottleEnd={() => setThrottlePressed(false)}
              onBrakeStart={() => setBrakePressed(true)}
              onBrakeEnd={() => {
                setBrakePressed(false);
                truckAudio.playAirBrakeHiss();
              }}
              onSteerLeftStart={() => setSteerLeftPressed(true)}
              onSteerLeftEnd={() => setSteerLeftPressed(false)}
              onSteerRightStart={() => setSteerRightPressed(true)}
              onSteerRightEnd={() => setSteerRightPressed(false)}
              onShiftUp={handleShiftUp}
              onShiftDown={handleShiftDown}
              onShiftReverse={handleShiftReverse}
              gear={gear}
            />
          </div>
        )}

        {/* VIEW 2: TRUCK CUSTOMIZER & GARAGE */}
        {currentView === 'garage' && (
          <GarageView
            trucks={trucks}
            setTrucks={setTrucks}
            profile={profile}
            setProfile={setProfile}
            onSelectActiveTruck={handleSelectActiveTruck}
          />
        )}

        {/* VIEW 3: CARGO MASTER LOGISTICS EDUCATIONAL MINI-GAME */}
        {currentView === 'cargo_master' && (
          <CargoMasterGame
            profile={profile}
            setProfile={setProfile}
            onCompleteLesson={handleCompleteEducationalLesson}
          />
        )}

        {/* VIEW 4: JUNIOR TRUCK MECHANIC BAY MINI-GAME */}
        {currentView === 'mechanics_bay' && (
          <MechanicsBayGame
            profile={profile}
            setProfile={setProfile}
            onCompleteLesson={handleCompleteEducationalLesson}
          />
        )}

        {/* VIEW 5: MULTIPLAYER FREIGHT BOARD & COMMODITY EXCHANGE */}
        {currentView === 'freight_exchange' && (
          <FreightExchange
            profile={profile}
            setProfile={setProfile}
            onAcceptContract={handleAcceptContract}
          />
        )}

        {/* VIEW 6: SANDBOX ROUTE DESIGNER */}
        {currentView === 'route_sandbox' && (
          <RouteDesigner
            profile={profile}
            customRoutes={customRoutes}
            setCustomRoutes={setCustomRoutes}
            onTestDriveRoute={handleTestDriveRoute}
          />
        )}

        {/* VIEW 7: FLEET DASHBOARD & LEADERBOARDS */}
        {currentView === 'dashboard' && (
          <FleetDashboard
            profile={profile}
            setProfile={setProfile}
            challenges={challenges}
            setChallenges={setChallenges}
            tripLogs={tripLogs}
            onStartDelivery={() => setCurrentView('driving')}
          />
        )}

        {/* VIEW 8: PAST DELIVERY LOGS & MANIFESTS */}
        {currentView === 'logs' && (
          <PastTripLogs
            tripLogs={tripLogs}
            profile={profile}
          />
        )}

        {/* VIEW 9: HIGHWAY BILLBOARD & $10/MO SUBSCRIPTION HUB */}
        {currentView === 'advertising' && (
          <AdvertisingHub
            profile={profile}
            setProfile={setProfile}
            onGoDriving={() => setCurrentView('driving')}
          />
        )}
      </main>

      {/* AI Logistics Dispatcher Modal */}
      <DispatcherModal
        isOpen={isDispatcherOpen}
        onClose={() => setIsDispatcherOpen(false)}
        profile={profile}
        currentTruck={activeTruck}
        currentCargo={activeCargo}
        currentRoute={activeRoute}
      />

      {/* Settings, Language & Cloud Sync Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        setProfile={setProfile}
        onReloadData={handleReloadData}
      />
    </div>
  );
}

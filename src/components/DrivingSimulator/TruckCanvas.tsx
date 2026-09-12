import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TruckModel, PhilippineRoute, CargoItem, TripLog, BillboardAd } from '../../types/truck';
import { truckAudio } from '../../services/audioService';

interface TruckCanvasProps {
  truck: TruckModel;
  route: PhilippineRoute;
  cargo: CargoItem;
  isEngineOn: boolean;
  speedKmh: number;
  setSpeedKmh: React.Dispatch<React.SetStateAction<number>>;
  rpm: number;
  setRpm: React.Dispatch<React.SetStateAction<number>>;
  gear: number;
  isHighRange: boolean;
  airPressureBar: number;
  setAirPressureBar: React.Dispatch<React.SetStateAction<number>>;
  engineTemp: number;
  setEngineTemp: React.Dispatch<React.SetStateAction<number>>;
  fuelPercent: number;
  setFuelPercent: React.Dispatch<React.SetStateAction<number>>;
  parkingBrakeActive: boolean;
  jakeBrakeActive: boolean;
  headlights: 'off' | 'low' | 'high';
  hazardActive: boolean;
  wipersActive: boolean;
  throttlePressed: boolean;
  brakePressed: boolean;
  steerLeftPressed: boolean;
  steerRightPressed: boolean;
  onMissionComplete: (log: TripLog) => void;
  safetyScore: number;
  setSafetyScore: React.Dispatch<React.SetStateAction<number>>;
  activeAds?: BillboardAd[];
  hasAdFree?: boolean;
  onOpenAdvertising?: () => void;
}

interface TrafficVehicle {
  x: number;
  y: number;
  speed: number;
  type: 'jeepney' | 'tricycle' | 'bus' | 'sedan';
  lane: number;
  color: string;
}

interface RoadObstacle {
  x: number;
  y: number;
  type: 'pothole' | 'cone' | 'toll_gate';
  passed: boolean;
}

export const TruckCanvas: React.FC<TruckCanvasProps> = ({
  truck,
  route,
  cargo,
  isEngineOn,
  speedKmh,
  setSpeedKmh,
  setRpm,
  gear,
  isHighRange,
  airPressureBar,
  setAirPressureBar,
  engineTemp,
  setEngineTemp,
  setFuelPercent,
  parkingBrakeActive,
  jakeBrakeActive,
  headlights,
  hazardActive,
  wipersActive,
  throttlePressed,
  brakePressed,
  steerLeftPressed,
  steerRightPressed,
  onMissionComplete,
  safetyScore,
  setSafetyScore,
  activeAds = [],
  hasAdFree = false,
  onOpenAdvertising,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Internal vehicle physics state
  const stateRef = useRef({
    x: 400,
    y: 500,
    headingAngle: -Math.PI / 2, // Facing UP initially
    trailerAngle: -Math.PI / 2,
    linearVelocity: 0,
    angularVelocity: 0,
    distanceTraveledKm: 0,
    hazardBlink: 0,
    wiperPhase: 0,
    exhaustPuffs: [] as Array<{ x: number; y: number; alpha: number; radius: number }>,
    rainDrops: [] as Array<{ x: number; y: number; speed: number; len: number }>,
    traffic: [] as TrafficVehicle[],
    obstacles: [] as RoadObstacle[],
    tollGateOpen: false,
    missionFinished: false,
    cameraY: 0,
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Show transient alert message on screen
  const notify = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // Initialize environment and traffic
  useEffect(() => {
    const s = stateRef.current;
    s.distanceTraveledKm = 0;
    s.linearVelocity = 0;
    s.missionFinished = false;
    s.tollGateOpen = false;

    // Seed traffic
    const trafficList: TrafficVehicle[] = [];
    const colors = ['#dc2626', '#0284c7', '#ea580c', '#16a34a', '#ca8a04', '#7c3aed'];
    for (let i = 0; i < 6; i++) {
      const types: Array<'jeepney' | 'tricycle' | 'bus' | 'sedan'> = ['jeepney', 'tricycle', 'bus', 'sedan'];
      const type = types[Math.floor(Math.random() * types.length)];
      const lane = Math.floor(Math.random() * 3); // 0, 1, 2
      trafficList.push({
        x: 310 + lane * 85,
        y: -300 - i * 380,
        speed: type === 'tricycle' ? 1.5 : type === 'jeepney' ? 2.8 : 3.5,
        type,
        lane,
        color: colors[i % colors.length],
      });
    }
    s.traffic = trafficList;

    // Seed road obstacles & toll gate
    s.obstacles = [
      { x: 340, y: -900, type: 'pothole', passed: false },
      { x: 480, y: -1800, type: 'pothole', passed: false },
      { x: 400, y: -2800, type: 'toll_gate', passed: false },
      { x: 420, y: -3800, type: 'cone', passed: false },
      { x: 320, y: -4900, type: 'pothole', passed: false },
    ];

    // Seed rain if rainy weather
    s.rainDrops = [];
    for (let r = 0; r < 90; r++) {
      s.rainDrops.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        speed: 12 + Math.random() * 8,
        len: 12 + Math.random() * 10,
      });
    }
  }, [route.id]);

  // Main animation and physics loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const s = stateRef.current;

      // 1. ENGINE & DRIVING PHYSICS CALCULATIONS
      if (isEngineOn && !parkingBrakeActive && !s.missionFinished) {
        // Gear calculation & Max speed for current gear
        const gearRatio = gear === -1 ? 0.35 : Math.max(0.2, (gear + (isHighRange ? 3 : 0)) * 0.18);
        const topSpeedCurrentGear = gear === -1 ? 25 : (gear + (isHighRange ? 3 : 0)) * 18;

        // Effective mass including cargo payload
        const totalMassTons = (truck.category === 'Light Heavy' ? 6 : 14) + cargo.weightTons;
        const enginePower = (truck.baseHorsepower + truck.engineLevel * 40) / totalMassTons;

        // Acceleration
        if (throttlePressed) {
          if (gear === -1) {
            s.linearVelocity = Math.max(-6, s.linearVelocity - 0.08 * enginePower);
          } else if (gear > 0) {
            const targetVel = (topSpeedCurrentGear * 1000) / 3600 / 3; // canvas units
            if (s.linearVelocity < targetVel) {
              s.linearVelocity += 0.09 * enginePower * gearRatio;
            }
          }
          // Exhaust smoke emission
          if (Math.random() < 0.3) {
            s.exhaustPuffs.push({
              x: s.x - Math.cos(s.headingAngle) * 20,
              y: s.y - Math.sin(s.headingAngle) * 20,
              alpha: 0.7,
              radius: 4,
            });
          }
        }

        // Brakes & Jake Brake deceleration
        if (brakePressed) {
          const brakeForce = 0.22 * (1 + truck.brakesLevel * 0.15);
          if (s.linearVelocity > 0) {
            s.linearVelocity = Math.max(0, s.linearVelocity - brakeForce);
          } else if (s.linearVelocity < 0) {
            s.linearVelocity = Math.min(0, s.linearVelocity + brakeForce);
          }
          // Air tank pressure depletion
          setAirPressureBar(prev => Math.max(4.5, prev - dt * 0.15));
        }

        if (jakeBrakeActive && s.linearVelocity > 1) {
          s.linearVelocity = Math.max(0, s.linearVelocity - 0.12);
        }

        // Natural drag / friction
        if (!throttlePressed) {
          s.linearVelocity *= 0.985;
          if (Math.abs(s.linearVelocity) < 0.02) s.linearVelocity = 0;
        }

        // Regenerate air pressure if compressor runs
        setAirPressureBar(prev => Math.min(10, prev + dt * 0.08));

        // Steering dynamics (wheelbase turn rate)
        const steerSpeed = 0.035 * (1 + truck.suspensionLevel * 0.05);
        if (steerLeftPressed) {
          s.angularVelocity = -steerSpeed;
        } else if (steerRightPressed) {
          s.angularVelocity = steerSpeed;
        } else {
          s.angularVelocity = 0;
        }

        // Apply turning only if moving
        if (Math.abs(s.linearVelocity) > 0.05) {
          const turnDirection = s.linearVelocity > 0 ? 1 : -1;
          s.headingAngle += s.angularVelocity * turnDirection;
        }

        // Trailer hitch kinematic articulation
        if (truck.hasTrailer) {
          const hitchDistance = 42; // Distance from cab center to trailer hitch
          const trailerLength = truck.trailerLength * 2.2;
          const deltaAngle = s.headingAngle - s.trailerAngle;
          // Articulation lag
          s.trailerAngle += (deltaAngle * (s.linearVelocity * 0.08)) / (trailerLength / 10);
        } else {
          s.trailerAngle = s.headingAngle;
        }

        // Update Position
        s.x += Math.cos(s.headingAngle) * s.linearVelocity;
        s.y += Math.sin(s.headingAngle) * s.linearVelocity;

        // Keep truck inside road boundaries
        if (s.x < 210) {
          s.x = 210;
          s.linearVelocity *= 0.8;
          setSafetyScore(prev => Math.max(50, prev - 0.2));
        }
        if (s.x > 590) {
          s.x = 590;
          s.linearVelocity *= 0.8;
          setSafetyScore(prev => Math.max(50, prev - 0.2));
        }

        // Distance accumulator
        const currentKmh = Math.abs(s.linearVelocity) * 3.6 * 3;
        setSpeedKmh(currentKmh);
        s.distanceTraveledKm += (currentKmh * dt) / 3600;

        // RPM calculation
        const calculatedRpm = 650 + (currentKmh / (topSpeedCurrentGear || 60)) * 1700;
        const targetRpm = throttlePressed ? Math.min(2600, calculatedRpm + 400) : Math.max(650, calculatedRpm);
        setRpm(targetRpm);
        truckAudio.updateEngineRpm(targetRpm / 2600, throttlePressed);

        // Engine heat & Fuel consumption
        setEngineTemp(prev => {
          const targetTemp = 82 + (route.terrainType === 'Mountain Zigzag' ? 12 : 0) + (throttlePressed ? 6 : 0);
          return prev + (targetTemp - prev) * 0.02;
        });
        setFuelPercent(prev => Math.max(0, prev - dt * 0.008));
      } else {
        s.linearVelocity = 0;
        setSpeedKmh(0);
        setRpm(isEngineOn ? 650 : 0);
        truckAudio.updateEngineRpm(0.1, false);
      }

      // Camera Y tracking
      s.cameraY = s.y - 420;

      // Check Mission Completion
      if (!s.missionFinished && s.distanceTraveledKm >= route.distanceKm) {
        s.missionFinished = true;
        s.linearVelocity = 0;
        setSpeedKmh(0);
        truckAudio.playSuccessChime();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        notify(`🎉 Byahe Successful! You delivered ${cargo.name} to ${route.name}!`);

        const newLog: TripLog = {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          dateString: new Date().toLocaleDateString(),
          truckName: truck.name,
          routeName: route.name,
          cargoName: cargo.name,
          cargoWeightTons: cargo.weightTons,
          distanceKm: route.distanceKm,
          payoutPhp: cargo.valuePhp,
          fuelUsedLiters: Math.round(route.distanceKm * 0.38 * 10) / 10,
          safetyScore: Math.round(safetyScore),
          status: safetyScore > 75 ? 'Completed' : 'Delayed',
          notes: `Safe driving along ${route.region} highway. Center of gravity maintained.`,
        };

        onMissionComplete(newLog);
      }

      // 2. CANVAS RENDERING
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Translate camera to center around truck Y
      ctx.translate(0, -s.cameraY);

      // --- Landscape / Road Shoulders ---
      const viewTop = s.cameraY - 200;
      const viewBottom = s.cameraY + canvas.height + 200;

      // Grass & Terrain
      ctx.fillStyle = route.terrainType === 'Mountain Zigzag' ? '#14532d' : route.terrainType === 'Coastal Province' ? '#15803d' : '#1e293b';
      ctx.fillRect(0, viewTop, canvas.width, viewBottom - viewTop);

      // Asphalt Road Surface
      ctx.fillStyle = '#334155';
      ctx.fillRect(200, viewTop, 400, viewBottom - viewTop);

      // Yellow Road Shoulders / Curbs
      ctx.fillStyle = '#eab308';
      ctx.fillRect(194, viewTop, 6, viewBottom - viewTop);
      ctx.fillRect(600, viewTop, 6, viewBottom - viewTop);

      // White Lane Dashes
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.setLineDash([25, 25]);
      ctx.beginPath();
      ctx.moveTo(333, viewTop);
      ctx.lineTo(333, viewBottom);
      ctx.moveTo(466, viewTop);
      ctx.lineTo(466, viewBottom);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Road Signage & Markers
      const signY = Math.floor(s.y / 800) * 800;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(110, signY - 200, 80, 44);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(route.region.toUpperCase(), 118, signY - 184);
      ctx.fillText(`LIMIT ${route.speedLimitKmh}`, 118, signY - 168);

      // Roadside Highway Billboard ($10/mo ad slots vs Ad-Free Pro Nature Murals)
      const billboardInterval = 1400;
      const currentBillboardIndex = Math.abs(Math.floor(s.y / billboardInterval));
      const billboardY = Math.floor(s.y / billboardInterval) * billboardInterval;
      if (billboardY > viewTop - 150 && billboardY < viewBottom + 150) {
        ctx.save();
        ctx.translate(615, billboardY - 100);

        // Steel support column
        ctx.fillStyle = '#475569';
        ctx.fillRect(55, 64, 18, 50);

        if (hasAdFree) {
          // VIP Ad-Free: Scenic Philippine Nature Mural
          ctx.fillStyle = '#065f46';
          ctx.fillRect(0, 0, 140, 64);
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(0, 0, 140, 64);

          ctx.fillStyle = '#ecfdf5';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('PHILIPPINE SCENIC BYWAY', 10, 22);
          ctx.font = '8px sans-serif';
          ctx.fillText('Protected Nature Corridor', 10, 38);
          ctx.fillStyle = '#a7f3d0';
          ctx.fillText('★ Ad-Free Pro Fleet Pass', 10, 52);
        } else {
          // Highway Billboard Ad
          const ads = activeAds.length > 0 ? activeAds : [];
          const ad = ads[currentBillboardIndex % (ads.length || 1)];
          const bg = ad?.bgColor || '#1e3a8a';
          const txt = ad?.textColor || '#ffffff';
          const bTitle = ad?.brandName || 'PETRON TURBO DIESEL';
          const bTag = ad?.tagline || 'Power for Mountain Climbs';
          const bCta = ad?.ctaText || 'Refuel at Highway Plaza';

          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, 148, 64);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(0, 0, 148, 64);

          // Billboard Spotlights
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(20, 0, 2.5, 0, Math.PI * 2);
          ctx.arc(74, 0, 2.5, 0, Math.PI * 2);
          ctx.arc(128, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Brand Title
          ctx.fillStyle = txt;
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(bTitle.substring(0, 20).toUpperCase(), 8, 20);

          // Tagline
          ctx.font = '7.5px sans-serif';
          ctx.fillText(bTag.substring(0, 26), 8, 36);

          // Call to action / sponsor pill
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 7.5px sans-serif';
          ctx.fillText(bCta.substring(0, 22), 8, 52);
        }
        ctx.restore();
      }

      // Render Obstacles (Potholes, Toll Gates, Cones)
      s.obstacles.forEach(obs => {
        if (obs.type === 'pothole') {
          // Philippine Lubak / Pothole
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(obs.x, obs.y, 24, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Pothole collision check with truck
          const dist = Math.hypot(s.x - obs.x, s.y - obs.y);
          if (dist < 32 && !obs.passed) {
            obs.passed = true;
            truckAudio.playWrenchClick();
            setSafetyScore(prev => Math.max(40, prev - 4));
            notify('⚠️ Lubak! Pothole hit! Reduce speed to protect truck suspension and cargo.');
          }
        } else if (obs.type === 'toll_gate') {
          // RFID Toll Plaza (NLEX / SLEX / SCTEX)
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(180, obs.y - 20, 440, 40);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('RFID TOLLWAY BARRIER (Autosweep / Easytrip)', 240, obs.y + 4);

          // Barrier arm
          const tollDist = Math.hypot(s.x - 400, s.y - obs.y);
          if (tollDist < 140) {
            s.tollGateOpen = true;
          }
          ctx.fillStyle = s.tollGateOpen ? '#22c55e' : '#ef4444';
          ctx.fillRect(300, obs.y - 8, s.tollGateOpen ? 30 : 200, 14);
        } else if (obs.type === 'cone') {
          // Traffic cones
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render Traffic (Jeepneys, Tricycles, Buses)
      s.traffic.forEach(vehicle => {
        // Move traffic vehicle downward
        vehicle.y += vehicle.speed;
        if (vehicle.y > s.y + 700) {
          vehicle.y = s.y - 800 - Math.random() * 400;
          vehicle.lane = Math.floor(Math.random() * 3);
          vehicle.x = 270 + vehicle.lane * 110;
        }

        ctx.save();
        ctx.translate(vehicle.x, vehicle.y);

        if (vehicle.type === 'jeepney') {
          // Iconic Philippine Jeepney
          ctx.fillStyle = vehicle.color;
          ctx.fillRect(-16, -35, 32, 70);
          // Stainless steel hood
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-14, -33, 28, 25);
          // Windshield
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-12, -7, 24, 10);
          // Colorful passenger roof rails
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(-15, 5, 30, 26);
          // Pinoy Jeepney lettering
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText('SARAO', -12, 18);
        } else if (vehicle.type === 'tricycle') {
          // Provincial Tricycle
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-10, -18, 12, 36); // Motorcycle body
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(4, -14, 18, 30); // Passenger sidecar
        } else if (vehicle.type === 'bus') {
          // Yellow Metro Manila City Bus
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-18, -48, 36, 96);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-16, -44, 32, 14); // Windshield
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('EDSA CAROUSEL', -15, 0);
        } else {
          // Standard sedan
          ctx.fillStyle = vehicle.color;
          ctx.fillRect(-14, -25, 28, 50);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-11, -12, 22, 10);
        }
        ctx.restore();

        // Traffic Collision check
        const dist = Math.hypot(s.x - vehicle.x, s.y - vehicle.y);
        if (dist < 42) {
          s.linearVelocity *= 0.5;
          setSafetyScore(prev => Math.max(30, prev - 5));
          truckAudio.playWrenchClick();
          notify('🚨 Minor Collision! Maintain safe distance from jeepneys and tricycles!');
        }
      });

      // Render Exhaust Smoke Puffs
      s.exhaustPuffs.forEach(p => {
        ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        p.alpha -= 0.02;
        p.radius += 0.4;
      });
      s.exhaustPuffs = s.exhaustPuffs.filter(p => p.alpha > 0);

      // --- RENDER HEAVY VEHICLE (CAB & TRAILER) ---
      // 1. Trailer (if articulated semi, rendered behind cab)
      if (truck.hasTrailer) {
        ctx.save();
        // Pivot point at fifth wheel hitch
        const hitchX = s.x - Math.cos(s.headingAngle) * 32;
        const hitchY = s.y - Math.sin(s.headingAngle) * 32;

        ctx.translate(hitchX, hitchY);
        ctx.rotate(s.trailerAngle);

        const trailerLen = truck.trailerLength * 2.2;
        const trailerWidth = 36;

        // Trailer Chassis
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-trailerWidth / 2, 0, trailerWidth, trailerLen);

        // Cargo Specific Visual on Trailer
        if (cargo.category === 'cold_chain') {
          // White Refrigerated Container (Reefer)
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-trailerWidth / 2 + 2, 6, trailerWidth - 4, trailerLen - 12);
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('REEFER -18°C', -14, trailerLen / 2);
        } else if (cargo.category === 'hazardous_fuel') {
          // Polished Stainless Tanker Cylinder
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.roundRect(-trailerWidth / 2 + 2, 4, trailerWidth - 4, trailerLen - 8, 12);
          ctx.fill();
          // Hazmat Diamond
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-6, trailerLen / 2 - 8, 12, 12);
        } else if (cargo.category === 'heavy_construction') {
          // Lowbed with Steel Beams
          ctx.fillStyle = '#475569';
          ctx.fillRect(-10, 8, 20, trailerLen - 16);
        } else {
          // Shipping Container / Covered Tarpaulin Sacks
          ctx.fillStyle = truck.color;
          ctx.fillRect(-trailerWidth / 2 + 2, 6, trailerWidth - 4, trailerLen - 12);
          // Pinoy Truck Slogan Decal
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText(truck.decal, -15, trailerLen / 2);
        }

        // Dual Tandem Trailer Axles / Tires
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-trailerWidth / 2 - 4, trailerLen - 28, 5, 12);
        ctx.fillRect(trailerWidth / 2 - 1, trailerLen - 28, 5, 12);
        ctx.fillRect(-trailerWidth / 2 - 4, trailerLen - 12, 5, 12);
        ctx.fillRect(trailerWidth / 2 - 1, trailerLen - 12, 5, 12);

        // Trailer Mudflaps
        ctx.fillStyle = '#000000';
        ctx.fillRect(-trailerWidth / 2, trailerLen - 2, trailerWidth, 4);

        ctx.restore();
      }

      // 2. Heavy Truck Cab
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.headingAngle);

      const cabWidth = 38;
      const cabLength = 62;

      // Headlight Cones (projecting forward in night/rain)
      if (headlights !== 'off' || route.weather === 'rainy' || route.weather === 'foggy') {
        const coneLength = headlights === 'high' ? 240 : 160;
        const gradient = ctx.createRadialGradient(cabLength / 2, 0, 10, cabLength / 2 + coneLength, 0, 80);
        gradient.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        gradient.addColorStop(1, 'rgba(254, 240, 138, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(cabLength / 2, -12);
        ctx.lineTo(cabLength / 2 + coneLength, -50);
        ctx.lineTo(cabLength / 2 + coneLength, 50);
        ctx.lineTo(cabLength / 2, 12);
        ctx.closePath();
        ctx.fill();
      }

      // Wheels / Heavy Tires
      ctx.fillStyle = '#0f172a';
      // Front Steer Axle Tires
      ctx.fillRect(cabLength / 4 - 4, -cabWidth / 2 - 5, 12, 5);
      ctx.fillRect(cabLength / 4 - 4, cabWidth / 2, 12, 5);
      // Rear Drive Axle Tires
      ctx.fillRect(-cabLength / 3 - 4, -cabWidth / 2 - 6, 12, 6);
      ctx.fillRect(-cabLength / 3 - 4, cabWidth / 2, 12, 6);

      // Cab Body
      ctx.fillStyle = truck.color;
      ctx.beginPath();
      ctx.roundRect(-cabLength / 2, -cabWidth / 2, cabLength, cabWidth, 8);
      ctx.fill();

      // Front Windshield
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cabLength / 6, -cabWidth / 2 + 4, 14, cabWidth - 8);

      // Roof Air Deflector / Pinoy Decal
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(-cabLength / 4, -cabWidth / 2 + 6, 18, cabWidth - 12);

      // Chrome Bullbar & Dual Chrome Side Mirrors
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cabLength / 2 - 2, -cabWidth / 2 + 4, 4, cabWidth - 8); // Front bumper
      ctx.fillRect(cabLength / 6, -cabWidth / 2 - 6, 4, 6); // Left mirror
      ctx.fillRect(cabLength / 6, cabWidth / 2, 4, 6); // Right mirror

      // Windshield Wiper Lines (if active)
      if (wipersActive) {
        s.wiperPhase = (s.wiperPhase + 0.15) % (Math.PI * 2);
        const sweep = Math.sin(s.wiperPhase) * 6;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cabLength / 6 + 2, -6);
        ctx.lineTo(cabLength / 6 + 12, -6 + sweep);
        ctx.moveTo(cabLength / 6 + 2, 6);
        ctx.lineTo(cabLength / 6 + 12, 6 + sweep);
        ctx.stroke();
      }

      // Brake Lights (Bright red when service brake is pressed)
      if (brakePressed) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillRect(-cabLength / 2 - 2, -cabWidth / 2 + 2, 3, 6);
        ctx.fillRect(-cabLength / 2 - 2, cabWidth / 2 - 8, 3, 6);
        ctx.shadowBlur = 0;
      }

      // Hazard Lights (Blinking amber)
      s.hazardBlink = (s.hazardBlink + 1) % 40;
      if (hazardActive && s.hazardBlink < 20) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cabLength / 2 - 2, -cabWidth / 2, 4, 4);
        ctx.fillRect(cabLength / 2 - 2, cabWidth / 2 - 4, 4, 4);
        ctx.fillRect(-cabLength / 2, -cabWidth / 2, 4, 4);
        ctx.fillRect(-cabLength / 2, cabWidth / 2 - 4, 4, 4);
      }

      ctx.restore();

      // --- Rain Simulation Particles ---
      if (route.weather === 'rainy') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        s.rainDrops.forEach(r => {
          ctx.moveTo(r.x, r.y + s.cameraY);
          ctx.lineTo(r.x - 3, r.y + r.len + s.cameraY);
          r.y = (r.y + r.speed) % canvas.height;
        });
        ctx.stroke();
      }

      // --- Fog Overlay for Benguet Kennon Road ---
      if (route.weather === 'foggy') {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.28)';
        ctx.fillRect(0, viewTop, canvas.width, viewBottom - viewTop);
      }

      ctx.restore(); // Restore camera translation

      // Request next frame
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    isEngineOn,
    parkingBrakeActive,
    jakeBrakeActive,
    gear,
    isHighRange,
    throttlePressed,
    brakePressed,
    steerLeftPressed,
    steerRightPressed,
    truck,
    route,
    cargo,
    headlights,
    hazardActive,
    wipersActive,
    onMissionComplete,
    safetyScore,
    setSafetyScore,
    setSpeedKmh,
    setRpm,
    setAirPressureBar,
    setEngineTemp,
    setFuelPercent,
    notify,
  ]);

  const progressPercent = Math.min(100, Math.round((stateRef.current.distanceTraveledKm / route.distanceKm) * 100));

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 flex flex-col items-center">
      {/* Heads-up Route Progress Overlay */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
        {/* Route Badge */}
        <div className="bg-slate-900/85 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-xl shadow-md text-xs text-white">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{route.name}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Cargo: {cargo.name} ({cargo.weightTons} Tons)
          </span>
        </div>

        {/* Progress to Delivery Depot */}
        <div className="bg-slate-900/85 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-xl shadow-md text-xs text-right">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Delivery Progress:</span>
            <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
          </div>
          <div className="w-28 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Pop-up In-Cab Alert Notification */}
      {notification && (
        <div className="absolute top-16 z-20 px-4 py-2 rounded-xl bg-blue-600/95 text-white text-xs font-semibold shadow-lg backdrop-blur animate-bounce max-w-md text-center">
          {notification}
        </div>
      )}

      {/* Highway Billboard / Subscription Badge Overlay */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-auto">
        {hasAdFree ? (
          <button
            onClick={onOpenAdvertising}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold backdrop-blur shadow transition"
          >
            <span>★ VIP Pro Fleet (Ad-Free)</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdvertising}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/85 hover:bg-amber-600 border border-amber-500/40 text-amber-300 hover:text-white text-[11px] font-bold backdrop-blur shadow transition active:scale-95"
            title="Sponsor Highway Billboard or Remove Ads for $10/month"
          >
            <span>📢 Free Tier • Go Ad-Free or Sponsor Billboard ($10/mo)</span>
          </button>
        )}
      </div>

      {/* Main Simulation Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        className="w-full h-[320px] sm:h-[440px] md:h-[480px] object-cover cursor-crosshair"
      />
    </div>
  );
};

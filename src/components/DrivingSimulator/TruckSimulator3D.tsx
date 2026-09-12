import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Eye, 
  Camera, 
  Sun, 
  Sunset, 
  Moon, 
  CloudRain, 
  Compass, 
  Volume2, 
  Sparkles, 
  Maximize2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Tv
} from 'lucide-react';
import { TruckModel, PhilippineRoute, CargoItem, TripLog, BillboardAd } from '../../types/truck';
import { truckAudio } from '../../services/audioService';

export interface TruckSimulator3DProps {
  truck: TruckModel;
  route: PhilippineRoute;
  cargo: CargoItem;
  isEngineOn: boolean;
  speedKmh: number;
  setSpeedKmh: React.Dispatch<React.SetStateAction<number>>;
  rpm: number;
  setRpm: React.Dispatch<React.SetStateAction<number>>;
  gear: number; // -1 = R, 0 = N, 1-6 = gears
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
  onFallbackTo2D?: () => void;
}

export type CameraViewMode = 'chase' | 'cockpit' | 'bumper' | 'drone';
export type TimeOfDay = 'day' | 'sunset' | 'night' | 'rain';

export const TruckSimulator3D: React.FC<TruckSimulator3DProps> = ({
  truck,
  route,
  cargo,
  isEngineOn,
  speedKmh,
  setSpeedKmh,
  rpm,
  setRpm,
  gear,
  isHighRange,
  airPressureBar,
  setAirPressureBar,
  engineTemp,
  setEngineTemp,
  fuelPercent,
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
  onFallbackTo2D,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Safe WebGL pre-check
  const [webGLError, setWebGLError] = useState<string | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'WebGL context could not be created in this environment.';
      return null;
    } catch (e: any) {
      return e?.message || 'WebGL context failure';
    }
  });

  useEffect(() => {
    if (webGLError && onFallbackTo2D) {
      onFallbackTo2D();
    }
  }, [webGLError, onFallbackTo2D]);

  // User interactive camera & environment state
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [notification, setNotification] = useState<string | null>(null);
  const [currentBillboardAd, setCurrentBillboardAd] = useState<BillboardAd | null>(null);

  // Transient on-screen notifications
  const notify = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  }, []);

  // Internal physics & 3D scene tracking refs
  const physicsRef = useRef({
    truckPos: new THREE.Vector3(0, 0, 0),
    truckSpeed: 0, // m/s
    truckHeading: 0, // radians
    steerAngle: 0,
    trailerAngle: 0,
    distanceTraveledM: 0,
    hazardTimer: 0,
    wiperPhase: 0,
    engineRpmVal: 800,
    fuelVal: fuelPercent,
    airPressureVal: airPressureBar,
    engineTempVal: engineTemp,
    missionFinished: false,
    cameraOffset: new THREE.Vector3(0, 4.5, -11),
    cockpitOffset: new THREE.Vector3(-0.65, 2.35, 0.4),
    targetLookAt: new THREE.Vector3(0, 1.8, 12),
  });

  // Keep physics refs in sync with live props
  const controlsRef = useRef({
    isEngineOn,
    throttlePressed,
    brakePressed,
    steerLeftPressed,
    steerRightPressed,
    gear,
    isHighRange,
    parkingBrakeActive,
    jakeBrakeActive,
    headlights,
    hazardActive,
    wipersActive,
  });

  useEffect(() => {
    controlsRef.current = {
      isEngineOn,
      throttlePressed,
      brakePressed,
      steerLeftPressed,
      steerRightPressed,
      gear,
      isHighRange,
      parkingBrakeActive,
      jakeBrakeActive,
      headlights,
      hazardActive,
      wipersActive,
    };
  }, [
    isEngineOn,
    throttlePressed,
    brakePressed,
    steerLeftPressed,
    steerRightPressed,
    gear,
    isHighRange,
    parkingBrakeActive,
    jakeBrakeActive,
    headlights,
    hazardActive,
    wipersActive,
  ]);

  // Sync initial route weather to timeOfDay
  useEffect(() => {
    if (route.weather === 'rainy') setTimeOfDay('rain');
    else if (route.weather === 'night') setTimeOfDay('night');
    else if (route.weather === 'foggy') setTimeOfDay('sunset');
    else setTimeOfDay('day');
  }, [route.id, route.weather]);

  // Quick keyboard shortcut for cycling camera views ('C')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        setCameraMode(prev => {
          if (prev === 'chase') return 'cockpit';
          if (prev === 'cockpit') return 'bumper';
          if (prev === 'bumper') return 'drone';
          return 'chase';
        });
        truckAudio.playWrenchClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (webGLError) {
      if (onFallbackTo2D) onFallbackTo2D();
      return;
    }

    let animationFrameId: number = 0;
    let resizeObserver: ResizeObserver | null = null;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 520;

      // Safe WebGL pre-flight check before instantiating THREE.WebGLRenderer
      const testCanvas = document.createElement('canvas');
      const testGl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!testGl) {
        throw new Error('WebGL context could not be created in this browser or container sandbox.');
      }

      // 1. Scene & Renderer
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x38bdf8);
      scene.fog = new THREE.FogExp2(0x93c5fd, 0.0035);

      const camera = new THREE.PerspectiveCamera(54, width / height, 0.2, 1000);
      camera.position.set(0, 5, -12);

      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: false, 
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    const d = 35;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Dynamic Truck Headlights (3D SpotLights)
    const leftHeadlight = new THREE.SpotLight(0xfff5db, 0, 90, Math.PI / 5, 0.4, 1.2);
    const rightHeadlight = new THREE.SpotLight(0xfff5db, 0, 90, Math.PI / 5, 0.4, 1.2);
    leftHeadlight.castShadow = true;
    rightHeadlight.castShadow = true;
    scene.add(leftHeadlight);
    scene.add(rightHeadlight);
    const headlightTarget = new THREE.Object3D();
    scene.add(headlightTarget);
    leftHeadlight.target = headlightTarget;
    rightHeadlight.target = headlightTarget;

    // 3. Materials Library
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.85,
      metalness: 0.05,
    });
    const laneLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const shoulderLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x22543d, roughness: 0.9 });
    const guardrailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const tireRubberMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.5,
      transparent: true,
      opacity: 0.75,
    });
    const brakeLightMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      emissive: 0x000000,
      roughness: 0.3,
    });
    const hazardLightMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: 0x000000,
      roughness: 0.3,
    });
    const ledMatrixMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x93c5fd,
      emissiveIntensity: 0.4,
    });

    // 4. Philippine Endless Highway Track Construction
    const highwayGroup = new THREE.Group();
    scene.add(highwayGroup);

    // Create Highway Segments for infinite looping
    const SEGMENT_LENGTH = 160;
    const NUM_SEGMENTS = 5;
    const ROAD_WIDTH = 15; // 4 lanes

    interface RoadSegment {
      group: THREE.Group;
      baseZ: number;
    }
    const roadSegments: RoadSegment[] = [];

    // Helper to build a road segment
    const createRoadSegment = (baseZ: number): RoadSegment => {
      const segGroup = new THREE.Group();
      segGroup.position.z = baseZ;

      // Asphalt Surface
      const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH);
      const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.receiveShadow = true;
      segGroup.add(roadMesh);

      // Road Shoulders & Grass
      const grassGeo = new THREE.PlaneGeometry(120, SEGMENT_LENGTH);
      const grassMesh = new THREE.Mesh(grassGeo, grassMat);
      grassMesh.rotation.x = -Math.PI / 2;
      grassMesh.position.y = -0.05;
      grassMesh.receiveShadow = true;
      segGroup.add(grassMesh);

      // Lane Divider Dashes (3 lines for 4 lanes: -3.75, 0, 3.75)
      [-3.75, 0, 3.75].forEach(laneX => {
        const dashCount = Math.floor(SEGMENT_LENGTH / 10);
        for (let i = 0; i < dashCount; i++) {
          const dashGeo = new THREE.PlaneGeometry(0.2, 5);
          const dashMesh = new THREE.Mesh(dashGeo, laneLineMat);
          dashMesh.rotation.x = -Math.PI / 2;
          dashMesh.position.set(laneX, 0.01, -SEGMENT_LENGTH / 2 + i * 10 + 2.5);
          segGroup.add(dashMesh);
        }
      });

      // Yellow Solid Outer Edges
      [-ROAD_WIDTH / 2 + 0.3, ROAD_WIDTH / 2 - 0.3].forEach(edgeX => {
        const edgeGeo = new THREE.PlaneGeometry(0.28, SEGMENT_LENGTH);
        const edgeMesh = new THREE.Mesh(edgeGeo, shoulderLineMat);
        edgeMesh.rotation.x = -Math.PI / 2;
        edgeMesh.position.set(edgeX, 0.015, 0);
        segGroup.add(edgeMesh);
      });

      // Guardrails
      [-ROAD_WIDTH / 2 - 0.8, ROAD_WIDTH / 2 + 0.8].forEach(railX => {
        const railGeo = new THREE.BoxGeometry(0.25, 0.7, SEGMENT_LENGTH);
        const railMesh = new THREE.Mesh(railGeo, guardrailMat);
        railMesh.position.set(railX, 0.45, 0);
        railMesh.castShadow = true;
        railMesh.receiveShadow = true;
        segGroup.add(railMesh);

        // Guardrail support posts
        for (let p = -SEGMENT_LENGTH / 2 + 5; p < SEGMENT_LENGTH / 2; p += 8) {
          const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.85);
          const postMesh = new THREE.Mesh(postGeo, guardrailMat);
          postMesh.position.set(railX, 0.4, p);
          segGroup.add(postMesh);
        }
      });

      // Roadside Highway Streetlights (every 40m)
      for (let z = -SEGMENT_LENGTH / 2 + 20; z < SEGMENT_LENGTH / 2; z += 40) {
        const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 9);
        const poleMesh = new THREE.Mesh(poleGeo, chromeMat);
        poleMesh.position.set(ROAD_WIDTH / 2 + 2.2, 4.5, z);
        segGroup.add(poleMesh);

        // Horizontal Arm
        const armGeo = new THREE.CylinderGeometry(0.09, 0.09, 3.2);
        const armMesh = new THREE.Mesh(armGeo, chromeMat);
        armMesh.rotation.z = Math.PI / 2;
        armMesh.position.set(ROAD_WIDTH / 2 + 0.8, 8.8, z);
        segGroup.add(armMesh);

        // Lamp Fixture
        const lampGeo = new THREE.BoxGeometry(0.8, 0.25, 0.4);
        const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const lampMesh = new THREE.Mesh(lampGeo, lampMat);
        lampMesh.position.set(ROAD_WIDTH / 2 - 0.6, 8.7, z);
        segGroup.add(lampMesh);
      }

      // Roadside Coconut Palm Trees & Tropical Acacia
      for (let z = -SEGMENT_LENGTH / 2 + 10; z < SEGMENT_LENGTH / 2; z += 22) {
        // Left side coconut
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 8, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
        const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
        trunkMesh.position.set(-ROAD_WIDTH / 2 - 4.5 - Math.random() * 2, 4, z + Math.random() * 4);
        trunkMesh.rotation.z = (Math.random() - 0.5) * 0.15;
        trunkMesh.castShadow = true;
        segGroup.add(trunkMesh);

        // Palm Fronds Canopy
        const frondGroup = new THREE.Group();
        frondGroup.position.set(trunkMesh.position.x, 7.8, trunkMesh.position.z);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
        for (let f = 0; f < 8; f++) {
          const frondGeo = new THREE.ConeGeometry(1.6, 4.5, 4);
          const frondMesh = new THREE.Mesh(frondGeo, leafMat);
          frondMesh.rotation.x = Math.PI / 2.3;
          frondMesh.rotation.z = (f * Math.PI) / 4;
          frondGroup.add(frondMesh);
        }
        segGroup.add(frondGroup);
      }

      highwayGroup.add(segGroup);
      return { group: segGroup, baseZ };
    };

    for (let i = -1; i < NUM_SEGMENTS - 1; i++) {
      roadSegments.push(createRoadSegment(i * SEGMENT_LENGTH));
    }

    // 5. 3D Billboard Advertisements ($10/mo Ads & Pro Murals)
    const billboardCanvas = document.createElement('canvas');
    billboardCanvas.width = 512;
    billboardCanvas.height = 256;
    const billboardCtx = billboardCanvas.getContext('2d')!;

    const renderBillboardTexture = (ad: BillboardAd | null, adFree: boolean) => {
      billboardCtx.clearRect(0, 0, 512, 256);
      if (adFree) {
        // Scenic Philippine Nature Reserve Mural
        billboardCtx.fillStyle = '#064e3b';
        billboardCtx.fillRect(0, 0, 512, 256);
        billboardCtx.strokeStyle = '#34d399';
        billboardCtx.lineWidth = 10;
        billboardCtx.strokeRect(5, 5, 502, 246);

        billboardCtx.fillStyle = '#ecfdf5';
        billboardCtx.font = 'bold 32px sans-serif';
        billboardCtx.textAlign = 'center';
        billboardCtx.fillText('★ PHILIPPINE SCENIC BYWAYS ★', 256, 75);

        billboardCtx.font = '24px sans-serif';
        billboardCtx.fillStyle = '#a7f3d0';
        billboardCtx.fillText('Protected Mountain & Coastal Heritage Corridor', 256, 125);

        billboardCtx.font = 'bold 20px sans-serif';
        billboardCtx.fillStyle = '#fde047';
        billboardCtx.fillText('Byaheng Pinoy VIP Pro Fleet Pass Active', 256, 185);
      } else {
        const bg = ad?.bgColor || '#1e3a8a';
        const txt = ad?.textColor || '#ffffff';
        const title = ad?.brandName || 'PETRON TURBO DIESEL';
        const tagline = ad?.tagline || 'Clean Euro-6 Power for Heavy Philippine Hauling';
        const cta = ad?.ctaText || 'Refuel at NLEX & SLEX Megastations';
        const corridor = ad?.targetHighway || 'ALL LUZON HIGHWAYS';

        billboardCtx.fillStyle = bg;
        billboardCtx.fillRect(0, 0, 512, 256);
        billboardCtx.strokeStyle = '#f8fafc';
        billboardCtx.lineWidth = 10;
        billboardCtx.strokeRect(5, 5, 502, 246);

        billboardCtx.fillStyle = 'rgba(255,255,255,0.2)';
        billboardCtx.font = 'bold 16px monospace';
        billboardCtx.textAlign = 'center';
        billboardCtx.fillText(`[ ${corridor.toUpperCase()} SPONSOR BILLBOARD • $10/MO ]`, 256, 42);

        billboardCtx.fillStyle = txt;
        billboardCtx.font = '900 34px sans-serif';
        billboardCtx.fillText(title.toUpperCase(), 256, 95);

        billboardCtx.font = '500 20px sans-serif';
        billboardCtx.fillText(tagline, 256, 145);

        // CTA Pill
        billboardCtx.fillStyle = '#fde047';
        billboardCtx.beginPath();
        billboardCtx.roundRect(86, 175, 340, 48, 24);
        billboardCtx.fill();

        billboardCtx.fillStyle = '#0f172a';
        billboardCtx.font = 'bold 20px sans-serif';
        billboardCtx.fillText(cta, 256, 206);
      }
    };

    const initialAd = activeAds.length > 0 ? activeAds[0] : null;
    renderBillboardTexture(initialAd, hasAdFree);
    setCurrentBillboardAd(initialAd);

    const billboardTexture = new THREE.CanvasTexture(billboardCanvas);
    billboardTexture.colorSpace = THREE.SRGBColorSpace;
    const billboardMat = new THREE.MeshStandardMaterial({
      map: billboardTexture,
      roughness: 0.4,
      metalness: 0.1,
    });

    // 3D Giant Steel Billboard Mesh
    const billboardGroup = new THREE.Group();
    billboardGroup.position.set(ROAD_WIDTH / 2 + 5, 0, 110);
    scene.add(billboardGroup);

    // Steel Pillars
    [-4, 4].forEach(px => {
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, 12, 8);
      const pillarMesh = new THREE.Mesh(pillarGeo, guardrailMat);
      pillarMesh.position.set(px, 6, 0);
      billboardGroup.add(pillarMesh);
    });

    // Billboard Panel
    const boardPanelGeo = new THREE.BoxGeometry(16, 8, 0.5);
    const boardFaceMesh = new THREE.Mesh(boardPanelGeo, billboardMat);
    boardFaceMesh.position.set(0, 12, 0);
    boardFaceMesh.rotation.y = -Math.PI / 14;
    boardFaceMesh.castShadow = true;
    billboardGroup.add(boardFaceMesh);

    // Overhead Billboard Spotlights
    [-6, 0, 6].forEach(lx => {
      const spotArmGeo = new THREE.BoxGeometry(0.1, 1.2, 1.5);
      const spotArm = new THREE.Mesh(spotArmGeo, guardrailMat);
      spotArm.position.set(lx, 16.5, 0.6);
      billboardGroup.add(spotArm);

      const spotMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 0.6),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      spotMesh.rotation.x = Math.PI / 3;
      spotMesh.position.set(lx, 16.1, 1.2);
      billboardGroup.add(spotMesh);
    });

    // 6. BUILD THE 3D TRUCK (Distinctive Modern 2026 Models & Classics)
    const truckRoot = new THREE.Group();
    scene.add(truckRoot);

    // Dynamic truck body color from player profile / customization
    const truckBodyColor = new THREE.Color(truck.color || '#0284c7');
    const cabPaintMat = new THREE.MeshStandardMaterial({
      color: truckBodyColor,
      metalness: 0.6,
      roughness: 0.25,
    });

    // Modern 2026 Aero styling variables
    const is2026Model = truck.yearModel === 2026 || (truck.id && truck.id.includes('2026'));
    const isArticulated = truck.hasTrailer;

    // --- TRACTOR CABIN ---
    const cabGroup = new THREE.Group();
    truckRoot.add(cabGroup);

    // 2026 Cab dimensions (Aero styling)
    const cabWidth = 2.45;
    const cabHeight = is2026Model ? 3.1 : 2.7;
    const cabLength = is2026Model && truck.model3DType === 'curved_nose' ? 3.4 : 2.9;

    // Main Cab Body
    const cabGeo = new THREE.BoxGeometry(cabWidth, cabHeight, cabLength);
    const cabMesh = new THREE.Mesh(cabGeo, cabPaintMat);
    cabMesh.position.set(0, cabHeight / 2 + 0.8, 0);
    cabMesh.castShadow = true;
    cabMesh.receiveShadow = true;
    cabGroup.add(cabMesh);

    // 2026 Aerodynamic Roof Fairing / Wind Deflector
    if (is2026Model) {
      const roofFairingGeo = new THREE.ConeGeometry(cabWidth * 0.52, 1.4, 4);
      const roofFairingMesh = new THREE.Mesh(roofFairingGeo, cabPaintMat);
      roofFairingMesh.rotation.y = Math.PI / 4;
      roofFairingMesh.position.set(0, cabHeight + 1.2, -0.2);
      roofFairingMesh.castShadow = true;
      cabGroup.add(roofFairingMesh);
    }

    // 2026 Front Curved Windshield & Glass
    const windshieldGeo = new THREE.BoxGeometry(cabWidth - 0.2, 1.15, 0.1);
    const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMat);
    windshieldMesh.position.set(0, cabHeight + 0.15, cabLength / 2 + 0.02);
    windshieldMesh.rotation.x = 0.12; // modern aerodynamic slope
    cabGroup.add(windshieldMesh);

    // Side Door Windows
    [-cabWidth / 2 - 0.01, cabWidth / 2 + 0.01].forEach(sideX => {
      const sideGlassGeo = new THREE.BoxGeometry(0.05, 0.9, 1.3);
      const sideGlassMesh = new THREE.Mesh(sideGlassGeo, glassMat);
      sideGlassMesh.position.set(sideX, cabHeight + 0.15, 0.2);
      cabGroup.add(sideGlassMesh);
    });

    // 2026 Digital Mirror-Cam Wings vs Traditional Mirrors
    if (is2026Model) {
      // Sleek 2026 Aerodynamic Camera Stalks
      [-cabWidth / 2 - 0.28, cabWidth / 2 + 0.28].forEach(camX => {
        const camWingGeo = new THREE.BoxGeometry(0.45, 0.08, 0.18);
        const camWingMesh = new THREE.Mesh(camWingGeo, chromeMat);
        camWingMesh.position.set(camX, cabHeight + 0.45, 0.8);
        cabGroup.add(camWingMesh);

        // Digital Sensor Eye
        const sensorGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const sensorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const sensorMesh = new THREE.Mesh(sensorGeo, sensorMat);
        sensorMesh.position.set(camX > 0 ? 0.2 : -0.2, 0, -0.08);
        camWingMesh.add(sensorMesh);
      });
    } else {
      // Traditional Heavy Metal Mirrors
      [-cabWidth / 2 - 0.35, cabWidth / 2 + 0.35].forEach(mx => {
        const mirrorGeo = new THREE.BoxGeometry(0.12, 0.75, 0.28);
        const mirrorMesh = new THREE.Mesh(mirrorGeo, chromeMat);
        mirrorMesh.position.set(mx, cabHeight + 0.1, 0.85);
        cabGroup.add(mirrorMesh);
      });
    }

    // 2026 Grille & Brand Badging
    const grilleGeo = new THREE.BoxGeometry(cabWidth - 0.4, 1.3, 0.2);
    const grilleMat = new THREE.MeshStandardMaterial({
      color: is2026Model && truck.model3DType === 'wingvan' ? 0x09090b : 0x1e293b,
      metalness: 0.8,
      roughness: 0.4,
    });
    const grilleMesh = new THREE.Mesh(grilleGeo, grilleMat);
    grilleMesh.position.set(0, 1.45, cabLength / 2 + 0.05);
    cabGroup.add(grilleMesh);

    // Chrome Bumper Bar
    const bumperGeo = new THREE.BoxGeometry(cabWidth + 0.2, 0.5, 0.45);
    const bumperMesh = new THREE.Mesh(bumperGeo, chromeMat);
    bumperMesh.position.set(0, 0.7, cabLength / 2 + 0.12);
    cabGroup.add(bumperMesh);

    // Headlights (3D Mesh Clusters)
    const headlightMeshes: THREE.Mesh[] = [];
    [-cabWidth / 2 + 0.32, cabWidth / 2 - 0.32].forEach(hx => {
      const hlGeo = new THREE.BoxGeometry(0.38, 0.26, 0.15);
      const hlMesh = new THREE.Mesh(hlGeo, ledMatrixMat);
      hlMesh.position.set(hx, 0.95, cabLength / 2 + 0.22);
      cabGroup.add(hlMesh);
      headlightMeshes.push(hlMesh);
    });

    // In-Cab Cockpit Interior (For 1st Person Cockpit View!)
    const cockpitGroup = new THREE.Group();
    cockpitGroup.position.set(0, cabHeight / 2 + 0.8, 0);
    cabGroup.add(cockpitGroup);

    // Dashboard Console
    const dashGeo = new THREE.BoxGeometry(cabWidth - 0.25, 0.6, 0.9);
    const dashMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const dashMesh = new THREE.Mesh(dashGeo, dashMat);
    dashMesh.position.set(0, 0.2, 0.75);
    cockpitGroup.add(dashMesh);

    // Digital Driver Display (Infotainment Screen in 3D Cockpit)
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = 256;
    displayCanvas.height = 128;
    const displayCtx = displayCanvas.getContext('2d')!;
    const displayTex = new THREE.CanvasTexture(displayCanvas);
    const displayMat = new THREE.MeshBasicMaterial({ map: displayTex });
    const displayMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.28), displayMat);
    displayMesh.position.set(-0.55, 0.52, 0.68);
    displayMesh.rotation.x = -0.3;
    cockpitGroup.add(displayMesh);

    // 3D Working Steering Wheel (rotates in 3D when player steers!)
    const steeringWheelGroup = new THREE.Group();
    steeringWheelGroup.position.set(-0.55, 0.45, 0.4);
    steeringWheelGroup.rotation.x = 0.55;
    cockpitGroup.add(steeringWheelGroup);

    const rimGeo = new THREE.TorusGeometry(0.24, 0.025, 12, 24);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    steeringWheelGroup.add(rimMesh);

    const centerCapGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04);
    const centerCapMesh = new THREE.Mesh(centerCapGeo, chromeMat);
    centerCapMesh.rotation.x = Math.PI / 2;
    steeringWheelGroup.add(centerCapMesh);

    // Working Windshield Wipers
    const wiperLeftGroup = new THREE.Group();
    const wiperRightGroup = new THREE.Group();
    wiperLeftGroup.position.set(-0.5, cabHeight - 0.35, cabLength / 2 + 0.12);
    wiperRightGroup.position.set(0.3, cabHeight - 0.35, cabLength / 2 + 0.12);
    cabGroup.add(wiperLeftGroup);
    cabGroup.add(wiperRightGroup);

    const wiperArmGeo = new THREE.BoxGeometry(0.03, 0.75, 0.02);
    const wiperMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const wiperLeftMesh = new THREE.Mesh(wiperArmGeo, wiperMat);
    wiperLeftMesh.position.set(0, 0.35, 0);
    wiperLeftGroup.add(wiperLeftMesh);
    const wiperRightMesh = new THREE.Mesh(wiperArmGeo, wiperMat);
    wiperRightMesh.position.set(0, 0.35, 0);
    wiperRightGroup.add(wiperRightMesh);

    // --- WHEELS & MULTI-AXLES ---
    interface WheelObj {
      mesh: THREE.Group;
      isFront: boolean;
      radius: number;
    }
    const wheels: WheelObj[] = [];
    const wheelRadius = 0.52;
    const wheelWidth = 0.38;

    const create3DWheel = (x: number, y: number, z: number, isFront: boolean) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, y, z);

      // Tire Rubber
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 20);
      const tireMesh = new THREE.Mesh(tireGeo, tireRubberMat);
      tireMesh.rotation.z = Math.PI / 2;
      tireMesh.castShadow = true;
      wheelGroup.add(tireMesh);

      // Chrome Rim
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth + 0.02, 16);
      const rimMesh = new THREE.Mesh(rimGeo, chromeMat);
      rimMesh.rotation.z = Math.PI / 2;
      wheelGroup.add(rimMesh);

      // Hub Cap with Lug Nuts
      const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, wheelWidth + 0.06, 8);
      const hubMesh = new THREE.Mesh(hubGeo, chromeMat);
      hubMesh.rotation.z = Math.PI / 2;
      wheelGroup.add(hubMesh);

      truckRoot.add(wheelGroup);
      wheels.push({ mesh: wheelGroup, isFront, radius: wheelRadius });
    };

    // Front Steer Axle
    create3DWheel(-cabWidth / 2 + 0.08, wheelRadius, 1.1, true);
    create3DWheel(cabWidth / 2 - 0.08, wheelRadius, 1.1, true);

    // Rear Drive Axles
    create3DWheel(-cabWidth / 2 + 0.08, wheelRadius, -0.9, false);
    create3DWheel(cabWidth / 2 - 0.08, wheelRadius, -0.9, false);
    if (truck.axles >= 3) {
      create3DWheel(-cabWidth / 2 + 0.08, wheelRadius, -2.1, false);
      create3DWheel(cabWidth / 2 - 0.08, wheelRadius, -2.1, false);
    }

    // --- ARTICULATED SEMI TRAILER OR INTEGRATED CARGO BODY ---
    const trailerPivot = new THREE.Group();
    scene.add(trailerPivot);

    let trailerMeshGroup: THREE.Group | null = null;
    const brakeLights: THREE.Mesh[] = [];
    const hazardLights: THREE.Mesh[] = [];

    if (isArticulated) {
      // 5th Wheel Hitch Articulated Semi Trailer (Scania 770S, Volvo FH16, Titan 18w, Tanker)
      trailerMeshGroup = new THREE.Group();
      trailerPivot.add(trailerMeshGroup);

      const tLength = 9.5;
      const tWidth = 2.5;
      const tHeight = 2.8;

      if (truck.category === 'Liquid Bulk' || truck.model3DType === 'hybrid_tanker') {
        // Stainless Cylindrical Petroleum Tanker
        const tankGeo = new THREE.CylinderGeometry(tWidth * 0.48, tWidth * 0.48, tLength, 24);
        const tankMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          metalness: 0.9,
          roughness: 0.15,
        });
        const tankMesh = new THREE.Mesh(tankGeo, tankMat);
        tankMesh.rotation.x = Math.PI / 2;
        tankMesh.position.set(0, tHeight / 2 + 0.7, -tLength / 2 - 0.8);
        tankMesh.castShadow = true;
        trailerMeshGroup.add(tankMesh);
      } else {
        // 40ft Shipping Container / Freight Dry Van
        const contGeo = new THREE.BoxGeometry(tWidth, tHeight, tLength);
        const contMat = new THREE.MeshStandardMaterial({
          color: truckBodyColor,
          roughness: 0.5,
          metalness: 0.2,
        });
        const contMesh = new THREE.Mesh(contGeo, contMat);
        contMesh.position.set(0, tHeight / 2 + 0.85, -tLength / 2 - 0.8);
        contMesh.castShadow = true;
        trailerMeshGroup.add(contMesh);

        // Corrugated Ribs on Container
        for (let r = -tLength + 0.8; r < -0.8; r += 0.85) {
          const ribGeo = new THREE.BoxGeometry(tWidth + 0.08, tHeight * 0.95, 0.08);
          const ribMesh = new THREE.Mesh(ribGeo, contMat);
          ribMesh.position.set(0, tHeight / 2 + 0.85, r - 0.8);
          trailerMeshGroup.add(ribMesh);
        }
      }

      // Trailer Tandem Axles & Wheels
      [-1.1, 1.1].forEach(tx => {
        [-7.2, -8.5].forEach(tz => {
          const twGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
          const twMesh = new THREE.Mesh(twGeo, tireRubberMat);
          twMesh.rotation.z = Math.PI / 2;
          twMesh.position.set(tx, wheelRadius, tz);
          twMesh.castShadow = true;
          trailerMeshGroup!.add(twMesh);
        });
      });

      // Trailer Rear Brake Lights
      [-1.0, 1.0].forEach(bx => {
        const blGeo = new THREE.BoxGeometry(0.24, 0.22, 0.1);
        const blMesh = new THREE.Mesh(blGeo, brakeLightMat);
        blMesh.position.set(bx, 1.0, -tLength - 0.82);
        trailerMeshGroup!.add(blMesh);
        brakeLights.push(blMesh);

        // Turn Signal / Hazard
        const hzGeo = new THREE.BoxGeometry(0.18, 0.18, 0.1);
        const hzMesh = new THREE.Mesh(hzGeo, hazardLightMat);
        hzMesh.position.set(bx > 0 ? bx + 0.15 : bx - 0.15, 1.0, -tLength - 0.82);
        trailerMeshGroup!.add(hzMesh);
        hazardLights.push(hzMesh);
      });
    } else {
      // Integrated Wing Van or Dropside Body on Tractor Chassis
      const boxLength = 5.6;
      const boxWidth = 2.4;
      const boxHeight = 2.6;

      const cargoBoxGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxLength);
      const cargoBoxMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        metalness: 0.4,
        roughness: 0.3,
      });
      const cargoBoxMesh = new THREE.Mesh(cargoBoxGeo, cargoBoxMat);
      cargoBoxMesh.position.set(0, boxHeight / 2 + 0.8, -boxLength / 2 - 0.3);
      cargoBoxMesh.castShadow = true;
      truckRoot.add(cargoBoxMesh);

      // Rear Lights for Rigid Truck
      [-1.0, 1.0].forEach(bx => {
        const blGeo = new THREE.BoxGeometry(0.24, 0.22, 0.1);
        const blMesh = new THREE.Mesh(blGeo, brakeLightMat);
        blMesh.position.set(bx, 1.0, -boxLength - 0.32);
        truckRoot.add(blMesh);
        brakeLights.push(blMesh);

        const hzGeo = new THREE.BoxGeometry(0.18, 0.18, 0.1);
        const hzMesh = new THREE.Mesh(hzGeo, hazardLightMat);
        hzMesh.position.set(bx > 0 ? bx + 0.15 : bx - 0.15, 1.0, -boxLength - 0.32);
        truckRoot.add(hzMesh);
        hazardLights.push(hzMesh);
      });
    }

    // 7. 3D PHILIPPINE TRAFFIC (Jeepneys, Commuter Vans, Buses)
    interface SimTrafficVehicle {
      mesh: THREE.Group;
      speedMs: number;
      lane: number;
      laneX: number;
      zPos: number;
      type: 'jeepney' | 'van' | 'bus';
    }
    const trafficVehicles: SimTrafficVehicle[] = [];

    const createTrafficJeepney = (colorHex: number): THREE.Group => {
      const jGroup = new THREE.Group();
      // Elongated Pinoy Jeepney body
      const bodyGeo = new THREE.BoxGeometry(2.1, 1.6, 5.2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.7, roughness: 0.3 });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = 1.1;
      bodyMesh.castShadow = true;
      jGroup.add(bodyMesh);

      // Stainless Hood
      const hoodGeo = new THREE.BoxGeometry(1.9, 0.7, 1.8);
      const hoodMat = chromeMat;
      const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
      hoodMesh.position.set(0, 0.75, 2.2);
      jGroup.add(hoodMesh);

      // Colorful Decorated Roof with Luggage Rack
      const rackGeo = new THREE.BoxGeometry(1.8, 0.25, 4.2);
      const rackMesh = new THREE.Mesh(rackGeo, chromeMat);
      rackMesh.position.set(0, 2.0, 0);
      jGroup.add(rackMesh);

      // Jeepney Wheels
      [-1.0, 1.0].forEach(wx => {
        [-1.6, 1.6].forEach(wz => {
          const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 12), tireRubberMat);
          tw.rotation.z = Math.PI / 2;
          tw.position.set(wx, 0.38, wz);
          jGroup.add(tw);
        });
      });
      return jGroup;
    };

    const jeepneyColors = [0xd97706, 0xdc2626, 0x2563eb, 0x16a34a, 0x9333ea];
    const lanes = [-5.6, -1.8, 1.8, 5.6]; // 4 lanes

    for (let i = 0; i < 5; i++) {
      const laneIdx = Math.floor(Math.random() * lanes.length);
      const laneX = lanes[laneIdx];
      const zPos = 40 + i * 45;
      const jMesh = createTrafficJeepney(jeepneyColors[i % jeepneyColors.length]);
      jMesh.position.set(laneX, 0, zPos);
      scene.add(jMesh);

      trafficVehicles.push({
        mesh: jMesh,
        speedMs: 14 + Math.random() * 5, // ~50-70 km/h
        lane: laneIdx,
        laneX,
        zPos,
        type: 'jeepney',
      });
    }

    // 8. 3D Rain Particle System
    const rainCount = 2800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 80;
      rainPositions[i * 3 + 1] = Math.random() * 40;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = false;
    scene.add(rainParticles);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. MAIN 60FPS PHYSICS & SIMULATION LOOP
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const p = physicsRef.current;
      const c = controlsRef.current;

      // Handle Engine RPM & Audio
      if (c.isEngineOn) {
        // Accelerating or idling
        const targetRpm = c.throttlePressed ? 1800 : 750;
        p.engineRpmVal += (targetRpm - p.engineRpmVal) * dt * 4;
      } else {
        p.engineRpmVal += (0 - p.engineRpmVal) * dt * 5;
      }
      setRpm(Math.round(p.engineRpmVal));

      // Driving Acceleration & Air Brakes
      const maxHp = truck.baseHorsepower + (truck.engineLevel || 1) * 35;
      const payloadPenalty = 1 - Math.min(cargo.weightTons / 60, 0.45); // Heavy cargo slows acceleration
      const accelRate = (maxHp / 22) * payloadPenalty; // m/s^2 factor
      const maxSpeedKmh = route.speedLimitKmh * 1.35;
      const maxSpeedMs = (maxSpeedKmh * 1000) / 3600;

      if (c.isEngineOn && !c.parkingBrakeActive) {
        if (c.throttlePressed) {
          if (c.gear > 0) {
            p.truckSpeed += accelRate * dt;
          } else if (c.gear === -1) {
            p.truckSpeed -= accelRate * 0.4 * dt;
          }
        } else {
          // Coasting drag / Retarder brake
          const drag = c.jakeBrakeActive ? 4.5 : 1.2;
          if (p.truckSpeed > 0) p.truckSpeed = Math.max(0, p.truckSpeed - drag * dt);
          else if (p.truckSpeed < 0) p.truckSpeed = Math.min(0, p.truckSpeed + drag * dt);
        }

        // Air Brakes
        if (c.brakePressed) {
          const brakeForce = (7.5 + (truck.brakesLevel || 1) * 1.2);
          if (p.truckSpeed > 0) p.truckSpeed = Math.max(0, p.truckSpeed - brakeForce * dt);
          else if (p.truckSpeed < 0) p.truckSpeed = Math.min(0, p.truckSpeed + brakeForce * dt);

          // Bleed small pneumatic air pressure
          p.airPressureVal = Math.max(4.5, p.airPressureVal - 0.02 * dt);
          setAirPressureBar(Number(p.airPressureVal.toFixed(1)));
        }
      } else {
        // Engine off or Parking brake engaged
        p.truckSpeed = Math.max(0, p.truckSpeed - 8.0 * dt);
      }

      // Clamp speed
      p.truckSpeed = Math.max(-6, Math.min(maxSpeedMs, p.truckSpeed));
      const currentSpeedKmh = Math.round((p.truckSpeed * 3600) / 1000);
      setSpeedKmh(Math.abs(currentSpeedKmh));

      // Steering Input
      const steerSpeed = 2.4;
      if (c.steerLeftPressed) {
        p.steerAngle = Math.max(-0.45, p.steerAngle - steerSpeed * dt);
      } else if (c.steerRightPressed) {
        p.steerAngle = Math.min(0.45, p.steerAngle + steerSpeed * dt);
      } else {
        // Return to center
        p.steerAngle += (0 - p.steerAngle) * dt * 6;
      }

      // Turn Wheels and Rotate 3D Steering Wheel
      wheels.forEach(w => {
        if (w.isFront) {
          w.mesh.rotation.y = p.steerAngle;
        }
        // Roll wheels
        w.mesh.rotation.x += (p.truckSpeed / w.radius) * dt;
      });

      // 3D Cockpit Steering Wheel rotation
      steeringWheelGroup.rotation.z = -p.steerAngle * 3.5;

      // Update Truck Heading and Position
      if (Math.abs(p.truckSpeed) > 0.1) {
        const turnEffect = (p.steerAngle * p.truckSpeed) / 4.8;
        p.truckHeading += turnEffect * dt;
      }

      p.truckPos.x += Math.sin(p.truckHeading) * p.truckSpeed * dt;
      p.truckPos.z += Math.cos(p.truckHeading) * p.truckSpeed * dt;

      // Keep truck in highway bounds (-ROAD_WIDTH/2 to ROAD_WIDTH/2)
      if (p.truckPos.x < -ROAD_WIDTH / 2 + 1.6) {
        p.truckPos.x = -ROAD_WIDTH / 2 + 1.6;
        p.truckSpeed *= 0.85;
      } else if (p.truckPos.x > ROAD_WIDTH / 2 - 1.6) {
        p.truckPos.x = ROAD_WIDTH / 2 - 1.6;
        p.truckSpeed *= 0.85;
      }

      // Apply to 3D Truck Mesh
      truckRoot.position.copy(p.truckPos);
      truckRoot.rotation.y = p.truckHeading;

      // Body roll/suspension tilt on steering
      cabGroup.rotation.z = -p.steerAngle * (p.truckSpeed / 25) * 0.18;
      // Pitch forward on braking, squat on acceleration
      if (c.brakePressed) cabGroup.rotation.x = 0.025;
      else if (c.throttlePressed) cabGroup.rotation.x = -0.018;
      else cabGroup.rotation.x = 0;

      // Articulated Semi Trailer Kinematics
      if (isArticulated && trailerMeshGroup) {
        trailerPivot.position.copy(p.truckPos);
        // Trailer angle smoothly follows cab with physical drag lag
        const angleDiff = p.truckHeading - p.trailerAngle;
        p.trailerAngle += angleDiff * Math.min(1.0, Math.abs(p.truckSpeed) * dt * 0.6 + 0.05);
        trailerPivot.rotation.y = p.trailerAngle;
      }

      // Road Segment Endless Looping: Reposition segments as truck advances
      roadSegments.forEach(seg => {
        if (seg.group.position.z - p.truckPos.z < -SEGMENT_LENGTH) {
          seg.group.position.z += NUM_SEGMENTS * SEGMENT_LENGTH;
        } else if (seg.group.position.z - p.truckPos.z > (NUM_SEGMENTS - 1) * SEGMENT_LENGTH) {
          seg.group.position.z -= NUM_SEGMENTS * SEGMENT_LENGTH;
        }
      });

      // Move Billboard ahead in corridor cycles
      if (billboardGroup.position.z - p.truckPos.z < -60) {
        billboardGroup.position.z = p.truckPos.z + 180 + Math.random() * 80;
        // Cycle billboard ad
        if (!hasAdFree && activeAds.length > 0) {
          const nextAd = activeAds[Math.floor(Math.random() * activeAds.length)];
          renderBillboardTexture(nextAd, false);
          billboardTexture.needsUpdate = true;
          setCurrentBillboardAd(nextAd);
        }
      }

      // Traffic Vehicles Movement
      trafficVehicles.forEach(tv => {
        tv.zPos += tv.speedMs * dt;
        // If traffic falls behind, respawn ahead
        if (tv.zPos - p.truckPos.z < -50) {
          tv.zPos = p.truckPos.z + 120 + Math.random() * 90;
          tv.lane = Math.floor(Math.random() * lanes.length);
          tv.laneX = lanes[tv.lane];
        }
        tv.mesh.position.set(tv.laneX, 0, tv.zPos);
        tv.mesh.rotation.y = 0;

        // Collision detection with player truck
        const dx = tv.mesh.position.x - p.truckPos.x;
        const dz = tv.mesh.position.z - p.truckPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 4.5) {
          // Minor fender bump
          p.truckSpeed *= 0.6;
          setSafetyScore(prev => Math.max(50, prev - 4));
          notify('⚠️ Watch following distance! Safe driving keeps high safety rating.');
        }
      });

      // Rain Particles update
      if (timeOfDay === 'rain') {
        rainParticles.visible = true;
        const posAttr = rainGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          arr[i * 3 + 1] -= 32 * dt;
          if (arr[i * 3 + 1] < 0) {
            arr[i * 3 + 1] = 30 + Math.random() * 10;
            arr[i * 3] = p.truckPos.x + (Math.random() - 0.5) * 60;
            arr[i * 3 + 2] = p.truckPos.z + (Math.random() - 0.5) * 80;
          }
        }
        posAttr.needsUpdate = true;
      } else {
        rainParticles.visible = false;
      }

      // Windshield Wipers Animation
      if (c.wipersActive) {
        p.wiperPhase += dt * 5;
        const wiperAngle = Math.sin(p.wiperPhase) * 0.75;
        wiperLeftGroup.rotation.z = wiperAngle;
        wiperRightGroup.rotation.z = wiperAngle;
      } else {
        wiperLeftGroup.rotation.z = 0;
        wiperRightGroup.rotation.z = 0;
      }

      // Lights (Headlights & Hazard blinkers)
      if (c.headlights === 'high') {
        leftHeadlight.intensity = 2.4;
        rightHeadlight.intensity = 2.4;
      } else if (c.headlights === 'low') {
        leftHeadlight.intensity = 1.4;
        rightHeadlight.intensity = 1.4;
      } else {
        leftHeadlight.intensity = 0;
        rightHeadlight.intensity = 0;
      }

      // Position headlights on truck front
      const hlFrontZ = p.truckPos.z + Math.cos(p.truckHeading) * (cabLength / 2 + 0.2);
      const hlFrontX = p.truckPos.x + Math.sin(p.truckHeading) * (cabLength / 2 + 0.2);
      leftHeadlight.position.set(hlFrontX - 0.8, 1.2, hlFrontZ);
      rightHeadlight.position.set(hlFrontX + 0.8, 1.2, hlFrontZ);
      headlightTarget.position.set(
        hlFrontX + Math.sin(p.truckHeading) * 45,
        0.5,
        hlFrontZ + Math.cos(p.truckHeading) * 45
      );

      // Brake Lights emissive glow
      const bGlow = c.brakePressed ? 2.5 : 0;
      brakeLightMat.emissive.setHex(0xdc2626);
      brakeLightMat.emissiveIntensity = bGlow;

      // Hazard Flashing
      if (c.hazardActive) {
        p.hazardTimer += dt * 3.5;
        const hazardOn = Math.floor(p.hazardTimer) % 2 === 0;
        hazardLightMat.emissive.setHex(0xf59e0b);
        hazardLightMat.emissiveIntensity = hazardOn ? 2.2 : 0;
      } else {
        hazardLightMat.emissiveIntensity = 0;
      }

      // Update In-Cockpit 3D Gauge Texture
      displayCtx.fillStyle = '#0f172a';
      displayCtx.fillRect(0, 0, 256, 128);
      displayCtx.fillStyle = '#38bdf8';
      displayCtx.font = 'bold 22px monospace';
      displayCtx.fillText(`${Math.abs(currentSpeedKmh)} KM/H`, 15, 35);
      displayCtx.font = '14px sans-serif';
      displayCtx.fillStyle = '#94a3b8';
      displayCtx.fillText(`GEAR: ${c.gear === -1 ? 'R' : c.gear === 0 ? 'N' : `D${c.gear}`}`, 15, 65);
      displayCtx.fillText(`RPM: ${Math.round(p.engineRpmVal)}`, 15, 90);
      displayCtx.fillStyle = '#10b981';
      displayCtx.fillText(`${route.name.split(':')[0]}`, 15, 115);
      displayTex.needsUpdate = true;

      // CAMERA PLACEMENT MODES
      if (cameraMode === 'chase') {
        // Smooth 3rd person chase camera behind truck
        const chaseCamZ = p.truckPos.z - Math.cos(p.truckHeading) * 11;
        const chaseCamX = p.truckPos.x - Math.sin(p.truckHeading) * 11;
        const targetCamPos = new THREE.Vector3(chaseCamX, 4.2 + (p.truckSpeed / 30), chaseCamZ);
        camera.position.lerp(targetCamPos, dt * 6);

        const lookTarget = new THREE.Vector3(
          p.truckPos.x + Math.sin(p.truckHeading) * 12,
          1.8,
          p.truckPos.z + Math.cos(p.truckHeading) * 12
        );
        camera.lookAt(lookTarget);
      } else if (cameraMode === 'cockpit') {
        // 1st Person In-Cabin Driver Seat View looking through windshield
        const driverCabX = p.truckPos.x - Math.cos(p.truckHeading) * 0.65;
        const driverCabZ = p.truckPos.z + Math.sin(p.truckHeading) * 0.4;
        camera.position.set(driverCabX, cabHeight + 0.35, driverCabZ);

        const lookAhead = new THREE.Vector3(
          driverCabX + Math.sin(p.truckHeading + p.steerAngle * 0.25) * 25,
          cabHeight + 0.2,
          driverCabZ + Math.cos(p.truckHeading + p.steerAngle * 0.25) * 25
        );
        camera.lookAt(lookAhead);
      } else if (cameraMode === 'bumper') {
        // Front bumper speed-cam
        const frontX = p.truckPos.x + Math.sin(p.truckHeading) * (cabLength / 2 + 0.3);
        const frontZ = p.truckPos.z + Math.cos(p.truckHeading) * (cabLength / 2 + 0.3);
        camera.position.set(frontX, 0.9, frontZ);
        camera.lookAt(
          frontX + Math.sin(p.truckHeading) * 30,
          0.85,
          frontZ + Math.cos(p.truckHeading) * 30
        );
      } else if (cameraMode === 'drone') {
        // High altitude 3/4 perspective
        camera.position.set(p.truckPos.x + 12, 18, p.truckPos.z - 16);
        camera.lookAt(p.truckPos.x, 1.5, p.truckPos.z + 6);
      }

      // Mission Distance & Completion check
      p.distanceTraveledM += Math.abs(p.truckSpeed) * dt;
      const targetMeters = route.distanceKm * 1000;
      if (p.distanceTraveledM >= targetMeters && !p.missionFinished) {
        p.missionFinished = true;
        confetti({ particleCount: 160, spread: 85, origin: { y: 0.6 } });
        truckAudio.playSuccessChime();

        const completedLog: TripLog = {
          id: `trip-${Date.now()}`,
          timestamp: Date.now(),
          dateString: new Date().toLocaleDateString(),
          truckName: truck.name,
          routeName: route.name,
          cargoName: cargo.name,
          cargoWeightTons: cargo.weightTons,
          distanceKm: route.distanceKm,
          payoutPhp: cargo.valuePhp,
          fuelUsedLiters: Math.round(route.distanceKm * 0.32 * 10) / 10,
          safetyScore,
          status: 'Completed',
          notes: `Successfully delivered ${cargo.name} across ${route.region} with 3D driver precision.`,
        };
        onMissionComplete(completedLog);
        notify('🎉 Mission Completed! Freight safely delivered to distribution terminal.');
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);
    } catch (err: any) {
      console.warn('TruckSimulator3D WebGL initialization error:', err);
      setWebGLError(err?.message || 'Could not create WebGL context');
      if (onFallbackTo2D) {
        onFallbackTo2D();
      }
      return;
    }

    // Clean up Three.js on unmount
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      if (renderer) {
        try {
          renderer.dispose();
          if (container && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        } catch (e) {
          // Ignore disposal errors
        }
      }
    };
  }, [truck.id, truck.color, truck.hasTrailer, truck.yearModel]);

  // Handle Time of Day / Weather changes in Three.js
  const handleSetTimeOfDay = (tod: TimeOfDay) => {
    setTimeOfDay(tod);
    truckAudio.playWrenchClick();
  };

  if (webGLError) {
    return (
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-200">
        <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 max-w-lg space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">WebGL 3D Mode Not Available</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your browser or sandbox environment has disabled WebGL hardware acceleration.
              The simulator will run using the high-performance 2D Highway engine with all 2026 fleet physics, air brake telemetry, and cargo missions.
            </p>
          </div>
          {onFallbackTo2D && (
            <button
              onClick={onFallbackTo2D}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
            >
              Switch to 2D Highway Simulator
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 select-none">
      {/* Three.js WebGL Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top Left: 2026 Model Badge & Camera Mode Switcher */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {/* 2026 Brand & Model Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur border border-slate-700 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-amber-400">
                {truck.brand || '2026 HEAVY TRUCK'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold font-mono">
                3D SIMULATOR
              </span>
            </div>
            <span className="text-xs font-bold text-slate-100 block truncate max-w-[220px]">
              {truck.name}
            </span>
          </div>
        </div>

        {/* Camera Views Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur border border-slate-700 shadow">
          {(
            [
              { id: 'chase', label: '3D Chase', icon: <Camera className="w-3.5 h-3.5" /> },
              { id: 'cockpit', label: '1st Person In-Cab', icon: <Eye className="w-3.5 h-3.5" /> },
              { id: 'bumper', label: 'Bumper', icon: <Maximize2 className="w-3.5 h-3.5" /> },
              { id: 'drone', label: 'Drone', icon: <Compass className="w-3.5 h-3.5" /> },
            ] as const
          ).map(cam => (
            <button
              key={cam.id}
              onClick={() => {
                truckAudio.playWrenchClick();
                setCameraMode(cam.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                cameraMode === cam.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={`Switch camera to ${cam.label} (Press 'C')`}
            >
              {cam.icon}
              <span className="hidden sm:inline">{cam.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Right: Time of Day & Weather Switcher */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur border border-slate-700 shadow">
        <button
          onClick={() => handleSetTimeOfDay('day')}
          className={`p-1.5 rounded-lg text-xs transition ${
            timeOfDay === 'day' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Daytime Tropical Sunlight"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleSetTimeOfDay('sunset')}
          className={`p-1.5 rounded-lg text-xs transition ${
            timeOfDay === 'sunset' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Golden Hour Sunset"
        >
          <Sunset className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleSetTimeOfDay('night')}
          className={`p-1.5 rounded-lg text-xs transition ${
            timeOfDay === 'night' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Night Highway Driving (Headlights On)"
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleSetTimeOfDay('rain')}
          className={`p-1.5 rounded-lg text-xs transition ${
            timeOfDay === 'rain' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Philippine Monsoon Rain & Wipers"
        >
          <CloudRain className="w-4 h-4" />
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-slate-900/95 border border-amber-500 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Bottom Left: Highway Advertising & Billboard Status */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-auto">
        {hasAdFree ? (
          <button
            onClick={onOpenAdvertising}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/85 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold backdrop-blur shadow transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>★ VIP Pro Fleet (Ad-Free Murals Enabled)</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdvertising}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-amber-600 border border-amber-500/40 text-amber-300 hover:text-white text-[11px] font-bold backdrop-blur shadow transition active:scale-95 group"
            title="Sponsor Highway Billboard or Remove Ads for $10/month"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400 group-hover:text-white" />
            <span>
              {currentBillboardAd ? `📢 Roadside Ad: ${currentBillboardAd.brandName}` : 'Sponsor 3D Billboard ($10/mo)'}
            </span>
          </button>
        )}
      </div>

      {/* Bottom Right: Real-time Driving Telemetry Overlay */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur border border-slate-700 text-slate-200 font-mono text-xs shadow-md">
        <div className="text-right">
          <span className="text-[9px] text-slate-400 block uppercase font-sans">Speed</span>
          <span className="font-bold text-sm text-emerald-400">{Math.abs(speedKmh)} KM/H</span>
        </div>
        <div className="h-6 w-px bg-slate-700 mx-1" />
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-sans">Gear</span>
          <span className="font-bold text-amber-400">
            {gear === -1 ? 'REV' : gear === 0 ? 'NEUT' : `D-${gear}`}
          </span>
        </div>
        <div className="h-6 w-px bg-slate-700 mx-1" />
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-sans">Safety</span>
          <span className="font-bold text-blue-400">{safetyScore}%</span>
        </div>
      </div>
    </div>
  );
};

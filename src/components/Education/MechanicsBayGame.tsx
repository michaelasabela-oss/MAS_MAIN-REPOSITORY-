import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Wrench, 
  CheckCircle2, 
  Droplets, 
  Wind, 
  Sparkles, 
  Flame, 
  RotateCcw, 
  Award,
  CircleDot
} from 'lucide-react';
import { truckAudio } from '../../services/audioService';
import { UserProfile } from '../../types/truck';

interface MechanicsBayGameProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onCompleteLesson: (rewardPhp: number, rewardXp: number) => void;
}

interface MaintenanceTask {
  id: string;
  title: string;
  category: 'Oil' | 'Air Brakes' | 'Cooling' | 'Tires' | 'Filtration' | 'Electrical';
  icon: React.ReactNode;
  instruction: string;
  educationalExplanation: string;
  completed: boolean;
}

export const MechanicsBayGame: React.FC<MechanicsBayGameProps> = ({
  profile,
  onCompleteLesson,
}) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    {
      id: 'dipstick',
      title: 'Engine Oil Dipstick Inspection',
      category: 'Oil',
      icon: <Droplets className="w-5 h-5 text-amber-500" />,
      instruction: 'Pull the dipstick, wipe clean with shop rag, reinsert, and verify level between MIN and MAX notches.',
      educationalExplanation: 'Heavy turbo-diesel engines need 15W-40 multi-grade oil to lubricate pistons and cool the turbocharger spinning at over 100,000 RPM!',
      completed: false,
    },
    {
      id: 'air_tank',
      title: 'Air Brake Reservoir Condensation Drain',
      category: 'Air Brakes',
      icon: <Wind className="w-5 h-5 text-cyan-400" />,
      instruction: 'Pull the brass release ring under the air tank to vent accumulated water and moisture.',
      educationalExplanation: 'Pneumatic compressors compress tropical humid air. If water builds up in the brake tanks, it corrodes valves and can freeze or cause brake failure!',
      completed: false,
    },
    {
      id: 'air_filter',
      title: 'Heavy Intake Air Filter Element',
      category: 'Filtration',
      icon: <CircleDot className="w-5 h-5 text-blue-400" />,
      instruction: 'Unlatch the 4 heavy clips on the air cleaner canister and remove dust from the pleated filter.',
      educationalExplanation: 'A commercial truck engine consumes over 10,000 liters of air every minute! A clogged air filter starves the engine of oxygen, causing black smoke and loss of pulling power.',
      completed: false,
    },
    {
      id: 'coolant',
      title: 'Radiator Expansion Tank Level',
      category: 'Cooling',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      instruction: 'Check the translucent coolant tank; ensure green ethylene glycol is at the FULL cold mark.',
      educationalExplanation: 'When climbing Baguio\'s Kennon Road in 1st gear, the engine produces intense heat. Coolant prevents the engine block from cracking or boiling over.',
      completed: false,
    },
    {
      id: 'tires',
      title: 'Tire Pressure & Lugnut Thumper Check',
      category: 'Tires',
      icon: <Wrench className="w-5 h-5 text-emerald-400" />,
      instruction: 'Tap all 10 heavy dual-wheel tires with the steel tire thumper and verify 110 PSI cold pressure.',
      educationalExplanation: 'Under-inflated heavy truck tires flex excessively on hot Philippine asphalt, causing dangerous highway blowouts. Proper PSI saves fuel and prevents tire fires!',
      completed: false,
    },
    {
      id: 'battery',
      title: '24-Volt Dual Commercial Battery Terminals',
      category: 'Electrical',
      icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
      instruction: 'Inspect lead-acid terminals for white copper-sulfate corrosion and apply dielectric protective grease.',
      educationalExplanation: 'Unlike regular passenger cars that use 12V, heavy trucks use two 12V batteries wired in series (24V) to give enough cranking amps to turn over huge 12-liter diesel engines.',
      completed: false,
    },
  ]);

  const [activeTaskId, setActiveTaskId] = useState<string>('dipstick');
  const [interactiveState, setInteractiveState] = useState<{
    dipstickPulled?: boolean;
    oilLevelChecked?: boolean;
    airTankDrained?: boolean;
    filterUnlatched?: boolean;
    coolantAdded?: boolean;
    tiresThumped?: number; // count 0 to 4
    batteryCleaned?: boolean;
  }>({ tiresThumped: 0 });

  const activeTask = tasks.find(t => t.id === activeTaskId) || tasks[0];
  const allCompleted = tasks.every(t => t.completed);

  const handleCompleteCurrentTask = () => {
    truckAudio.playSuccessChime();
    setTasks(prev => prev.map(t => (t.id === activeTaskId ? { ...t, completed: true } : t)));

    // If all tasks are completed
    const remaining = tasks.filter(t => t.id !== activeTaskId && !t.completed);
    if (remaining.length === 0) {
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      onCompleteLesson(40000, 500);
    } else {
      setActiveTaskId(remaining[0].id);
    }
  };

  const handleReset = () => {
    setTasks(prev => prev.map(t => ({ ...t, completed: false })));
    setInteractiveState({ tiresThumped: 0 });
    setActiveTaskId('dipstick');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-md`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Junior Truck Mechanic Bay</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  Interactive Vehicle Anatomy
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Learn how heavy vehicle diesel engines, air brake compressors, and cooling systems work!
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bay</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Checklist of Maintenance Tasks */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Pre-Trip BLOWBAGETS Inspection Tasks
          </h3>
          <div className="space-y-2">
            {tasks.map(task => {
              const isSelected = activeTaskId === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => {
                    truckAudio.playWrenchClick();
                    setActiveTaskId(task.id);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-md'
                      : profile.darkMode
                      ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {task.icon}
                    <div>
                      <div className="text-xs font-bold">{task.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{task.category}</div>
                    </div>
                  </div>
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center / Right: Interactive Workstation Bay */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        } space-y-6 flex flex-col justify-between`}>
          <div>
            {/* Task Title & Instruction */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold uppercase">
                {activeTask.category}
              </span>
              <h3 className="text-base font-bold">{activeTask.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeTask.instruction}
            </p>

            {/* Interactive Component Stage */}
            <div className="my-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 min-h-[220px] flex flex-col items-center justify-center text-center">
              {activeTask.id === 'dipstick' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-4 h-36 bg-slate-700 rounded-full relative overflow-hidden flex flex-col justify-end p-0.5">
                      <div className="w-full bg-amber-600 rounded-full h-24" />
                      {/* Level markers */}
                      <span className="absolute top-8 right-1 text-[8px] font-mono text-white">MAX</span>
                      <span className="absolute bottom-6 right-1 text-[8px] font-mono text-white">MIN</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 block">Clean Amber Diesel Lubricant (15W-40)</span>
                    <span className="text-[11px] text-slate-400">Level is optimal between MIN & MAX hash marks.</span>
                  </div>
                </div>
              )}

              {activeTask.id === 'air_tank' && (
                <div className="space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-44 h-20 rounded-2xl bg-slate-800 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
                      120 PSI AIR TANK
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      truckAudio.playAirBrakeHiss();
                      setInteractiveState(prev => ({ ...prev, airTankDrained: true }));
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition active:scale-95"
                  >
                    Pull Brass Ring Drain Lanyard (Hiss!)
                  </button>
                  {interactiveState.airTankDrained && (
                    <span className="text-xs text-emerald-400 font-bold block animate-fade-in">
                      💨 Water vapor and moisture purged! Air valves protected.
                    </span>
                  )}
                </div>
              )}

              {activeTask.id === 'air_filter' && (
                <div className="space-y-4">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-blue-500 flex items-center justify-center p-3 bg-slate-900">
                    <div className="w-24 h-24 rounded-full bg-blue-950 flex items-center justify-center text-blue-300 font-bold text-[10px]">
                      HEAVY PLEATED ELEMENT
                    </div>
                  </div>
                  <span className="text-xs text-slate-300 block">
                    Filter clips unlocked! Debris cleared from primary chamber.
                  </span>
                </div>
              )}

              {activeTask.id === 'coolant' && (
                <div className="space-y-4">
                  <div className="w-24 h-32 rounded-xl bg-slate-900 border-2 border-emerald-500/40 flex flex-col justify-end p-2 overflow-hidden">
                    <div className="w-full bg-emerald-500/80 rounded-lg h-24 flex items-center justify-center text-slate-950 font-bold text-[10px]">
                      FULL
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold block">
                    Coolant mixture 50/50 ready for Baguio steep mountain climb!
                  </span>
                </div>
              )}

              {activeTask.id === 'tires' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    {[1, 2, 3, 4].map(idx => (
                      <button
                        key={idx}
                        onClick={() => {
                          truckAudio.playWrenchClick();
                          setInteractiveState(prev => ({
                            ...prev,
                            tiresThumped: Math.min(4, (prev.tiresThumped || 0) + 1),
                          }));
                        }}
                        className={`w-14 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition active:scale-95 ${
                          (interactiveState.tiresThumped || 0) >= idx
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}
                      >
                        <span className="text-[10px] font-bold">Tire #{idx}</span>
                        <span className="text-xs font-mono mt-1">110 PSI</span>
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 block">
                    Tap all 4 dual drive tires with tire thumper. ({(interactiveState.tiresThumped || 0)} / 4 checked)
                  </span>
                </div>
              )}

              {activeTask.id === 'battery' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-24 h-20 rounded-xl bg-slate-900 border-2 border-yellow-500/50 flex flex-col items-center justify-center p-2 text-yellow-300 text-xs font-mono font-bold">
                      <span>BATTERY 1</span>
                      <span className="text-[10px] text-slate-400">12V DC</span>
                    </div>
                    <span className="font-bold text-slate-500">+</span>
                    <div className="w-24 h-20 rounded-xl bg-slate-900 border-2 border-yellow-500/50 flex flex-col items-center justify-center p-2 text-yellow-300 text-xs font-mono font-bold">
                      <span>BATTERY 2</span>
                      <span className="text-[10px] text-slate-400">12V DC</span>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-400 font-bold block">
                    24-Volt series connection cleaned with brass brush & terminal grease!
                  </span>
                </div>
              )}
            </div>

            {/* Mechanics Explanation Box */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs space-y-1">
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Why This Matters (Master Mechanic Knowledge)</span>
              </div>
              <p className="leading-relaxed">
                {activeTask.educationalExplanation}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Tasks Completed: {tasks.filter(t => t.completed).length} / {tasks.length}
            </span>

            <button
              onClick={handleCompleteCurrentTask}
              disabled={activeTask.completed}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 ${
                activeTask.completed
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {activeTask.completed ? <CheckCircle2 className="w-4 h-4" /> : <Award className="w-4 h-4" />}
              <span>{activeTask.completed ? 'Task Inspected & Signed' : 'Confirm Inspection (+₱40,000)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

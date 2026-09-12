import React from 'react';
import confetti from 'canvas-confetti';
import { 
  BarChart3, 
  Award, 
  Calendar, 
  ShieldCheck, 
  Truck, 
  TrendingUp, 
  Package, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { UserProfile, DailyChallenge, TripLog } from '../../types/truck';
import { LEADERBOARD_SEEDS } from '../../data/philippineData';
import { truckAudio } from '../../services/audioService';

interface FleetDashboardProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  challenges: DailyChallenge[];
  setChallenges: React.Dispatch<React.SetStateAction<DailyChallenge[]>>;
  tripLogs: TripLog[];
  onStartDelivery: () => void;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  profile,
  setProfile,
  challenges,
  setChallenges,
  tripLogs,
  onStartDelivery,
}) => {
  const totalTonsHauled = tripLogs.reduce((acc, log) => acc + log.cargoWeightTons, 0);
  const totalEarnings = tripLogs.reduce((acc, log) => acc + log.payoutPhp, 0);
  const avgSafety = tripLogs.length > 0 
    ? Math.round(tripLogs.reduce((acc, log) => acc + log.safetyScore, 0) / tripLogs.length) 
    : 98;

  const xpNeededForNextLevel = profile.level * 500;
  const xpProgress = Math.min(100, Math.round((profile.xp / xpNeededForNextLevel) * 100));

  const handleClaimChallenge = (challenge: DailyChallenge) => {
    truckAudio.playSuccessChime();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setProfile(prev => ({
      ...prev,
      cashPhp: prev.cashPhp + challenge.rewardPhp,
      xp: prev.xp + challenge.rewardXp,
    }));
    setChallenges(prev => prev.map(c => (c.id === challenge.id ? { ...c, completed: true } : c)));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Fleet Executive Summary Banner */}
      <div className={`p-6 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-md flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">{profile.companyName}</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
              Active DOT Registered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fleet Commander: <span className="font-semibold text-slate-300">{profile.name}</span> • Driver Rank: <span className="font-semibold text-amber-400">{profile.licenseRank}</span>
          </p>
        </div>

        <button
          onClick={onStartDelivery}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Launch Highway Mission</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-1`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>TOTAL HAULED</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">{totalTonsHauled} T</div>
          <span className="text-[10px] text-slate-500">Across {tripLogs.length} delivery trips</span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-1`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>FLEET EARNINGS</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">₱{totalEarnings.toLocaleString()}</div>
          <span className="text-[10px] text-slate-500">Net freight payouts</span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-1`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>SAFETY RATING</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">{avgSafety}%</div>
          <span className="text-[10px] text-slate-500">Zero cargo loss record</span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-1`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>LOGIN STREAK</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">{profile.streakDays} Days</div>
          <span className="text-[10px] text-slate-500">Daily trucker loyalty bonus</span>
        </div>
      </div>

      {/* Driver License Progression Bar */}
      <div className={`p-5 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      } space-y-2`}>
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">Driver License Level {profile.level}</span>
            <span className="text-slate-400">({profile.licenseRank})</span>
          </div>
          <span className="font-mono text-slate-400">{profile.xp} / {xpNeededForNextLevel} XP</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div className="h-full bg-gradient-to-r from-blue-600 to-amber-500 rounded-full transition-all duration-300" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      {/* Two Columns: Daily Quests & Global Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <div className={`p-5 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm">Daily Trucking Challenges</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
              Resets Daily at 00:00 PHT
            </span>
          </div>

          <div className="space-y-3">
            {challenges.map(ch => (
              <div
                key={ch.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">{ch.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{ch.description}</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">
                    Reward: ₱{ch.rewardPhp.toLocaleString()} • +{ch.rewardXp} XP
                  </div>
                </div>

                <button
                  onClick={() => handleClaimChallenge(ch)}
                  disabled={ch.completed}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition ${
                    ch.completed
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                  }`}
                >
                  {ch.completed ? 'Claimed' : 'Complete Quest'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Philippine Leaderboard */}
        <div className={`p-5 rounded-2xl border ${
          profile.darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">National Fleet Rankings</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              Live Global Board
            </span>
          </div>

          <div className="space-y-2">
            {LEADERBOARD_SEEDS.slice(0, 5).map(driver => (
              <div
                key={driver.rank}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black font-mono text-[11px] ${
                    driver.rank === 1 ? 'bg-amber-500 text-slate-950' : driver.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{driver.rank}
                  </span>
                  <div>
                    <div className="font-bold text-slate-200">{driver.playerName}</div>
                    <div className="text-[10px] text-slate-400">{driver.location} • {driver.truckModel}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-400">₱{driver.earningsPhp.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{driver.cargoTons} Tons • {driver.safetyRating}% Safe</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

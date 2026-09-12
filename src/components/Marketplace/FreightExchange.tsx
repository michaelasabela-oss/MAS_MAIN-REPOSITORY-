import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  DollarSign, 
  MapPin, 
  ShieldCheck, 
  Fuel, 
  Users, 
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';
import { CargoItem, PhilippineRoute, UserProfile } from '../../types/truck';
import { CARGO_CATALOG, PHILIPPINE_ROUTES } from '../../data/philippineData';
import { truckAudio } from '../../services/audioService';

interface FreightContract {
  id: string;
  sender: string;
  cargo: CargoItem;
  route: PhilippineRoute;
  payoutPhp: number;
  ratePerTon: number;
  urgency: 'Normal' | 'Express 4HR' | 'Critical Cold Chain';
  isMultiplayerPlayerBid?: boolean;
  accepted?: boolean;
}

interface FreightExchangeProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onAcceptContract: (cargo: CargoItem, route: PhilippineRoute) => void;
}

export const FreightExchange: React.FC<FreightExchangeProps> = ({
  profile,
  setProfile,
  onAcceptContract,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dieselPriceBatangas, setDieselPriceBatangas] = useState<number>(58.4); // PHP per liter
  const [dieselBoughtLiters, setDieselBoughtLiters] = useState<number>(100);

  const [contracts, setContracts] = useState<FreightContract[]>([
    {
      id: 'fc-101',
      sender: 'Luzon Grain & Rice Millers Co-op',
      cargo: CARGO_CATALOG[0],
      route: PHILIPPINE_ROUTES[0],
      payoutPhp: 38000,
      ratePerTon: 3800,
      urgency: 'Normal',
      isMultiplayerPlayerBid: false,
    },
    {
      id: 'fc-102',
      sender: 'Player: @KuyaJunBatangas',
      cargo: CARGO_CATALOG[1],
      route: PHILIPPINE_ROUTES[1],
      payoutPhp: 85000,
      ratePerTon: 6070,
      urgency: 'Critical Cold Chain',
      isMultiplayerPlayerBid: true,
    },
    {
      id: 'fc-103',
      sender: 'Clark Semiconductor Logistics Corp',
      cargo: CARGO_CATALOG[2],
      route: PHILIPPINE_ROUTES[2],
      payoutPhp: 145000,
      ratePerTon: 24160,
      urgency: 'Express 4HR',
      isMultiplayerPlayerBid: false,
    },
    {
      id: 'fc-104',
      sender: 'Player: @BaguioHighlandKing',
      cargo: CARGO_CATALOG[3],
      route: PHILIPPINE_ROUTES[3],
      payoutPhp: 110000,
      ratePerTon: 5000,
      urgency: 'Normal',
      isMultiplayerPlayerBid: true,
    },
    {
      id: 'fc-105',
      sender: 'Skyway Infra Heavy Concessionaires',
      cargo: CARGO_CATALOG[4],
      route: PHILIPPINE_ROUTES[0],
      payoutPhp: 98000,
      ratePerTon: 3500,
      urgency: 'Normal',
      isMultiplayerPlayerBid: false,
    },
  ]);

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.route.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || c.cargo.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleTakeContract = (contract: FreightContract) => {
    truckAudio.playSuccessChime();
    confetti({ particleCount: 110, spread: 70, origin: { y: 0.6 } });
    setContracts(prev => prev.map(c => (c.id === contract.id ? { ...c, accepted: true } : c)));
    onAcceptContract(contract.cargo, contract.route);
  };

  const handleBuyDieselBulk = () => {
    const cost = Math.round(dieselPriceBatangas * dieselBoughtLiters);
    if (profile.cashPhp < cost) {
      truckAudio.playAirBrakeHiss();
      return;
    }
    truckAudio.playWrenchClick();
    setProfile(prev => ({ ...prev, cashPhp: prev.cashPhp - cost }));
    alert(`Successfully purchased ${dieselBoughtLiters} Liters of Euro-4 Diesel at wholesale Batangas refinery rate (-₱${cost.toLocaleString()})!`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-md flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Philippine Freight Board & Commodity Market</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Multiplayer Bidding & Spot Trade
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bid on high-paying freight shipments, co-op with peer truckers, and trade fuel reserves!
            </p>
          </div>
        </div>

        {/* Wholesale Fuel Market Widget */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <Fuel className="w-5 h-5 text-amber-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Batangas Wholesale Fuel</span>
            <span className="font-mono font-bold text-amber-400">₱{dieselPriceBatangas} / Liter</span>
          </div>
          <button
            onClick={handleBuyDieselBulk}
            className="ml-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shadow transition"
          >
            Buy 100L
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contracts, senders, destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 font-medium"
          >
            <option value="all">All Cargo Types</option>
            <option value="dry_goods">Dry Goods (Rice/Grain)</option>
            <option value="cold_chain">Cold Chain (Fish/Reefer)</option>
            <option value="fragile_tech">Fragile Tech (Silicon)</option>
            <option value="hazardous_fuel">Hazardous Liquids (Fuel)</option>
            <option value="heavy_construction">Heavy Construction (Steel)</option>
          </select>
        </div>
      </div>

      {/* Contracts Table / Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContracts.map(contract => (
          <div
            key={contract.id}
            className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
              contract.accepted
                ? 'bg-emerald-950/20 border-emerald-500/50'
                : profile.darkMode
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300'
            } shadow-md`}
          >
            <div className="space-y-3">
              {/* Top Row: Sender & Urgency */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    contract.isMultiplayerPlayerBid
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {contract.isMultiplayerPlayerBid ? 'Peer Driver Contract' : 'Corporate Freight'}
                  </span>
                  <span className="font-semibold text-slate-300">{contract.sender}</span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  contract.urgency === 'Critical Cold Chain'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : contract.urgency === 'Express 4HR'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {contract.urgency}
                </span>
              </div>

              {/* Cargo & Destination */}
              <div>
                <h3 className="font-bold text-sm text-slate-100">{contract.cargo.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="line-clamp-1">{contract.route.name}</span>
                </div>
              </div>

              {/* Cargo Specs */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">WEIGHT</span>
                  <span className="font-mono font-bold text-slate-200">{contract.cargo.weightTons} Tons</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">DISTANCE</span>
                  <span className="font-mono font-bold text-slate-200">{contract.route.distanceKm} KM</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">RATE / TON</span>
                  <span className="font-mono font-bold text-amber-400">₱{contract.ratePerTon.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Payout & Accept Contract Button */}
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Payout</span>
                <span className="font-mono font-black text-lg text-emerald-400">
                  ₱{contract.payoutPhp.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleTakeContract(contract)}
                disabled={contract.accepted}
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition active:scale-95 flex items-center gap-1.5 ${
                  contract.accepted
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {contract.accepted ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                <span>{contract.accepted ? 'Accepted to Route' : 'Accept Freight Bidding'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import { TripLog, UserProfile } from '../../types/truck';
import { storageService } from '../../services/storageService';

interface PastTripLogsProps {
  tripLogs: TripLog[];
  profile: UserProfile;
}

export const PastTripLogs: React.FC<PastTripLogsProps> = ({ tripLogs, profile }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<TripLog | null>(null);

  const filteredLogs = tripLogs.filter(log => {
    const matchesSearch = log.truckName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.cargoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const csvContent = storageService.exportLogsToCSV(tripLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `byaheng_pinoy_trip_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintManifest = (log: TripLog) => {
    setSelectedLog(log);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-md flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Delivery Manifests & Trip Logs</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                DOT Audit & CSV Records
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive historical records of all cargo hauled, fuel consumed, and safety compliance ratings.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition active:scale-95 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Logs to CSV</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search past logs by route, cargo, truck..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 font-medium"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="Completed">Completed (100% Safe)</option>
            <option value="Delayed">Delayed</option>
            <option value="Damaged">Damaged / Incidents</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Card List */}
      <div className="space-y-3">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              profile.darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
            } shadow-sm`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-slate-400">{log.id}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {log.dateString}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  log.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {log.status}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-100">{log.cargoName}</h4>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> {log.routeName}
                </span>
                <span>Truck: <strong className="text-slate-300">{log.truckName}</strong></span>
              </div>
            </div>

            {/* Metrics & Action Buttons */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end text-xs">
              <div className="text-right font-mono">
                <div className="font-black text-emerald-400 text-sm">₱{log.payoutPhp.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400">
                  {log.distanceKm} km • {log.fuelUsedLiters}L • {log.safetyScore}% Safety
                </div>
              </div>

              <button
                onClick={() => handlePrintManifest(log)}
                className="p-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                title="Print Official Delivery Manifest (PDF)"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Delivery Manifest Modal View (also styled for window.print) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-300 space-y-4">
            {/* Header for Official Philippine Transport Manifest */}
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <h2 className="text-xl font-black uppercase tracking-wider">
                REPUBLIC OF THE PHILIPPINES
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Department of Transportation & Logistics Registry • Commercial Freight Manifest
              </p>
              <div className="mt-2 text-xs font-mono font-bold text-slate-800">
                MANIFEST NO: {selectedLog.id} • DATE: {selectedLog.dateString}
              </div>
            </div>

            {/* Carrier & Consignee */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 border rounded-lg bg-slate-50">
                <span className="font-bold text-slate-500 uppercase block text-[10px]">Carrier Fleet</span>
                <span className="font-bold text-sm block">{profile.companyName}</span>
                <span className="text-slate-600 block">Driver: {profile.name} ({profile.licenseRank})</span>
                <span className="text-slate-600 block">Vehicle: {selectedLog.truckName}</span>
              </div>
              <div className="p-3 border rounded-lg bg-slate-50">
                <span className="font-bold text-slate-500 uppercase block text-[10px]">Consignee Route</span>
                <span className="font-bold text-sm block">{selectedLog.routeName}</span>
                <span className="text-slate-600 block">Distance: {selectedLog.distanceKm} km</span>
                <span className="text-slate-600 block">Status: {selectedLog.status}</span>
              </div>
            </div>

            {/* Cargo Specifics */}
            <div className="p-3 border rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-bold">
                <span>Commodity: {selectedLog.cargoName}</span>
                <span className="font-mono">{selectedLog.cargoWeightTons} Metric Tons</span>
              </div>
              <p className="text-slate-600 text-[11px]">{selectedLog.notes}</p>
            </div>

            {/* Audit Figures */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs p-3 bg-slate-100 rounded-lg font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">FREIGHT EARNING</span>
                <span className="font-bold text-emerald-700">₱{selectedLog.payoutPhp.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">DIESEL FUEL AUDIT</span>
                <span className="font-bold text-slate-800">{selectedLog.fuelUsedLiters} Liters</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SAFETY AUDIT SCORE</span>
                <span className="font-bold text-blue-700">{selectedLog.safetyScore}% Compliance</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs"
              >
                Close Window
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Radio, Send, X, Bot, Sparkles, User } from 'lucide-react';
import { askLogisticsDispatcher } from '../services/geminiService';
import { UserProfile, TruckModel, CargoItem, PhilippineRoute } from '../types/truck';
import { truckAudio } from '../services/audioService';

interface DispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  currentTruck?: TruckModel;
  currentCargo?: CargoItem;
  currentRoute?: PhilippineRoute;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export const DispatcherModal: React.FC<DispatcherModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentTruck,
  currentCargo,
  currentRoute,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Mabuhay ${profile.name}! Chief Logistics Dispatcher Kuya Jun on the radio. Ready to advise on Philippine highways, cargo weight balance, or diesel mechanics. Ano ang tanong mo sa byahe?`,
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickQueries = [
    'How do air brakes work on heavy trucks?',
    'Why use the Jake brake on Kennon Road Baguio?',
    'What is the best way to stack 10 tons of rice sacks?',
    'What does the BLOWBAGETS pre-trip checklist mean?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    truckAudio.playWrenchClick();
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    if (!queryText) setInputText('');
    setIsLoading(true);

    try {
      const reply = await askLogisticsDispatcher(textToSend, {
        truck: currentTruck?.name,
        cargo: currentCargo?.name,
        route: currentRoute?.name,
      });
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      truckAudio.playSuccessChime();
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Radio static... Please repeat over! (Keep safe on the highway!)' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full max-w-xl rounded-2xl border ${
        profile.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      } shadow-2xl flex flex-col max-h-[85vh] overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-blue-600/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Kuya Jun: Chief Dispatcher & Master Mechanic</h3>
              <p className="text-[11px] text-slate-400">AI Logistics Advisor & Highway Dispatch Radio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : profile.darkMode
                  ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-8 italic">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Kuya Jun is checking the fleet dispatch radio...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickQueries.map((qq, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qq)}
              className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition font-medium border border-slate-700 shrink-0"
            >
              {qq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Kuya Jun about truck mechanics, weight balance, or routes..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

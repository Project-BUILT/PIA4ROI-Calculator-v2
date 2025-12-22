import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { CalculatorInputs, RiskMode, LeadData } from './types';
import { calculateROI, formatCurrency } from '..utils/calculations';
import { getEnv } from './utils/env';
import { Lock, Unlock, ArrowRight, FileText } from 'lucide-react';

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const [locked, setLocked] = useState(true);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<RiskMode>(RiskMode.CONSERVATIVE);
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  
  // Custom State for Slider to update context
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('roi_inputs');
    if (saved) {
      const parsed = JSON.parse(saved);
      setInputs(parsed);
      setSliderValue(parsed.liabilityCostPerHead);
    } else {
      navigate('/quick');
    }

    const savedEmail = localStorage.getItem('roi_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setLocked(false);
    }
  }, [navigate]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;
    
    setLocked(false);
    localStorage.setItem('roi_email', email);
    localStorage.setItem('roi_consent', 'true');

    // Stage 1 Webhook: Unlocked Results
    const lead: LeadData = {
      stage: 'unlocked_results',
      email,
      agencyType: inputs?.agencyType || 'Unknown',
      headcount: inputs?.headcount || 0,
      timestamp: new Date().toISOString(),
      consent
    };

    const webhookUrl = getEnv("VITE_LEAD_WEBHOOK_URL");
    if (webhookUrl) {
      try {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...lead, inputs })
        }).catch(() => {}); // Prevent unhandled promise rejections
      } catch (err) {
        console.warn('Webhook failed', err);
      }
    }
  };

  const handleSliderChange = (val: number) => {
    setSliderValue(val);
    if(inputs) {
      const newInputs = { ...inputs, liabilityCostPerHead: val };
      setInputs(newInputs);
      localStorage.setItem('roi_inputs', JSON.stringify(newInputs));
    }
  };

  if (!inputs) return <div className="p-20 text-center text-zinc-400">Loading model...</div>;

  const results = calculateROI(inputs, mode);

  return (
    <div className="pb-20">
      {/* Header / Mode Toggle */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Estimated Annual Avoidable Loss</h1>
            <div className="bg-black border border-zinc-800 p-1 rounded-sm inline-flex">
              {Object.values(RiskMode).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wide transition-all ${
                    mode === m ? 'bg-brand-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-5xl md:text-7xl font-bold text-white tracking-tight flex items-baseline">
            {locked ? (
              <span className="blur-lg select-none text-zinc-600">$1,250,000</span>
            ) : (
              <span className="animate-in fade-in duration-1000 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                {formatCurrency(results.totalAvoidableLoss)}
              </span>
            )}
            <span className="text-lg md:text-2xl text-zinc-600 font-normal ml-3">/ year</span>
          </div>
        </div>
      </div>

      {/* Email Gate Overlay */}
      {locked && (
        <div className="max-w-md mx-auto -mt-8 relative z-10 px-4">
          <div className="bg-zinc-900 rounded-sm shadow-2xl p-8 border border-zinc-700 text-center">
            <div className="w-12 h-12 bg-zinc-950 text-brand-500 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Unlock your full report</h3>
            <p className="text-zinc-500 text-sm mb-6">
              See the breakdown by category (Overtime, Liability, Turnover) and adjust the assumptions.
            </p>
            <form onSubmit={handleUnlock} className="space-y-4">
              <input 
                type="email" 
                required
                placeholder="work@agency.gov" 
                className="w-full h-11 rounded-sm bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-600 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <label className="flex items-start gap-3 text-left text-xs text-zinc-500">
                <input 
                  type="checkbox" 
                  required
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="mt-1 bg-zinc-950 border-zinc-700 rounded text-brand-600 focus:ring-brand-900"
                />
                I agree to receive the report and relevant research updates. No spam.
              </label>
              <Button type="submit" className="w-full">
                Unlock Results <Unlock className="w-4 h-4 ml-2"/>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Unlocked Content */}
      {!locked && (
        <div className="max-w-4xl mx-auto px-4 mt-8 space-y-12 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* 1. Buckets */}
          <div className="grid md:grid-cols-2 gap-6">
            <ResultCard 
              title="Turnover Drag" 
              value={results.turnoverDrag} 
              desc="Cost to recruit, onboard, and train replacements."
            />
            <ResultCard 
              title="Overtime Inefficiency" 
              value={results.overtimeDrag} 
              desc={`Potential ${mode === 'Conservative' ? '5%' : '10%'} reduction in OT via better health/staffing.`}
            />
            <ResultCard 
              title="Workers Comp" 
              value={results.workersCompDrag} 
              desc="Direct claims reduction estimate."
            />
            <div className="bg-zinc-900 p-6 rounded-sm shadow-sm border border-zinc-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-zinc-300 uppercase tracking-wide text-sm">Liability Drag</h4>
                <span className="font-mono font-bold text-xl text-white">{formatCurrency(results.liabilityDrag)}</span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Estimated settlements & payouts based on headcount.</p>
              
              {/* SLIDER */}
              <div className="pt-2">
                <label className="flex justify-between text-xs font-semibold text-zinc-500 mb-2">
                  <span>Conservative</span>
                  <span className="text-brand-400">Risk per head: {formatCurrency(sliderValue)}</span>
                  <span>Aggressive</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="15000" 
                  step="100"
                  value={sliderValue}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-brand-600 border border-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* 2. CTAs */}
          <div className="bg-zinc-900 rounded-sm p-8 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Need a formal presentation?</h3>
              <p className="text-zinc-400 max-w-sm text-sm">
                Get the Council-Ready PDF report with executive summary, detailed methodology, and bibliography.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              {/* Changed CTA to Free / Detail Form */}
              <Button onClick={() => navigate('/deep-dive')}>
                Generate Full Council Report <FileText className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/assumptions')}>
                View Methodology
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

const ResultCard = ({ title, value, desc }: { title: string, value: number, desc: string }) => (
  <div className="bg-zinc-900 p-6 rounded-sm shadow-sm border border-zinc-800">
    <h4 className="font-bold text-zinc-300 mb-1 uppercase tracking-wide text-sm">{title}</h4>
    <div className="font-mono font-bold text-2xl text-white mb-2">{formatCurrency(value)}</div>
    <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
  </div>
);
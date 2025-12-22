import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { CalculatorInputs, AgencyProfile, LeadData } from './types';
import { getEnv } from './env';
import { calculatePilotStats, formatCurrency } from './calculations';
import { DEFAULTS } from './constants';
import { FileText, ArrowRight, Settings2, Info } from 'lucide-react';

export const DeepDive: React.FC = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFinances, setShowAdvancedFinances] = useState(false);
  const [estimatedRooms, setEstimatedRooms] = useState(1);

  // Profile Form State
  const [profile, setProfile] = useState<AgencyProfile>({
    departmentName: '',
    city: '',
    state: '',
    contactName: '',
    contactTitle: '',
    contactPhone: '',
    decisionTimeline: '30-90 days',
    biggestPressure: 'Overtime'
  });

  useEffect(() => {
    const saved = localStorage.getItem('roi_inputs');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Calculate dynamic defaults if missing
      const dynamicStats = calculatePilotStats(parsed.headcount);
      setEstimatedRooms(dynamicStats.numRooms);

      // Ensure defaults for new fields if missing
      if (!parsed.turnoverRatePct && !parsed.annualTurnoverCount) {
        parsed.turnoverRatePct = DEFAULTS.TURNOVER_RATE;
      } else if (!parsed.turnoverRatePct && parsed.annualTurnoverCount) {
        parsed.turnoverRatePct = parseFloat(((parsed.annualTurnoverCount / parsed.headcount) * 100).toFixed(1));
      }
      
      // Use dynamic stats if no saved overrides exist
      // If user has saved values, use those. If not, fill with dynamic.
      // We check for undefined or 0 (unless they explicitly entered 0, but for these fields 0 is unlikely default)
      if (!parsed.pilotCapex) parsed.pilotCapex = dynamicStats.pilotCapex;
      if (!parsed.pilotOpexAnnual) parsed.pilotOpexAnnual = dynamicStats.pilotOpexAnnual;
      
      if (!parsed.recruitCost) parsed.recruitCost = DEFAULTS.REPLACEMENT_COST;

      // Guardrail logic init
      const hasRealData = (parsed.annualOvertimeSpend > 0) || (parsed.annualWorkersComp > 0);
      if (parsed.includePerformanceDrag === undefined) {
         parsed.includePerformanceDrag = !hasRealData;
      }

      setInputs(parsed);
    }
    
    // Attempt to pre-fill from localStorage if user came back
    const savedProfile = localStorage.getItem('roi_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleProfileChange = (field: keyof AgencyProfile, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    localStorage.setItem('roi_profile', JSON.stringify(updated));
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    if (!inputs) return;
    setInputs({ ...inputs, [field]: value });
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs) return;

    setLoading(true);

    const finalInputs: CalculatorInputs = {
      ...inputs,
      profile: profile
    };

    localStorage.setItem('roi_inputs', JSON.stringify(finalInputs));

    const email = localStorage.getItem('roi_email') || '';
    const consent = localStorage.getItem('roi_consent') === 'true';

    const lead: LeadData = {
      stage: 'full_report_submitted',
      email,
      consent,
      agencyType: finalInputs.agencyType,
      headcount: finalInputs.headcount,
      timestamp: new Date().toISOString(),
      profile: profile
    };

    const webhookUrl = getEnv("VITE_LEAD_WEBHOOK_URL");
    if (webhookUrl) {
      try {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...lead, inputs: finalInputs })
        }).catch(() => {});
      } catch (err) {
        console.warn('Webhook failed', err);
      }
    }

    setTimeout(() => {
      setLoading(false);
      navigate('/council-report');
    }, 800);
  };

  if (!inputs) return <div className="p-20 text-center text-zinc-400">Loading...</div>;

  const inputClass = "w-full h-11 rounded-sm bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all";
  const labelClass = "block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wide";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8 text-center">
        <div className="inline-flex justify-center items-center w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full mb-6 text-brand-500">
           <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Finalize Council Report</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
          Configure the Pilot Proposal and Department Profile to generate a decision-ready PDF.
        </p>
      </div>

      <div className="bg-zinc-900 p-8 md:p-10 rounded-sm border border-zinc-800 shadow-xl">
        <form onSubmit={handleGenerateReport} className="space-y-10">
          
          {/* Section 1: Financial Tuning */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-900 text-brand-400 text-xs flex items-center justify-center border border-brand-700">1</span>
                Operational Inputs
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAdvancedFinances(!showAdvancedFinances)}
                className="text-xs text-brand-400 hover:text-white flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" />
                {showAdvancedFinances ? "Hide Pilot Costs" : "Edit Pilot Costs"}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-zinc-950/50 p-6 rounded-sm border border-zinc-800">
               <div>
                <label className={labelClass}>Annual Turnover Rate (%)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    step="0.1"
                    className={inputClass}
                    value={inputs.turnoverRatePct || 10}
                    onChange={e => handleInputChange('turnoverRatePct', parseFloat(e.target.value))}
                  />
                  <div className="flex items-center text-xs text-zinc-500 whitespace-nowrap">
                    ~ {Math.round(inputs.headcount * ((inputs.turnoverRatePct || 10)/100))} people/yr
                  </div>
                </div>
              </div>

               <div>
                <label className={labelClass}>Cost to Replace 1 Person ($)</label>
                <input 
                  type="number"
                  className={inputClass}
                  value={inputs.recruitCost || 150000}
                  onChange={e => handleInputChange('recruitCost', parseFloat(e.target.value))}
                />
              </div>

              {/* Performance Guardrail Toggle */}
              <div className="md:col-span-2 border-t border-zinc-800 pt-4 mt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={inputs.includePerformanceDrag}
                    onChange={e => handleInputChange('includePerformanceDrag', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-900"
                  />
                  <div>
                    <span className="block text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">Include "Performance & Absenteeism" Drag?</span>
                    <span className="block text-xs text-zinc-500 mt-1 max-w-lg">
                      {inputs.includePerformanceDrag 
                        ? "Yes, estimating operational losses from fatigue-related errors and absenteeism." 
                        : "No, excluding this to be conservative or because real Overtime/Workers Comp data is provided."}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Pilot Costs */}
            {showAdvancedFinances && (
               <div className="grid md:grid-cols-2 gap-6 mt-6 bg-zinc-950/50 p-6 rounded-sm border border-zinc-800 animate-in slide-in-from-top-2">
                <div className="md:col-span-2 mb-2 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-brand-500 tracking-wider">Pilot Proposal Parameters</span>
                  <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    Est. Needs: {estimatedRooms} Room{estimatedRooms > 1 ? 's' : ''} for {inputs.headcount} staff
                  </span>
                </div>
                <div>
                  <label className={labelClass}>Pilot Hardware & Install (Capex)</label>
                  <input 
                    type="number"
                    className={inputClass}
                    value={inputs.pilotCapex}
                    onChange={e => handleInputChange('pilotCapex', parseFloat(e.target.value))}
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">Based on {formatCurrency(50000)} per room setup.</p>
                </div>
                <div>
                  <label className={labelClass}>Annual Support/Service (Opex)</label>
                  <input 
                    type="number"
                    className={inputClass}
                    value={inputs.pilotOpexAnnual}
                    onChange={e => handleInputChange('pilotOpexAnnual', parseFloat(e.target.value))}
                  />
                   <p className="text-[10px] text-zinc-600 mt-1">Based on {formatCurrency(1000)}/mo per room.</p>
                </div>
              </div>
            )}
          </div>

          
          {/* Section 2: Agency Details */}
          <div className="border-t border-zinc-800 pt-10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-900 text-brand-400 text-xs flex items-center justify-center border border-brand-700">2</span>
              Department Context
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Full Department Name</label>
                <input 
                  required
                  placeholder="e.g. Chandler Police Department"
                  className={inputClass}
                  value={profile.departmentName}
                  onChange={e => handleProfileChange('departmentName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Jurisdiction City</label>
                <input 
                  required
                  placeholder="e.g. Chandler"
                  className={inputClass}
                  value={profile.city}
                  onChange={e => handleProfileChange('city', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>State (2-Letter)</label>
                <input 
                  required
                  placeholder="e.g. AZ"
                  maxLength={2}
                  className={inputClass}
                  value={profile.state}
                  onChange={e => handleProfileChange('state', e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-900 text-brand-400 text-xs flex items-center justify-center border border-brand-700">3</span>
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Your Name</label>
                <input 
                  required
                  className={inputClass}
                  value={profile.contactName}
                  onChange={e => handleProfileChange('contactName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Title / Rank</label>
                <input 
                  required
                  placeholder="e.g. Chief of Police"
                  className={inputClass}
                  value={profile.contactTitle}
                  onChange={e => handleProfileChange('contactTitle', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-10">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-900 text-brand-400 text-xs flex items-center justify-center border border-brand-700">4</span>
              Strategic Context (Optional)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div>
                <label className={labelClass}>Primary Pressure Point</label>
                <select 
                  className={inputClass}
                  value={profile.biggestPressure}
                  onChange={e => handleProfileChange('biggestPressure', e.target.value as any)}
                >
                  <option value="Overtime">Overtime / Budget Bleed</option>
                  <option value="Turnover">Turnover / Recruiting</option>
                  <option value="Liability">Liability / Risk</option>
                  <option value="Sleep/Readiness">Sleep / Operational Readiness</option>
                  <option value="Cancer/Exposure">Cancer / Exposure</option>
                  <option value="Other">Other</option>
                </select>
              </div>
               <div>
                <label className={labelClass}>Decision Timeline</label>
                <select 
                  className={inputClass}
                  value={profile.decisionTimeline}
                  onChange={e => handleProfileChange('decisionTimeline', e.target.value as any)}
                >
                  <option value="0-30 days">Immediate (0-30 days)</option>
                  <option value="30-90 days">Upcoming Budget (30-90 days)</option>
                  <option value="90+ days">Long Term Planning</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button 
              size="xl" 
              className="w-full relative" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Generating Report...' : 'Generate Full Report'}
              {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            <p className="text-center text-xs text-zinc-600 mt-4">
              Your data is secure. We do not sell agency information.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
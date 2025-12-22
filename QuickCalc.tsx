import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AgencyType, LocationProfile, CalculatorInputs } from './types';
import { PRESETS, DEFAULTS } from './constants';
import { getDefaultLiability } from '../utils/calculations';
import { ChevronRight, ChevronDown, Info } from 'lucide-react';

type RuralSubtype = 'Police' | 'Fire' | 'EMS' | 'Mixed';

export const QuickCalc: React.FC = () => {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Rural Specific State
  const [ruralPop, setRuralPop] = useState(5000);
  const [ruralSubtype, setRuralSubtype] = useState<RuralSubtype>('Mixed');
  const [fireProvidesEMS, setFireProvidesEMS] = useState(true);
  
  // Breakdown for Mixed Mode
  const [breakdown, setBreakdown] = useState({ police: 0, fire: 0, ems: 0, combinedFireEms: 0 });

  // Initialize state
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const saved = localStorage.getItem('roi_inputs');
    return saved ? JSON.parse(saved) : {
      agencyType: AgencyType.POLICE,
      headcount: 100,
      locationProfile: LocationProfile.SUBURB,
      annualOvertimeSpend: 0,
      annualTurnoverCount: 5,
      avgFullyLoadedCost: DEFAULTS.AVG_FULLY_LOADED,
      annualWorkersComp: 0,
      liabilityCostPerHead: 650, 
      recruitCost: DEFAULTS.RECRUIT_COST,
      vacancyDays: DEFAULTS.VACANCY_DAYS,
      trainingCost: DEFAULTS.TRAINING_COST,
      disabilityRate: DEFAULTS.DISABILITY_RATE,
      avgSickHours: DEFAULTS.SICK_HOURS,
      // Rural defaults
      population: 5000,
      ruralSubtype: 'Mixed'
    };
  });

  // Sync Rural State from Inputs on Load (if existing)
  useEffect(() => {
    if (inputs.locationProfile === LocationProfile.RURAL) {
      if (inputs.population) setRuralPop(inputs.population);
      if (inputs.ruralSubtype) setRuralSubtype(inputs.ruralSubtype as RuralSubtype);
    }
  }, []);

  // Recalculate Rural Headcount when relevant params change
  useEffect(() => {
    if (inputs.locationProfile !== LocationProfile.RURAL) return;

    // Formulas
    const police = Math.round(ruralPop * 3.2 / 1000); // 3.2 per 1000
    const fire = Math.round(ruralPop * 3.23 / 1000); // NFPA median for 5k-10k
    // EMS: active volunteers/staff baseline 11, scale slightly
    const ems = Math.min(18, Math.max(8, Math.round(11 * (ruralPop / 5000))));
    
    // Mixed Logic
    // If fire provides EMS, we assume some overlap.
    // Formula: max(fire, ems) + 50% of the smaller group (cross-trained)
    const combinedFireEms = Math.max(fire, ems) + Math.round(Math.min(fire, ems) * 0.5);

    setBreakdown({ police, fire, ems, combinedFireEms });

    let newTotal = 0;
    if (ruralSubtype === 'Police') newTotal = police;
    else if (ruralSubtype === 'Fire') newTotal = fire;
    else if (ruralSubtype === 'EMS') newTotal = ems;
    else if (ruralSubtype === 'Mixed') {
      if (fireProvidesEMS) {
        newTotal = police + combinedFireEms;
      } else {
        newTotal = police + fire + ems;
      }
    }

    // Update main inputs
    setInputs(prev => ({
      ...prev,
      headcount: newTotal,
      population: ruralPop,
      ruralSubtype: ruralSubtype
    }));

  }, [ruralPop, ruralSubtype, fireProvidesEMS, inputs.locationProfile]);


  // Update default liability when profile/agency changes
  useEffect(() => {
    const newDefault = getDefaultLiability(inputs.locationProfile, inputs.agencyType);
    setInputs(prev => ({ ...prev, liabilityCostPerHead: newDefault }));
  }, [inputs.agencyType, inputs.locationProfile]);

  const saveAndNext = () => {
    localStorage.setItem('roi_inputs', JSON.stringify(inputs));
    navigate('/results');
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const data = preset.data;
    setInputs(prev => ({
      ...prev,
      ...data,
      liabilityCostPerHead: data.liabilityCostPerHead,
      ruralSubtype: data.ruralSubtype as CalculatorInputs['ruralSubtype']
    }));

    if (data.locationProfile === LocationProfile.RURAL) {
       setRuralPop(data.population || 5000);
       setRuralSubtype((data.ruralSubtype as RuralSubtype) || 'Mixed');
    }
  };

  // Manual headcount override handler
  const handleHeadcountChange = (val: number, type: 'total' | 'police' | 'fire' | 'ems' | 'combined') => {
    if (inputs.locationProfile !== LocationProfile.RURAL) {
      setInputs({...inputs, headcount: val});
      return;
    }

    // For Rural, we allow updating the breakdown, which updates the total
    // OR updating the total directly (which might break the sync with population)
    // To keep it simple: If they edit the numeric field, we update the total.
    // Ideally we update the specific breakdown bucket if visible.
    
    // Simplest path: Update the breakdown state to match what they typed, then sum.
    // But since the formulas drive the state, we'll just update the specific piece 
    // and let the total recalc in the next render cycle or manually set it.
    
    // Actually, simply updating `inputs.headcount` is sufficient for the model. 
    // The issue is that the `useEffect` above might overwrite it if `ruralPop` changes.
    // That is acceptable behavior: Slider moves -> Recalc. User types -> Override. Slider moves again -> Recalc.
    
    setInputs({...inputs, headcount: val});
  };

  const inputClass = "w-full h-12 rounded-sm bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors";
  const labelClass = "block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Let's build your estimate.</h2>
        <p className="text-zinc-500">Start with the basics. We'll refine the math in the next step.</p>
      </div>

      {/* Presets */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="text-left p-4 rounded-sm border border-zinc-800 bg-zinc-900 hover:border-brand-600 hover:bg-zinc-800 transition-all group"
          >
            <span className="block font-bold text-brand-500 group-hover:text-brand-400 mb-1">{p.name}</span>
            <span className="text-xs text-zinc-500">{p.description}</span>
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-sm border border-zinc-800 p-6 md:p-8 space-y-8 shadow-2xl">
        
        {/* Step 1: Core Inputs */}
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Agency Type</label>
              <select 
                className={inputClass}
                value={inputs.agencyType}
                onChange={(e) => setInputs({...inputs, agencyType: e.target.value as AgencyType})}
              >
                {Object.values(AgencyType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Location Profile</label>
              <select 
                className={inputClass}
                value={inputs.locationProfile}
                onChange={(e) => setInputs({...inputs, locationProfile: e.target.value as LocationProfile})}
              >
                {Object.values(LocationProfile).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* RURAL SPECIFIC CONTROLS */}
          {inputs.locationProfile === LocationProfile.RURAL && (
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-sm space-y-6 animate-in fade-in">
              <div>
                <div className="flex justify-between mb-2">
                  <label className={labelClass}>Population Protected: {ruralPop.toLocaleString()}</label>
                  <span className="text-xs text-brand-500 font-medium">Based on national data</span>
                </div>
                <input 
                  type="range"
                  min="2500"
                  max="10000"
                  step="500"
                  value={ruralPop}
                  onChange={(e) => setRuralPop(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs text-zinc-600 mt-1">
                  <span>2,500</span>
                  <span>10,000</span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Department Subtype</label>
                <div className="flex flex-wrap gap-2">
                  {['Police', 'Fire', 'EMS', 'Mixed'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRuralSubtype(type as RuralSubtype)}
                      className={`px-3 py-2 rounded-sm text-xs font-bold uppercase border transition-all ${
                        ruralSubtype === type 
                          ? 'bg-brand-600 border-brand-500 text-white' 
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-brand-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HEADCOUNT INPUTS */}
          {inputs.locationProfile === LocationProfile.RURAL && ruralSubtype === 'Mixed' ? (
            <div className="space-y-4 border-l-2 border-brand-900 pl-4">
              <div>
                <label className={labelClass}>Police Headcount (Sworn)</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    className={inputClass}
                    value={breakdown.police}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBreakdown(b => ({...b, police: val}));
                      // Manually trigger total update logic would go here if we wanted bidirectional sync perfect
                      // For now, allow the useEffect to overwrite on slider change, 
                      // but if they type here, we update total manually:
                      const others = fireProvidesEMS ? breakdown.combinedFireEms : (breakdown.fire + breakdown.ems);
                      setInputs({...inputs, headcount: val + others});
                    }}
                  />
                  <span className="text-xs text-zinc-500 whitespace-nowrap">Range: {Math.round(ruralPop*2.8/1000)}-{Math.round(ruralPop*4.2/1000)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  checked={fireProvidesEMS}
                  onChange={(e) => setFireProvidesEMS(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-900"
                />
                <span className="text-sm text-zinc-300">Fire department provides EMS?</span>
                <Info className="w-4 h-4 text-zinc-600" />
              </div>

              {fireProvidesEMS ? (
                <div>
                  <label className={labelClass}>Fire/EMS Responders (Combined)</label>
                  <input 
                    type="number" 
                    className={inputClass}
                    value={breakdown.combinedFireEms}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBreakdown(b => ({...b, combinedFireEms: val}));
                      setInputs({...inputs, headcount: breakdown.police + val});
                    }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Fire</label>
                    <input 
                      type="number" 
                      className={inputClass}
                      value={breakdown.fire}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBreakdown(b => ({...b, fire: val}));
                        setInputs({...inputs, headcount: breakdown.police + val + breakdown.ems});
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>EMS</label>
                    <input 
                      type="number" 
                      className={inputClass}
                      value={breakdown.ems}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBreakdown(b => ({...b, ems: val}));
                        setInputs({...inputs, headcount: breakdown.police + breakdown.fire + val});
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 text-right">
                <span className="text-sm font-bold text-brand-500">Total Headcount: {inputs.headcount}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className={labelClass}>
                {ruralSubtype === 'Mixed' ? 'Sworn/Uniformed Headcount' : `${ruralSubtype} Headcount`}
              </label>
              <input 
                type="number" 
                className={inputClass}
                value={inputs.headcount}
                onChange={(e) => setInputs({...inputs, headcount: Number(e.target.value)})}
              />
              {inputs.locationProfile === LocationProfile.RURAL && (
                <p className="text-xs text-zinc-500 mt-2">
                   {ruralSubtype === 'Police' && `Typical: ${Math.round(ruralPop*3.2/1000)} officers`}
                   {ruralSubtype === 'Fire' && `Typical: ${Math.round(ruralPop*3.23/1000)} volunteers/staff`}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Step 2: Advanced Accordion */}
        <div className="border-t border-zinc-800 pt-6">
          <button 
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-brand-500 font-semibold text-sm hover:text-brand-400 uppercase tracking-wide"
          >
            {showAdvanced ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
            {showAdvanced ? "Hide detailed inputs" : "Add details for more accuracy (Optional)"}
          </button>

          {showAdvanced && (
            <div className="mt-6 grid md:grid-cols-2 gap-6 animate-in fade-in">
              <div>
                <label className={labelClass}>
                  Annual Turnover (People)
                </label>
                <input 
                  type="number" 
                  className={inputClass.replace('h-12', 'h-10')}
                  value={inputs.annualTurnoverCount}
                  onChange={(e) => setInputs({...inputs, annualTurnoverCount: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className={labelClass}>Annual Overtime Spend ($)</label>
                <input 
                  type="number" 
                  className={inputClass.replace('h-12', 'h-10')}
                  placeholder="e.g. 500000"
                  value={inputs.annualOvertimeSpend || ''}
                  onChange={(e) => setInputs({...inputs, annualOvertimeSpend: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className={labelClass}>Workers Comp Spend ($)</label>
                <input 
                  type="number" 
                  className={inputClass.replace('h-12', 'h-10')}
                  value={inputs.annualWorkersComp || ''}
                  onChange={(e) => setInputs({...inputs, annualWorkersComp: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className={labelClass}>Avg Fully Loaded Cost ($)</label>
                <input 
                  type="number" 
                  className={inputClass.replace('h-12', 'h-10')}
                  value={inputs.avgFullyLoadedCost}
                  onChange={(e) => setInputs({...inputs, avgFullyLoadedCost: Number(e.target.value)})}
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button size="xl" className="w-full" onClick={saveAndNext}>
            Run Analysis
          </Button>
          <p className="text-center text-xs text-zinc-600 mt-4">
            Generates a board-ready estimate immediately.
          </p>
        </div>

      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { CalculatorInputs, RiskMode } from '../types';
import { calculateROI, formatCurrency } from '../utils/calculations';
import { generateCouncilReport } from '../utils/pdfGenerator';
import { getEnv } from '../utils/env';
import { Download, Mail, MapPin, Building2, User, FileCheck, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DEFAULTS, MULTIPLIERS } from './constants';

interface LocaleBrief {
  laborMarketNotes: string;
  localCostSignals: string;
}

export const CouncilReport: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const [mode, setMode] = useState<RiskMode>(RiskMode.CONSERVATIVE);
  const [localeBrief, setLocaleBrief] = useState<LocaleBrief | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('roi_inputs');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure defaults if fields missing from older saves
      if (!parsed.turnoverRatePct) parsed.turnoverRatePct = DEFAULTS.TURNOVER_RATE;
      if (!parsed.recruitCost) parsed.recruitCost = DEFAULTS.REPLACEMENT_COST;
      // Note: We don't force pilot defaults here anymore because calculateROI handles it dynamically if missing
      
      setInputs(parsed);

      // Async fetch locale data (Stub)
      const endpoint = getEnv("VITE_LOCALE_BRIEF_ENDPOINT");
      if (endpoint && parsed.profile?.city) {
         // Placeholder for future fetch
      }
    }
  }, []);

  if (!inputs) return <div className="p-20 text-center text-zinc-500">Generating report...</div>;

  const results = calculateROI(inputs, mode);
  const profile = inputs.profile;

  const handleDownload = () => {
    generateCouncilReport(inputs, results, mode);
  };

  const handleEmailClick = () => {
    const emailBody = `Finance Director,%0D%0A%0D%0AI ran a preliminary fiscal impact analysis for ${profile?.departmentName || inputs.agencyType} regarding our wellness and staffing liabilities.%0D%0A%0D%0ABased on current headcount (${inputs.headcount}), we are carrying an estimated avoidable loss of ${formatCurrency(results.totalAvoidableLoss)} annually.%0D%0A%0D%0AProposed Pilot Payback: ${results.paybackMonths} months.%0D%0A%0D%0ASee attached Report.%0D%0A%0D%0ARegards,%0D%0A${profile?.contactName || ''}`;
    const link = document.createElement('a');
    link.href = `mailto:?subject=Decision Brief: ${profile?.departmentName || 'Wellness Pilot'}&body=${emailBody}`;
    link.click();
  };

  return (
    <div className="min-h-screen py-12 px-4 print:p-0 print:bg-white print:text-black">
      <div className="max-w-5xl mx-auto bg-zinc-950 rounded-sm border border-zinc-800 shadow-2xl overflow-hidden print:shadow-none print:border-none print:bg-white">
        
        {/* DEMO BADGE */}
        {inputs.isMockData && (
          <div className="absolute top-12 right-12 md:top-24 md:right-16 -rotate-12 pointer-events-none opacity-40 print:opacity-20">
            <span className="text-8xl font-black text-red-500 border-8 border-red-500 p-4 rounded-lg uppercase tracking-widest">
              DEMO
            </span>
          </div>
        )}

        {/* SCREEN ONLY: Toolbar */}
        <div className="bg-zinc-900 p-4 flex justify-between items-center text-white border-b border-zinc-800 print:hidden sticky top-0 z-50">
          <div className="font-bold uppercase tracking-wide text-sm flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            Decision Brief
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <Button size="sm" variant="secondary" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download PDF Report
            </Button>
            <Button size="sm" variant="primary" onClick={handleEmailClick}>
              <Mail className="w-4 h-4 mr-2" /> Email Finance
            </Button>
          </div>
        </div>

        {/* REPORT CONTENT */}
        <div className="p-8 md:p-12 space-y-12 print:p-0 print:space-y-6">
          
          {/* 1. HEADER & META */}
          <div className="border-b border-zinc-800 print:border-zinc-300 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white print:text-black mb-2">
                  Pilot Proposal & Fiscal Impact Analysis
                </h1>
                <p className="text-zinc-400 print:text-zinc-600 text-lg">
                  Readiness, Retention, and Risk Reduction Strategy
                </p>
              </div>
              <div className="text-right hidden print:block">
                <div className="text-2xl font-bold text-black">CONFIDENTIAL</div>
                <div className="text-sm text-zinc-500">{new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Prepared For</span>
                <span className="block font-bold text-white print:text-black">{profile?.departmentName || "Agency Leadership"}</span>
                {profile?.city && <span className="block text-zinc-400 print:text-zinc-600">{profile.city}, {profile.state}</span>}
              </div>
              <div>
                <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Prepared By</span>
                <span className="block font-bold text-white print:text-black">Project BUILT / BUILT FR</span>
                <span className="block text-zinc-400 print:text-zinc-600">Decision Support Team</span>
              </div>
              <div>
                <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Requested By</span>
                 <span className="block font-bold text-white print:text-black">{profile?.contactName || "Agency Command"}</span>
                 <span className="block text-zinc-400 print:text-zinc-600">{profile?.contactTitle}</span>
              </div>
              <div>
                <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Primary Driver</span>
                <span className="block font-bold text-brand-400 print:text-black">{results.primaryDriver}</span>
              </div>
            </div>
          </div>

          {/* 2. DECISION ASK */}
          <section className="bg-brand-900/10 border border-brand-900/30 print:border-black print:bg-gray-50 rounded-sm p-6">
            <div className="flex items-start gap-4">
               <FileCheck className="w-8 h-8 text-brand-500 print:text-black shrink-0" />
               <div>
                 <h2 className="text-xl font-bold text-white print:text-black mb-2">Decision: Approve 90-Day Readiness Pilot</h2>
                 <p className="text-zinc-300 print:text-black mb-4">
                   Approve procurement of {results.numRooms} recharge unit{results.numRooms > 1 ? 's' : ''} and 3rd-party readiness support to mitigate identified operational losses.
                 </p>
                 <div className="grid md:grid-cols-2 gap-8 text-sm">
                    <div>
                      <span className="block font-bold text-white print:text-black mb-1">Included in Pilot Scope:</span>
                      <ul className="list-disc list-inside text-zinc-400 print:text-zinc-700 space-y-1">
                        <li>Hardware delivery, install, and calibration ({results.numRooms} Rooms)</li>
                        <li>Supervisor training & policy implementation</li>
                        <li>Utilization tracking & monthly impact reports</li>
                        <li>Anonymous usage support (BUILT FR)</li>
                      </ul>
                    </div>
                    <div>
                      <span className="block font-bold text-white print:text-black mb-1">Excluded (No Liability):</span>
                      <ul className="list-disc list-inside text-zinc-400 print:text-zinc-700 space-y-1">
                        <li>No clinical diagnosis or medical treatment</li>
                        <li>No guaranteed legal outcomes</li>
                        <li>No integration with HR/Disciplinary systems</li>
                      </ul>
                    </div>
                 </div>
                 <div className="mt-4 pt-4 border-t border-brand-900/30 print:border-zinc-300">
                   <p className="text-xs text-brand-300 print:text-black font-medium italic">
                     Procurement Note: Pilot can be executed as a {inputs.pilotDurationDays}-day service contract with defined scope and reporting.
                   </p>
                 </div>
               </div>
            </div>
          </section>

          {/* 3. EXECUTIVE FINANCIALS */}
          <section>
            <h2 className="text-xl font-bold text-white print:text-black mb-6 border-b border-zinc-800 pb-2">Financial Analysis</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
               <div className="bg-zinc-900 print:bg-white print:border print:border-zinc-300 p-6 rounded-sm border border-zinc-800">
                 <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Annual Avoidable Loss</div>
                 <div className="text-3xl font-bold text-white print:text-black">{formatCurrency(results.totalAvoidableLoss)}</div>
                 <div className="text-xs text-zinc-500 mt-2">Cost of status quo (turnover, OT, risk)</div>
               </div>
               <div className="bg-zinc-900 print:bg-white print:border print:border-zinc-300 p-6 rounded-sm border border-zinc-800">
                 <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Pilot Cost (Year 1)</div>
                 <div className="text-3xl font-bold text-white print:text-black">{formatCurrency(results.pilotCost)}</div>
                 <div className="text-xs text-zinc-500 mt-2">Based on {results.numRooms} Recharge Room{results.numRooms > 1 ? 's' : ''}</div>
               </div>
               <div className="bg-zinc-900 print:bg-white print:border print:border-zinc-300 p-6 rounded-sm border border-zinc-800">
                 <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Projected Payback</div>
                 <div className="text-3xl font-bold text-brand-400 print:text-black">{results.paybackMonths} Months</div>
                 <div className="text-xs text-zinc-500 mt-2">Break-even in ~{results.breakEvenDays} days</div>
               </div>
            </div>

            {/* SENSITIVITY TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="pb-3 font-medium uppercase text-xs">Sensitivity Scenario</th>
                    <th className="pb-3 font-medium uppercase text-xs">Annual Budget Drag</th>
                    <th className="pb-3 font-medium uppercase text-xs">Net Benefit (Yr 1)</th>
                    <th className="pb-3 font-medium uppercase text-xs">Payback Period</th>
                    <th className="pb-3 font-medium uppercase text-xs">ROI</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300 print:text-black">
                  {[results.sensitivity.conservative, results.sensitivity.standard, results.sensitivity.aggressive].map((row) => (
                    <tr key={row.mode} className={`border-b border-zinc-800/50 ${row.mode === mode ? 'bg-zinc-800/50 print:bg-gray-100 font-bold' : ''}`}>
                      <td className="py-4 px-2">
                        {row.mode} Model
                        {row.mode === mode && <span className="ml-2 text-[10px] bg-brand-900 text-brand-300 px-1.5 py-0.5 rounded uppercase">Selected</span>}
                      </td>
                      <td className="py-4 px-2">{formatCurrency(row.totalAnnualLoss)}</td>
                      <td className="py-4 px-2 text-brand-400 print:text-black">{formatCurrency(row.netBenefit)}</td>
                      <td className="py-4 px-2">{row.paybackMonths} Months</td>
                      <td className="py-4 px-2">{row.roiMultiplier.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-zinc-500 mt-3 italic">
                *Net Benefit = Avoidable Loss - Annual Pilot Support Costs. ROI includes initial hardware Capex.
              </p>
            </div>
          </section>

          {/* 4. IMPLEMENTATION PLAN */}
          <section className="print:break-inside-avoid">
             <h2 className="text-xl font-bold text-white print:text-black mb-6 border-b border-zinc-800 pb-2">Implementation & Success Plan</h2>
             <div className="grid md:grid-cols-3 gap-6">
               <div className="p-4 border border-zinc-800 print:border-zinc-300 rounded-sm">
                 <div className="font-bold text-brand-400 print:text-black mb-2 uppercase text-xs tracking-wider">Phase 1: Days 0-14</div>
                 <h4 className="font-bold text-white print:text-black text-sm mb-2">Install & Onboarding</h4>
                 <ul className="text-xs text-zinc-400 print:text-zinc-700 space-y-1.5 list-disc list-inside">
                   <li>Hardware delivery & calibration</li>
                   <li>Supervisor briefing (expectations)</li>
                   <li>Policy update (usage guidelines)</li>
                   <li>Identify "Unit Champions"</li>
                 </ul>
               </div>
               <div className="p-4 border border-zinc-800 print:border-zinc-300 rounded-sm">
                 <div className="font-bold text-brand-400 print:text-black mb-2 uppercase text-xs tracking-wider">Phase 2: Days 15-45</div>
                 <h4 className="font-bold text-white print:text-black text-sm mb-2">Utilization Ramp</h4>
                 <ul className="text-xs text-zinc-400 print:text-zinc-700 space-y-1.5 list-disc list-inside">
                   <li>Roll-call reminders</li>
                   <li>Usage metric tracking (sessions/wk)</li>
                   <li>Initial feedback loop</li>
                   <li>Refine access protocols</li>
                 </ul>
               </div>
               <div className="p-4 border border-zinc-800 print:border-zinc-300 rounded-sm">
                 <div className="font-bold text-brand-400 print:text-black mb-2 uppercase text-xs tracking-wider">Phase 3: Days 46-90</div>
                 <h4 className="font-bold text-white print:text-black text-sm mb-2">Optimization & Review</h4>
                 <ul className="text-xs text-zinc-400 print:text-zinc-700 space-y-1.5 list-disc list-inside">
                   <li>Interim impact report</li>
                   <li>Identify super-users</li>
                   <li>Expansion/Cancellation review</li>
                   <li>Council brief-out prep</li>
                 </ul>
               </div>
             </div>
          </section>

          {/* 5. RISK REGISTER */}
          <section className="print:break-inside-avoid">
            <h2 className="text-xl font-bold text-white print:text-black mb-6 border-b border-zinc-800 pb-2">Risk Register & Mitigation</h2>
            <table className="w-full text-sm text-left">
               <thead className="bg-zinc-900 print:bg-gray-100 text-zinc-500">
                 <tr>
                   <th className="p-3">Identified Risk</th>
                   <th className="p-3">Mitigation Strategy</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800 print:divide-zinc-300 text-zinc-300 print:text-black">
                 <tr>
                   <td className="p-3 font-medium">Perception as "Nap Room"</td>
                   <td className="p-3">Frame strictly as "Readiness Maintenance"; Supervisor endorsement; Usage limits.</td>
                 </tr>
                 <tr>
                   <td className="p-3 font-medium">Low Utilization</td>
                   <td className="p-3">Deploy Unit Champions; Simplify access; Confidentiality assurance.</td>
                 </tr>
                 <tr>
                   <td className="p-3 font-medium">Privacy / Stigma</td>
                   <td className="p-3">Third-party managed; No PHI collected; Clear separation from disciplinary files.</td>
                 </tr>
                 <tr>
                   <td className="p-3 font-medium">Overclaiming Outcomes</td>
                   <td className="p-3">Focus on "Track Indicators" (usage/readiness) vs "Lag Indicators" (cancer/suicide).</td>
                 </tr>
               </tbody>
            </table>
          </section>

          {/* 6. ASSUMPTIONS & MATH */}
          <section className="print:break-inside-avoid">
             <h2 className="text-xl font-bold text-white print:text-black mb-6 border-b border-zinc-800 pb-2">Appendix: Math & Inputs</h2>
             <div className="grid md:grid-cols-2 gap-8 text-xs text-zinc-500 print:text-zinc-700">
               <div>
                 <h4 className="font-bold text-white print:text-black mb-2">Calculated Inputs</h4>
                 <ul className="space-y-2 font-mono">
                   <li className="flex justify-between border-b border-zinc-800 pb-1">
                     <span>Total Headcount</span>
                     <span>{inputs.headcount}</span>
                   </li>
                   <li className="flex justify-between border-b border-zinc-800 pb-1">
                     <span>Avg. Fully Loaded Cost</span>
                     <span>{formatCurrency(inputs.avgFullyLoadedCost || DEFAULTS.AVG_FULLY_LOADED)}</span>
                   </li>
                   <li className="flex justify-between border-b border-zinc-800 pb-1">
                     <span>Turnover Rate</span>
                     <span>{inputs.turnoverRatePct || DEFAULTS.TURNOVER_RATE}% ({Math.round(inputs.headcount * ((inputs.turnoverRatePct || DEFAULTS.TURNOVER_RATE)/100))} staff)</span>
                   </li>
                    <li className="flex justify-between border-b border-zinc-800 pb-1">
                     <span>Replacement Cost</span>
                     <span>{formatCurrency(inputs.recruitCost || DEFAULTS.REPLACEMENT_COST)}</span>
                   </li>
                 </ul>
               </div>
               <div>
                 <h4 className="font-bold text-white print:text-black mb-2">Formulas Used</h4>
                 <ul className="space-y-2">
                   <li>
                     <strong className="text-zinc-300 print:text-black">Turnover Drag:</strong> Headcount × Rate% × Replacement Cost
                   </li>
                   <li>
                     <strong className="text-zinc-300 print:text-black">Overtime Drag:</strong> {inputs.annualOvertimeSpend > 0 ? "Actual OT Spend" : "Payroll × 12% (Est)"} × {MULTIPLIERS.OVERTIME_SAVINGS.STANDARD} (Factor)
                   </li>
                   <li>
                     <strong className="text-zinc-300 print:text-black">Liability Drag:</strong> Headcount × {formatCurrency(inputs.liabilityCostPerHead)}/head (Risk Model)
                   </li>
                   <li>
                     <strong className="text-zinc-300 print:text-black">Perf. Drag:</strong> {results.performanceDrag > 0 ? "Payroll × 2% (Productivity Loss)" : "Excluded (Real OT/WC data provided)"}
                   </li>
                 </ul>
               </div>
             </div>
          </section>
          
          {/* 7. LOCAL CONTEXT STUB */}
          <section className="bg-zinc-900 print:bg-gray-100 p-6 rounded-sm border border-zinc-800 print:break-inside-avoid">
             <div className="flex items-center gap-2 mb-3">
               <MapPin className="w-4 h-4 text-brand-500" />
               <h3 className="font-bold text-white print:text-black text-sm">Local Context (Beta)</h3>
             </div>
             {localeBrief ? (
               <p className="text-sm">{localeBrief.laborMarketNotes}</p>
             ) : (
               <p className="text-xs text-zinc-500 print:text-zinc-600">
                 Regional labor market analysis and municipal cost indexing for {profile?.city || 'this jurisdiction'} will auto-generate upon deployment. Current report uses national public safety baselines.
               </p>
             )}
          </section>

          {/* 8. DISCLAIMERS */}
          <div className="border-t-2 border-zinc-800 pt-6 text-[10px] text-zinc-500 print:text-zinc-600 text-justify leading-relaxed print:break-inside-avoid">
            <div className="flex gap-2 mb-2 font-bold text-zinc-400 uppercase tracking-wider">
              <AlertTriangle className="w-3 h-3" />
              <span>Claims We Do Not Make</span>
            </div>
            <p className="mb-2">
              This report estimates potential budget drag and recoverable value based on user-provided inputs and national industry baselines. Results will vary based on implementation fidelity, local labor conditions, and departmental policy.
            </p>
            <p>
              <strong>We do not guarantee</strong> reductions in lawsuits, workers’ comp claims, cancer risk, or specific medical outcomes. This analysis is for fiscal planning and decision support only and does not constitute medical, legal, or actuarial advice. All "Avoidable Loss" figures represent potential efficiency gains, not guaranteed cash savings.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EVIDENCE, MULTIPLIERS, DEFAULTS } from '../constants';
import { ExternalLink, Calculator, ShieldCheck, TrendingDown, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';

export const Assumptions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      
      {/* Navigation Controls */}
      <div className="mb-12 flex items-center justify-between border-b border-zinc-800 pb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="group text-zinc-300 border-zinc-700 hover:border-brand-500 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Return to Analysis
        </Button>
        <span className="text-xs font-mono text-zinc-600 uppercase hidden md:block">
          Live Methodology Viewer
        </span>
      </div>

      {/* Header Section */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-4">
           <div className="px-3 py-1 rounded-full bg-brand-900/30 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest">
             Transparency Report
           </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          We don't use "Black Box" math.
        </h1>
        <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
          The PIA4ROI model is designed to be <strong className="text-zinc-200">defensible in a council meeting</strong>. 
          We purposely use inputs that are <i>lower</i> than academic averages to ensure no one can accuse your department of inflating the numbers.
        </p>
      </div>

      {/* Philosophy Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-20">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm">
          <Scale className="w-8 h-8 text-brand-500 mb-4" />
          <h3 className="text-white font-bold mb-2">The "Conservative" Rule</h3>
          <p className="text-sm text-zinc-500">
            If a study says sleep deprivation causes 20% productivity loss, we model <strong>{MULTIPLIERS.PRODUCTIVITY_LOSS.CONSERVATIVE * 100}%</strong>. We treat every assumption as a "floor," not a "ceiling."
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm">
          <Calculator className="w-8 h-8 text-brand-500 mb-4" />
          <h3 className="text-white font-bold mb-2">Linear Equations Only</h3>
          <p className="text-sm text-zinc-500">
            No complex AI guessing. <br/>
            <code>Cost = (Count × Severity) × Risk_Factor</code>. <br/>
            If you change the input, you can trace the exact output penny-for-penny.
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm">
          <ShieldCheck className="w-8 h-8 text-brand-500 mb-4" />
          <h3 className="text-white font-bold mb-2">Municipal Data First</h3>
          <p className="text-sm text-zinc-500">
            We prioritize data from Bureau of Justice Statistics and NFPA over private sector "wellness" studies.
          </p>
        </div>
      </div>

      {/* Deep Dive: The 3 Core Drivers */}
      <div className="space-y-16">
        
        {/* Driver 1: Turnover */}
        <section className="relative border-l-2 border-zinc-800 pl-8 md:pl-12 py-2">
          <div className="absolute -left-3 top-0 w-6 h-6 bg-zinc-950 border-2 border-brand-600 rounded-full"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
               <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 1. Turnover & Separation
               </h2>
               <p className="text-zinc-500 text-sm mt-1">Cost to replace a sworn officer or firefighter.</p>
            </div>
            <div className="text-right hidden md:block">
              <span className="text-xs font-mono text-zinc-600 uppercase">Model Default</span>
              <div className="text-xl font-bold text-brand-400">${(DEFAULTS.REPLACEMENT_COST / 1000)}k / person</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 p-6 rounded-sm border border-zinc-800">
              <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-4 border-b border-zinc-800 pb-2">The Formula</h4>
              <code className="text-xs md:text-sm font-mono text-brand-300 block mb-4">
                (Separations_Count) × (Recruit_Cost + Training_Cost + Vacancy_OT + Separation_Admin)
              </code>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Most departments only count the academy cost. We calculate the <strong>Full Burden</strong>:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-500 list-disc list-inside">
                 <li>Recruitment ads & background checks</li>
                 <li>Academy tuition & gear</li>
                 <li>Field Training Officer (FTO) overlap time</li>
                 <li><strong>Vacancy Drag:</strong> OT paid to backfill the empty seat</li>
              </ul>
            </div>
            
            <div className="bg-zinc-950 p-6 rounded-sm border border-zinc-800">
               <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-4 border-b border-zinc-800 pb-2">Why it's Valid</h4>
               <div className="space-y-4">
                 <div className="flex gap-3">
                   <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                   <div>
                     <span className="block text-xs font-bold text-zinc-400 uppercase">Industry Benchmark</span>
                     <p className="text-sm text-zinc-200">SHRM & Police Chief Magazine cite turnover costs at <strong>150% - 200%</strong> of annual salary.</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                   <div>
                     <span className="block text-xs font-bold text-zinc-400 uppercase">Our Conservative Model</span>
                     <p className="text-sm text-zinc-200">We use a flat <strong>$150k</strong> (approx 125% of base), assuming you likely fill roles faster than national avg.</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>


        {/* Driver 2: Overtime */}
        <section className="relative border-l-2 border-zinc-800 pl-8 md:pl-12 py-2">
          <div className="absolute -left-3 top-0 w-6 h-6 bg-zinc-950 border-2 border-brand-600 rounded-full"></div>
          
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
               <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 2. The "Fatigue-Overtime" Loop
               </h2>
               <p className="text-zinc-500 text-sm mt-1">Recoverable budget lost to burnout-induced staffing gaps.</p>
            </div>
            <div className="text-right hidden md:block">
              <span className="text-xs font-mono text-zinc-600 uppercase">Model Claim</span>
              <div className="text-xl font-bold text-brand-400">{MULTIPLIERS.OVERTIME_SAVINGS.CONSERVATIVE * 100}% Recovery</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 p-6 rounded-sm border border-zinc-800">
              <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-4 border-b border-zinc-800 pb-2">The Logic</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                We do <span className="text-white font-bold underline decoration-brand-500">not</span> claim all OT is bad. Shift minimums must be met.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                However, a significant portion of OT is used to cover <strong>Sick Calls</strong> and <strong>Injury Leave</strong>. When officers are burnt out, they take more sick days, forcing others to work OT, who then get burnt out. This is the loop we quantify.
              </p>
            </div>
            
            <div className="bg-zinc-950 p-6 rounded-sm border border-zinc-800">
               <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-4 border-b border-zinc-800 pb-2">The Proof</h4>
               <div className="space-y-4">
                 <div className="flex gap-3">
                   <TrendingDown className="w-5 h-5 text-brand-600 shrink-0" />
                   <div>
                     <span className="block text-xs font-bold text-zinc-400 uppercase">Scientific Consensus</span>
                     <p className="text-sm text-zinc-200">
                       Research (Journal of Safety Research) shows sleep-deprived individuals are <strong>3x more likely</strong> to be involved in safety incidents/errors.
                     </p>
                   </div>
                 </div>
                 <div className="pl-8 border-l border-zinc-800">
                     <span className="block text-xs font-bold text-zinc-500 uppercase">Our Math</span>
                     <p className="text-sm text-zinc-400">
                       We only claim that <strong>5% to 15%</strong> of your total OT budget is recoverable via wellness interventions. This is a fraction of the actual waste caused by fatigue.
                     </p>
                 </div>
               </div>
            </div>
          </div>
        </section>

         {/* Driver 3: Liability */}
        <section className="relative border-l-2 border-zinc-800 pl-8 md:pl-12 py-2">
          <div className="absolute -left-3 top-0 w-6 h-6 bg-zinc-950 border-2 border-brand-600 rounded-full"></div>
          
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
               <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 3. Liability & Risk Exposure
               </h2>
               <p className="text-zinc-500 text-sm mt-1">Settlements, nuclear verdicts, and misconduct claims.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-6 rounded-sm border border-zinc-800">
             <div className="flex flex-col md:flex-row gap-6">
               <div className="md:w-1/2">
                  <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-4">The "Per Head" Calculation</h4>
                  <p className="text-sm text-zinc-400 mb-4">
                    Liability is "lumpy" (one bad year costs millions). We smooth this out by assigning a <strong>Risk Value per Badge</strong>.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                      <div className="text-xs text-zinc-500 uppercase">Major City</div>
                      <div className="text-lg font-bold text-white">$8,000<span className="text-xs text-zinc-600">/head</span></div>
                    </div>
                     <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                      <div className="text-xs text-zinc-500 uppercase">Rural/Suburb</div>
                      <div className="text-lg font-bold text-white">$650<span className="text-xs text-zinc-600">/head</span></div>
                    </div>
                  </div>
               </div>
               <div className="md:w-1/2 border-l border-zinc-800 pl-0 md:pl-6 pt-6 md:pt-0">
                  <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-4">Evidence of Correlation</h4>
                   <p className="text-sm text-zinc-400 italic mb-3">
                     "Fatigue mimics alcohol intoxication. A firefighter or officer awake for 24 hours has the cognitive impairment of 0.10 BAC."
                   </p>
                   <p className="text-sm text-zinc-500">
                     Our model assumes that reducing chronic fatigue directly correlates to a reduction in high-liability decision errors (vehicle accidents, excessive force, medical error).
                   </p>
               </div>
             </div>
          </div>
        </section>

      </div>

      {/* Citations Table */}
      <section className="mt-24 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-bold mb-8 text-white">Evidence Library</h2>
        <div className="grid gap-3">
          {EVIDENCE.map((item) => (
            <div key={item.id} className="group bg-zinc-900 hover:bg-zinc-800 p-4 rounded-sm border border-zinc-800 hover:border-brand-900 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider px-2 py-0.5 bg-brand-900/20 rounded-sm">
                     {item.category}
                   </span>
                 </div>
                 <h3 className="font-semibold text-zinc-200 text-sm group-hover:text-white transition-colors">{item.title}</h3>
                 <p className="text-xs text-zinc-500 mt-1">{item.source}</p>
               </div>
               <a 
                 href={item.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="shrink-0 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-brand-400 uppercase tracking-wide"
               >
                 Verify Source <ExternalLink className="w-3 h-3" />
               </a>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
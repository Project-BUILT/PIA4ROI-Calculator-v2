import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { TrendingDown, ShieldAlert, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { MOCK_INPUTS } from './constants';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleMockReport = () => {
    // Load mock data into storage
    localStorage.setItem('roi_inputs', JSON.stringify(MOCK_INPUTS));
    localStorage.setItem('roi_email', 'demo@example.com');
    navigate('/council-report');
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-brand-400 text-xs font-bold uppercase tracking-widest mb-8">
          <ShieldAlert className="w-3 h-3" />
          <span>New 2024 Fiscal Model</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 text-balance">
          Burnout costs your department <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">millions.</span>
        </h1>
        
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto text-balance">
          Public safety staffing is a fiscal emergency. 
          See exactly how much turnover, overtime, and liability are costing your agency right now.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="xl" 
            onClick={() => navigate('/quick')}
            className="w-full sm:w-auto"
          >
            Calculate Risk
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            onClick={handleMockReport}
            className="text-zinc-500 hover:text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Mock Council Report
          </Button>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-zinc-900 bg-zinc-900/30 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center gap-8 md:gap-16 text-zinc-500 font-medium">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-600" />
            <span>Evidence-linked assumptions</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-600" />
            <span>Transparent math (No black box)</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-600" />
            <span>Built for Chiefs & Finance Directors</span>
          </div>
        </div>
      </section>

      {/* Problem Buckets Preview */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: TrendingDown,
              title: "Retention Drag",
              desc: "The recruiting treadmill. Calculate the true fully-loaded cost of losing experienced officers/firefighters."
            },
            {
              icon: ShieldAlert,
              title: "Liability Exposure",
              desc: "Claims, settlements, and misconduct often stem from fatigue and burnout. We quantify the risk."
            },
            {
              icon: ArrowRight,
              title: "Overtime Bleed",
              desc: "When staffing drops, overtime spikes. See how much wellness support could reclaim from your OT budget."
            }
          ].map((item, i) => (
            <div key={i} className="bg-zinc-900 p-8 rounded-sm shadow-sm border border-zinc-800 hover:border-brand-900 hover:shadow-lg hover:shadow-brand-900/20 transition-all">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center mb-6 text-brand-500">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-100">{item.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

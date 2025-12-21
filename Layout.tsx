import React, { PropsWithChildren } from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }: PropsWithChildren) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans text-zinc-100 bg-transparent">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              {/* Added border-brand-400/40 for that specific "Pop" requested */}
              <div className="bg-brand-600 p-1.5 rounded-sm shadow-[0_0_15px_rgba(37,59,165,0.5)] group-hover:shadow-[0_0_25px_rgba(37,59,165,0.5)] transition-all border border-brand-400/40">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white uppercase ml-1">
                PIA<span className="text-brand-500">4</span>ROI
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/assumptions" className="text-zinc-400 hover:text-brand-400 transition-colors uppercase tracking-wide text-xs">Methodology</Link>
              {location.pathname !== '/' && (
                <Link to="/" className="text-zinc-400 hover:text-brand-400 transition-colors uppercase tracking-wide text-xs">Restart</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-zinc-900 text-zinc-500 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-zinc-300 font-bold mb-4 uppercase tracking-wider text-xs">PIA4ROI</h3>
            <p className="max-w-xs text-sm text-zinc-600">
              Helping public safety leadership quantify the cost of burnout, turnover, and liability.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2 text-sm">
            <Link to="/assumptions" className="hover:text-brand-400 transition-colors">Assumptions & Sources</Link>
            <a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a>
            <span className="mt-4 text-xs text-zinc-700">© {new Date().getFullYear()} Prototype Build. Not medical or legal advice.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
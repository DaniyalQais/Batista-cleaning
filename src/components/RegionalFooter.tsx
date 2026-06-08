import { Sparkles } from 'lucide-react';
import { BATISTA_PHONE_DISPLAY } from '../constants/contact';

const SERVICE_AREA =
  'Proudly Servicing Phoenix, Scottsdale, Tempe, Mesa, Glendale, and the Greater Valley Area.';

export function RegionalFooter() {
  return (
    <footer id="site-footer" className="w-full bg-[#F8FAFC] text-gray-600 py-12 px-4 text-center border-t border-gray-200/80 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-[#FF5722] rounded-xl flex items-center justify-center shadow-md shadow-[#FF5722]/20">
            <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div className="text-left">
            <span className="font-display font-black text-[#111827] tracking-widest text-sm block">
              BATISTA
            </span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block -mt-1">
              Luxury Cleaners
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base font-semibold text-[#111827] leading-relaxed max-w-2xl mx-auto">
          {SERVICE_AREA}
        </p>

        <a
          href="tel:14808694902"
          className="inline-flex items-center justify-center text-base sm:text-lg font-black text-[#FF5722] hover:text-[#E64A19] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 focus-visible:rounded-md"
        >
          {BATISTA_PHONE_DISPLAY}
        </a>

        <p className="text-[10.5px] text-gray-500 leading-relaxed max-w-md mx-auto">
          &copy; 2026 Batista Cleaning Service. All rights reserved. Estimations are computerized
          forecasts derived based on static layout parameters. All dynamic rates are subject to real
          inspections of site conditions by our field managers before final billing.
        </p>

        <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-200 max-w-md mx-auto">
          Designed by{' '}
          <a
            href="https://thenexusdynamics.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[#FF5722] hover:underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/50 focus-visible:rounded-sm"
          >
            thenexusdynamics.com
          </a>
        </p>
      </div>
    </footer>
  );
}

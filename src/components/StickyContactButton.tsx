import { Phone } from 'lucide-react';
import { BATISTA_PHONE_DISPLAY, BATISTA_PHONE_TEL } from '../constants/contact';

interface StickyContactButtonProps {
  /** Lift button when a bottom bar (e.g. mobile CTA) is visible */
  elevated?: boolean;
}

export function StickyContactButton({ elevated = false }: StickyContactButtonProps) {
  return (
    <a
      href={BATISTA_PHONE_TEL}
      aria-label="Call us at +1 480 869 4902"
      className={`fixed right-4 z-40 flex items-center gap-2 min-h-11 min-w-11 px-4 py-3 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-2xl font-display font-black text-xs tracking-widest uppercase shadow-lg shadow-[#FF5722]/30 hover:shadow-xl hover:shadow-[#FF5722]/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer ${
        elevated
          ? 'bottom-[max(6rem,calc(env(safe-area-inset-bottom)+5.5rem))] md:bottom-[max(1.5rem,env(safe-area-inset-bottom))]'
          : 'bottom-[max(1.5rem,env(safe-area-inset-bottom))]'
      }`}
    >
      <Phone className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">Call Us</span>
    </a>
  );
}

export function PhoneLink({
  className = '',
  showIcon = true,
}: {
  className?: string;
  showIcon?: boolean;
}) {
  return (
    <a
      href={BATISTA_PHONE_TEL}
      className={`inline-flex items-center gap-1.5 hover:text-[#FF5722] transition-colors ${className}`}
    >
      {showIcon && <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      {BATISTA_PHONE_DISPLAY}
    </a>
  );
}

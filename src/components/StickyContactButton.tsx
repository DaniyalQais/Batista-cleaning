import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { BATISTA_PHONE_DISPLAY, BATISTA_PHONE_TEL } from '../constants/contact';

interface StickyContactButtonProps {
  /** Lift button when a bottom bar (e.g. mobile CTA) is visible */
  elevated?: boolean;
}

export function StickyContactButton({ elevated = false }: StickyContactButtonProps) {
  const [heroInView, setHeroInView] = useState(true);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('home');
    const footer = document.getElementById('site-footer');
    if (!hero && !footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === 'home') setHeroInView(entry.isIntersecting);
          if (entry.target.id === 'site-footer') setFooterInView(entry.isIntersecting);
        });
      },
      { threshold: 0 },
    );

    if (hero) observer.observe(hero);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const hideOnMobile = heroInView || footerInView;

  return (
    <div
      className={`fixed right-6 z-50 transition-all duration-300 ${
        hideOnMobile ? 'max-md:opacity-0 max-md:pointer-events-none max-md:translate-y-2' : 'opacity-100'
      } ${
        elevated
          ? 'bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.75rem))] md:bottom-6'
          : 'bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:bottom-6'
      }`}
    >
      <a
        href={BATISTA_PHONE_TEL}
        aria-label={`Call or text ${BATISTA_PHONE_DISPLAY}`}
        className="inline-flex items-center gap-2 min-h-11 px-5 py-3 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-full font-bold text-sm whitespace-nowrap shadow-lg shadow-[#FF5722]/35 hover:shadow-xl hover:shadow-[#FF5722]/45 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#FF5722]"
      >
        <span aria-hidden="true">📞</span>
        <span>Call / Text Line</span>
      </a>
    </div>
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

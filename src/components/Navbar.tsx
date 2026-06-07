import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Menu, X, Phone } from 'lucide-react';
import {
  BATISTA_PHONE_DISPLAY,
  BATISTA_PHONE_SHORT,
  BATISTA_PHONE_TEL,
} from '../constants/contact';

export type NavTarget = 'home' | 'services' | 'about' | 'contact';

const NAV_ITEMS: { label: string; target: NavTarget }[] = [
  { label: 'Home', target: 'home' },
  { label: 'Services', target: 'services' },
  { label: 'About', target: 'about' },
  { label: 'Contact', target: 'contact' },
];

interface NavbarProps {
  onLogoClick: () => void;
  onNavigate: (target: NavTarget) => void;
  onEstimateClick: () => void;
}

function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, containerRef]);
}

function TopHeaderBar() {
  return (
    <div className="w-full bg-[#111827] border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-between gap-3">
        <p className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">
          Professional Luxury Cleaning
        </p>

        <a
          href={BATISTA_PHONE_TEL}
          aria-label={`Call us at ${BATISTA_PHONE_DISPLAY}`}
          className="ml-auto inline-flex items-center gap-1.5 min-h-9 px-2 -mr-2 text-[11px] sm:text-xs font-bold text-gray-200 hover:text-[#FF5722] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/50 focus-visible:rounded-md"
        >
          <Phone className="w-3.5 h-3.5 shrink-0 text-[#FF5722]" aria-hidden="true" />
          <span className="max-[374px]:sr-only min-[375px]:inline sm:hidden">{BATISTA_PHONE_SHORT}</span>
          <span className="hidden sm:inline">{BATISTA_PHONE_DISPLAY}</span>
        </a>
      </div>
    </div>
  );
}

function BrandMark({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 shrink-0 text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 focus-visible:ring-offset-2"
      aria-label="Batista Luxury Cleaners — back to home"
    >
      <div className="w-9 h-9 bg-[#FF5722] rounded-xl flex items-center justify-center shadow-md shadow-[#FF5722]/15">
        <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className="font-display font-black text-sm tracking-widest text-[#111827] uppercase leading-tight">
          BATISTA
        </span>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest -mt-0.5">
          Luxury Cleaners
        </span>
      </div>
    </button>
  );
}

function NavLink({
  label,
  onClick,
  className = '',
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-display font-bold uppercase tracking-wider text-gray-600 hover:text-[#111827] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 focus-visible:rounded-md ${className}`}
    >
      {label}
    </button>
  );
}

function EstimateButton({
  onClick,
  className = '',
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-premium bg-[#111827] hover:bg-black text-white rounded-xl font-extrabold tracking-wide uppercase shadow-sm cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/50 focus-visible:ring-offset-2 ${className}`}
    >
      Get Free Estimate
    </button>
  );
}

export function Navbar({ onLogoClick, onNavigate, onEstimateClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(menuOpen, drawerRef);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const handleNavigate = useCallback(
    (target: NavTarget) => {
      onNavigate(target);
      closeMenu();
    },
    [onNavigate, closeMenu],
  );

  const handleEstimate = useCallback(() => {
    onEstimateClick();
    closeMenu();
  }, [onEstimateClick, closeMenu]);

  return (
    <>
      <div className="relative z-50 w-full">
        <TopHeaderBar />

        <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100/90 shadow-[0_1px_0_rgba(17,24,39,0.04),0_4px_16px_-4px_rgba(17,24,39,0.06)]">
          <div className="max-w-6xl mx-auto px-4 h-[4.25rem] flex items-center justify-between gap-4">
            <BrandMark onClick={onLogoClick} />

            <nav
              className="hidden md:flex items-center gap-5 lg:gap-8 flex-1 justify-center"
              aria-label="Primary"
            >
              {NAV_ITEMS.map((item) => (
                <div key={item.target} className="contents">
                  <NavLink
                    label={item.label}
                    onClick={() => onNavigate(item.target)}
                    className="text-[11px] lg:text-xs"
                  />
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-3 lg:gap-5">
                <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span className="whitespace-nowrap">Available spots open today</span>
                </div>
                <EstimateButton
                  onClick={onEstimateClick}
                  className="px-4 py-2.5 text-xs"
                />
              </div>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-drawer"
                className="md:hidden flex items-center justify-center min-h-11 min-w-11 rounded-xl text-[#111827] hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40"
              >
                {menuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-[#111827]/40 backdrop-blur-[2px] md:hidden"
              aria-label="Close menu"
              onClick={closeMenu}
            />

            <motion.div
              ref={drawerRef}
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white shadow-2xl shadow-gray-900/10 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-5 h-[4.25rem] border-b border-gray-100 shrink-0">
                <BrandMark
                  onClick={() => {
                    onLogoClick();
                    closeMenu();
                  }}
                />
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="flex items-center justify-center min-h-11 min-w-11 rounded-xl text-[#111827] hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
                <ul className="space-y-1">
                  {NAV_ITEMS.map(({ label, target }) => (
                    <li key={target}>
                      <button
                        type="button"
                        onClick={() => handleNavigate(target)}
                        className="w-full min-h-11 py-3 px-1 text-left font-display font-bold text-lg uppercase tracking-wider text-[#111827] hover:text-[#FF5722] border-b border-gray-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 focus-visible:rounded-md"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="shrink-0 p-5 border-t border-gray-100 bg-white pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <EstimateButton
                  onClick={handleEstimate}
                  className="w-full py-4 text-sm"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

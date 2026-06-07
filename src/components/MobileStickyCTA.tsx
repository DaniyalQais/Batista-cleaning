import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface MobileStickyCTAProps {
  visible: boolean;
  label: string;
  sublabel?: string;
  onClick: () => void;
}

export function MobileStickyCTA({ visible, label, sublabel, onClick }: MobileStickyCTAProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none"
        >
          <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-auto">
            <button
              type="button"
              onClick={onClick}
              className="w-full py-4 px-5 bg-[#111827] hover:bg-black text-white rounded-2xl font-display font-black text-xs tracking-widest uppercase transition-all shadow-[0_8px_32px_-4px_rgba(17,24,39,0.35)] flex items-center justify-between gap-3 active:scale-[0.98] cursor-pointer group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-[#FF5722] flex items-center justify-center shrink-0 shadow-lg shadow-[#FF5722]/30">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="block leading-tight">{label}</span>
                  {sublabel && (
                    <span className="block text-[10px] text-gray-400 font-semibold normal-case tracking-normal mt-0.5">
                      {sublabel}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#FF5722] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

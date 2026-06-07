import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Clock, Sparkles, Users, Zap } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { EstimateResult, CleaningType, PropertyDetails } from '../types';
import { getCleaningTypeName, getSelectedTaskList, getPlanSummaryLabel } from '../hooks/useLivePlan';

interface LivePlanPanelProps {
  estimate: EstimateResult;
  cleaningType: CleaningType;
  selectedTasks: Set<string>;
  propertyDetails: PropertyDetails;
  isRecalculating: boolean;
  insight: string | null;
  compact?: boolean;
  onLockEstimate?: () => void;
  showPlanItems?: boolean;
  className?: string;
}

export function LivePlanPanel({
  estimate,
  cleaningType,
  selectedTasks,
  propertyDetails,
  isRecalculating,
  insight,
  compact = false,
  onLockEstimate,
  showPlanItems = true,
  className = '',
}: LivePlanPanelProps) {
  const planItems = getSelectedTaskList(selectedTasks);
  const summary = getPlanSummaryLabel(cleaningType, propertyDetails, selectedTasks.size);

  if (compact) {
    return (
      <div className={`estimate-card-hero rounded-2xl p-4 space-y-3 relative overflow-hidden ${className}`}>
        <RecalcOverlay active={isRecalculating} />

        <div className="flex items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2 min-w-0">
            <StatusDot recalculating={isRecalculating} />
            <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider truncate">
              {isRecalculating ? 'Recalculating…' : 'Live Plan'}
            </span>
          </div>
          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
            -$50
          </span>
        </div>

        <div className={`transition-opacity duration-200 ${isRecalculating ? 'opacity-60' : 'opacity-100'}`}>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-display font-black text-[#FF5722]">
              $<AnimatedCounter value={estimate.discountedMin} />
            </span>
            <span className="text-lg text-[#FF5722]/50">–</span>
            <span className="text-2xl font-display font-black text-[#FF5722]">
              $<AnimatedCounter value={estimate.discountedMax} />
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <MetricPill label="Hours" value={<AnimatedCounter value={estimate.hours} decimals={1} />} />
            <MetricPill label="Crew" value={<><AnimatedCounter value={estimate.teamSize} /> pro{estimate.teamSize > 1 ? 's' : ''}</>} />
            <MetricPill label="Score" value={<><AnimatedCounter value={estimate.complexityScoreNumeric} />/100</>} />
          </div>
        </div>

        <InsightToast insight={insight} compact />
      </div>
    );
  }

  return (
    <div className={`estimate-card-hero rounded-3xl p-5 md:p-6 space-y-5 text-left relative overflow-hidden ${className}`}>
      <RecalcOverlay active={isRecalculating} />
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF5722]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100/80 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF5722]/10 flex items-center justify-center">
            <Sparkles className={`w-4 h-4 text-[#FF5722] ${isRecalculating ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
          </div>
          <div>
            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-wider">Your Cleaning Plan</p>
            <p className="text-xs font-bold text-gray-800 truncate max-w-[180px] sm:max-w-none">{summary}</p>
          </div>
        </div>
        <StatusDot recalculating={isRecalculating} labeled />
      </div>

      {/* Price block */}
      <motion.div
        animate={isRecalculating ? { scale: [1, 0.99, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 }}
        className={`relative transition-opacity duration-200 ${isRecalculating ? 'opacity-70' : 'opacity-100'}`}
      >
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Cost</p>
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-3xl sm:text-4xl font-display font-black text-[#FF5722] tracking-tight">
            $<AnimatedCounter value={estimate.discountedMin} />
          </span>
          <span className="text-xl font-display font-black text-[#FF5722]/50">–</span>
          <span className="text-3xl sm:text-4xl font-display font-black text-[#FF5722] tracking-tight">
            $<AnimatedCounter value={estimate.discountedMax} />
          </span>
        </div>
        <p className="text-[10px] text-gray-400 line-through mt-0.5">
          ${estimate.priceRangeMin} – ${estimate.priceRangeMax}
        </p>
      </motion.div>

      {/* Metrics grid */}
      <div className={`grid grid-cols-2 gap-2.5 transition-all duration-300 ${isRecalculating ? 'opacity-60 blur-[0.3px]' : 'opacity-100 blur-0'}`}>
        <MetricCard
          icon={<Zap className="w-4 h-4 text-purple-500" />}
          label="Complexity"
          value={<><AnimatedCounter value={estimate.complexityScoreNumeric} /><span className="text-sm text-gray-400">/100</span></>}
          bar={estimate.complexityScoreNumeric}
        />
        <MetricCard
          icon={<Clock className="w-4 h-4 text-blue-500" />}
          label="Est. Hours"
          value={<AnimatedCounter value={estimate.hours} decimals={1} />}
          sub="Labor allocated"
        />
        <MetricCard
          icon={<Users className="w-4 h-4 text-[#FF5722]" />}
          label="Crew Size"
          value={<><AnimatedCounter value={estimate.teamSize} /> <span className="text-xs font-bold text-gray-400">pro{estimate.teamSize > 1 ? 's' : ''}</span></>}
          sub="Vetted specialists"
        />
        <MetricCard
          icon={<Check className="w-4 h-4 text-emerald-500" />}
          label="Discount"
          value={<span className="text-emerald-600">-$50</span>}
          sub="Auto-applied"
        />
      </div>

      {/* Live plan items */}
      {showPlanItems && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active Scope</span>
            <span className="text-[#FF5722]">{planItems.length} items</span>
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            <AnimatePresence mode="popLayout">
              {planItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-white/60 rounded-xl border border-gray-100 text-[11px]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] shrink-0" />
                    <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-[10px] shrink-0">+{item.minutes}m</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {planItems.length === 0 && (
              <p className="text-[11px] text-gray-400 italic px-2">Select focus areas to build your plan</p>
            )}
          </div>
        </div>
      )}

      <InsightToast insight={insight} />

      {onLockEstimate && (
        <button
          type="button"
          onClick={onLockEstimate}
          className="btn-premium w-full py-3.5 bg-[#111827] hover:bg-black text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer relative"
        >
          Lock This Estimate
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium pt-1">
        <span className={`px-2 py-0.5 rounded-md font-black uppercase ${
          estimate.complexityScore === 'A' ? 'bg-emerald-50 text-emerald-700' :
          estimate.complexityScore === 'B' ? 'bg-amber-50 text-amber-700' :
          'bg-rose-50 text-rose-700'
        }`}>
          Class {estimate.complexityScore}
        </span>
        <span>{getCleaningTypeName(cleaningType)}</span>
      </div>
    </div>
  );
}

function StatusDot({ recalculating, labeled }: { recalculating: boolean; labeled?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="relative flex h-2 w-2">
        {recalculating ? (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5722] opacity-75" />
        ) : (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${recalculating ? 'bg-[#FF5722]' : 'bg-emerald-500'}`} />
      </span>
      {labeled && (
        <span className="text-[10px] font-mono font-black text-gray-500 uppercase">
          {recalculating ? 'Syncing' : 'Live'}
        </span>
      )}
    </div>
  );
}

function RecalcOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-10"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 0.6s ease-in-out',
          }}
        />
      )}
    </AnimatePresence>
  );
}

function MetricPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white/70 rounded-lg px-2 py-1.5 border border-gray-100 text-center">
      <p className="text-[8px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-xs font-black text-gray-900">{value}</p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  bar,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  bar?: number;
}) {
  return (
    <div className="bg-white/70 rounded-xl p-3 border border-gray-100/80 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-display font-black text-gray-900">{value}</p>
      {bar !== undefined && (
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF5722] to-amber-500 rounded-full"
            animate={{ width: `${bar}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          />
        </div>
      )}
      {sub && <p className="text-[9px] text-gray-400 font-semibold">{sub}</p>}
    </div>
  );
}

function InsightToast({ insight, compact }: { insight: string | null; compact?: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {insight && (
        <motion.div
          key={insight}
          initial={{ opacity: 0, y: compact ? 4 : 8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`flex items-start gap-2 bg-[#111827] text-white rounded-xl overflow-hidden ${compact ? 'px-3 py-2' : 'px-3.5 py-2.5'}`}
        >
          <Zap className="w-3.5 h-3.5 text-[#FF5722] shrink-0 mt-0.5" />
          <p className={`font-semibold leading-snug ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{insight}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

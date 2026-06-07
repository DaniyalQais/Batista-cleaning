import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  Clock,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { BUSINESS_CONFIG } from '../config/business';
import { ScopeIntelligence } from '../engine/scopeIntelligence';
import { EstimateResult, CleaningType, PropertyDetails } from '../types';
import { getCleaningTypeName, getSelectedTaskList, getPlanSummaryLabel } from '../hooks/useLivePlan';

interface LivePlanPanelProps {
  estimate: EstimateResult;
  intelligence: ScopeIntelligence;
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

const COMPLEXITY_COLORS: Record<string, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Moderate: 'bg-blue-50 text-blue-700 border-blue-100',
  High: 'bg-amber-50 text-amber-700 border-amber-100',
  'Very High': 'bg-rose-50 text-rose-700 border-rose-100',
};

const PRIORITY_COLORS: Record<string, string> = {
  Standard: 'bg-gray-100 text-gray-700',
  Elevated: 'bg-blue-50 text-blue-700',
  Priority: 'bg-amber-50 text-amber-700',
  Intensive: 'bg-rose-50 text-rose-700',
};

export function LivePlanPanel({
  estimate,
  intelligence,
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
  const { laborBreakdown, complexityLabel, complexityFactors, recommendations, scopeInsights } =
    intelligence;

  if (compact) {
    return (
      <div className={`estimate-card-hero rounded-2xl p-4 space-y-3 relative overflow-hidden ${className}`}>
        <RecalcOverlay active={isRecalculating} />
        <div className="flex items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2 min-w-0">
            <StatusDot recalculating={isRecalculating} />
            <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider truncate">
              {isRecalculating ? 'Analyzing…' : 'Scope Intelligence'}
            </span>
          </div>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${COMPLEXITY_COLORS[complexityLabel]}`}>
            {complexityLabel}
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
            <MetricPill label="Confidence" value={<><AnimatedCounter value={intelligence.scopeConfidence} />%</>} />
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
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100/80 relative">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5722]/15 to-amber-500/10 flex items-center justify-center shrink-0">
            <Sparkles className={`w-4 h-4 text-[#FF5722] ${isRecalculating ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-wider">
              Scope Intelligence
            </p>
            <p className="text-xs font-bold text-gray-800 truncate">{summary}</p>
          </div>
        </div>
        <StatusDot recalculating={isRecalculating} labeled />
      </div>

      {/* Price + confidence row */}
      <motion.div
        animate={isRecalculating ? { scale: [1, 0.99, 1] } : { scale: 1 }}
        className={`grid grid-cols-1 sm:grid-cols-5 gap-4 relative ${isRecalculating ? 'opacity-70' : ''}`}
      >
        <div className="sm:col-span-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Cost</p>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-3xl sm:text-4xl font-display font-black text-[#FF5722]">
              $<AnimatedCounter value={estimate.discountedMin} />
            </span>
            <span className="text-xl text-[#FF5722]/50">–</span>
            <span className="text-3xl sm:text-4xl font-display font-black text-[#FF5722]">
              $<AnimatedCounter value={estimate.discountedMax} />
            </span>
          </div>
          <p className="text-[10px] text-gray-400 line-through mt-0.5">
            ${estimate.priceRangeMin} – ${estimate.priceRangeMax} · -${BUSINESS_CONFIG.discountAmount} applied
          </p>
        </div>
        <div className="sm:col-span-2 bento-card p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase">Scope Confidence</span>
            <span className="text-sm font-display font-black text-gray-900">
              <AnimatedCounter value={intelligence.scopeConfidence} suffix="%" />
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#FF5722] rounded-full"
              animate={{ width: `${intelligence.scopeConfidence}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Operations metrics */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${isRecalculating ? 'opacity-60' : ''}`}>
        <MetricCard
          icon={<Target className="w-4 h-4 text-purple-500" />}
          label="Complexity"
          value={complexityLabel}
          sub={`Class ${estimate.complexityScore}`}
          badgeClass={COMPLEXITY_COLORS[complexityLabel]}
        />
        <MetricCard
          icon={<Clock className="w-4 h-4 text-blue-500" />}
          label="Est. Hours"
          value={<AnimatedCounter value={estimate.hours} decimals={1} />}
          sub={intelligence.estimatedArrivalWindow}
        />
        <MetricCard
          icon={<Users className="w-4 h-4 text-[#FF5722]" />}
          label="Crew Size"
          value={<><AnimatedCounter value={estimate.teamSize} /> <span className="text-xs text-gray-400">pros</span></>}
          sub="Recommended allocation"
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4 text-amber-500" />}
          label="Priority"
          value={intelligence.servicePriority}
          badgeClass={PRIORITY_COLORS[intelligence.servicePriority]}
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recommendations</p>
        <div className="grid grid-cols-1 gap-2">
          {recommendations.map((rec) => (
            <motion.div
              key={rec.id}
              layout
              className="flex items-start gap-3 px-3 py-2.5 bg-white/70 rounded-xl border border-gray-100/80"
            >
              <div className="w-1 h-full min-h-[2rem] rounded-full bg-[#FF5722]/60 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-gray-400 uppercase">{rec.label}</p>
                <p className="text-sm font-black text-gray-900">{rec.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{rec.reason}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Explainable complexity */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Complexity Factors</p>
        <div className="flex flex-wrap gap-1.5">
          {complexityFactors.map((factor) => (
            <span
              key={factor.label}
              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${
                factor.impact === 'high'
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : factor.impact === 'medium'
                    ? 'bg-amber-50 text-amber-800 border-amber-100'
                    : 'bg-gray-50 text-gray-600 border-gray-100'
              }`}
            >
              {factor.label}
            </span>
          ))}
        </div>
      </div>

      {/* Labor breakdown */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Labor Breakdown</p>
        <div className="bg-white/60 rounded-xl border border-gray-100 divide-y divide-gray-100/80 text-[11px]">
          <LaborRow label="Base Cleaning Time" hours={laborBreakdown.baseCleaningHours} />
          <LaborRow label="Kitchen Scope" hours={laborBreakdown.kitchenScopeHours} />
          <LaborRow label="Bathroom Scope" hours={laborBreakdown.bathroomScopeHours} />
          <LaborRow label="Bedroom Scope" hours={laborBreakdown.bedroomScopeHours} />
          <LaborRow label="Special Tasks" hours={laborBreakdown.livingScopeHours} />
          {laborBreakdown.adjustmentHours !== 0 && (
            <LaborRow label="Minimum / Adjustments" hours={laborBreakdown.adjustmentHours} signed />
          )}
          <div className="flex justify-between items-center px-3 py-2.5 bg-[#111827]/5 font-black text-gray-900">
            <span>Total Hours</span>
            <span className="text-[#FF5722]">
              <AnimatedCounter value={laborBreakdown.totalHours} decimals={1} />h
            </span>
          </div>
        </div>
      </div>

      {/* Scope insights */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scope Insights</p>
        <ul className="space-y-1.5">
          {scopeInsights.map((msg) => (
            <li key={msg} className="flex gap-2 text-[11px] text-gray-600 leading-snug">
              <Shield className="w-3.5 h-3.5 text-[#FF5722] shrink-0 mt-0.5" />
              {msg}
            </li>
          ))}
        </ul>
      </div>

      {/* Active scope */}
      {showPlanItems && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
            <span>Active Scope</span>
            <span className="text-[#FF5722]">{planItems.length} items</span>
          </p>
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
            <AnimatePresence mode="popLayout">
              {planItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex justify-between gap-2 px-3 py-2 bg-white/60 rounded-lg border border-gray-100 text-[11px]"
                >
                  <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                  <span className="text-gray-400 font-mono shrink-0">+{item.minutes}m</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Live insight toast */}
      <InsightToast insight={insight} />

      {/* Footer meta */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
          <Calendar className="w-3 h-3" />
          {intelligence.recommendedFrequency}
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-[10px] text-gray-500 font-semibold">
          Response &lt;{BUSINESS_CONFIG.responseSlaHours}h
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-[10px] text-gray-500 font-semibold">{getCleaningTypeName(cleaningType)}</span>
      </div>

      {onLockEstimate && (
        <button
          type="button"
          onClick={onLockEstimate}
          className="btn-premium w-full py-3.5 bg-[#111827] hover:bg-black text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
        >
          Lock This Estimate
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function LaborRow({ label, hours, signed }: { label: string; hours: number; signed?: boolean }) {
  if (hours === 0 && !signed) return null;
  return (
    <div className="flex justify-between items-center px-3 py-2 text-gray-600">
      <span>{label}</span>
      <span className="font-mono font-bold text-gray-800">
        {signed && hours > 0 ? '+' : ''}
        <AnimatedCounter value={Math.abs(hours)} decimals={1} />h
      </span>
    </div>
  );
}

function StatusDot({ recalculating, labeled }: { recalculating: boolean; labeled?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${recalculating ? 'bg-[#FF5722]' : 'bg-emerald-400'}`} />
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
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-10"
          style={{ backgroundSize: '200% 100%', animation: 'shimmer 0.6s ease-in-out' }}
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
  badgeClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  badgeClass?: string;
}) {
  return (
    <div className="bento-card p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      {badgeClass ? (
        <span className={`inline-block text-sm font-display font-black px-2 py-0.5 rounded-lg border ${badgeClass}`}>
          {value}
        </span>
      ) : (
        <p className="text-lg font-display font-black text-gray-900">{value}</p>
      )}
      {sub && <p className="text-[9px] text-gray-400 font-semibold leading-snug">{sub}</p>}
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
          className={`flex items-start gap-2 bg-[#111827] text-white rounded-xl ${compact ? 'px-3 py-2' : 'px-3.5 py-2.5'}`}
        >
          <Zap className="w-3.5 h-3.5 text-[#FF5722] shrink-0 mt-0.5" />
          <p className={`font-semibold leading-snug ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{insight}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

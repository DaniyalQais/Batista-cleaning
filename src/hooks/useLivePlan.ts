import { useCallback, useEffect, useRef, useState } from 'react';
import { CleaningType, EstimateResult, PropertyDetails } from '../types';
import { CLEANING_TYPES, ROOMS_MAP } from '../data';

export type PlanAction =
  | { type: 'task-toggle'; taskId: string; added: boolean; taskName: string; minutes: number }
  | { type: 'cleaning-type'; name: string }
  | { type: 'sqft'; value: number }
  | { type: 'bedrooms'; value: number }
  | { type: 'bathrooms'; value: number }
  | { type: 'pets'; enabled: boolean }
  | { type: 'last-clean'; label: string };

function buildInsight(
  action: PlanAction,
  prev: EstimateResult,
  next: EstimateResult
): string {
  const priceDelta = next.discountedMin - prev.discountedMin;

  switch (action.type) {
    case 'task-toggle':
      if (action.added) {
        return `+${action.minutes} min · ${action.taskName} added to your plan`;
      }
      return `${action.taskName} removed · optimizing scope`;
    case 'cleaning-type':
      return `Plan recalibrated for ${action.name}`;
    case 'sqft':
      return `Space updated to ${action.value.toLocaleString()} sq ft`;
    case 'bedrooms':
      return `${action.value} bedroom${action.value > 1 ? 's' : ''} factored into crew allocation`;
    case 'bathrooms':
      return `${action.value} bathroom${action.value > 1 ? 's' : ''} added to scope matrix`;
    case 'pets':
      return action.enabled
        ? 'Pet-safe filtration protocol activated (+15%)'
        : 'Standard cleaning protocol restored';
    case 'last-clean':
      return `Frequency adjusted · ${action.label}`;
    default:
      break;
  }

  if (next.teamSize > prev.teamSize) {
    return `Crew expanded to ${next.teamSize} professionals for efficiency`;
  }
  if (next.teamSize < prev.teamSize) {
    return `Optimized to ${next.teamSize} specialist${next.teamSize > 1 ? 's' : ''}`;
  }
  if (Math.abs(priceDelta) >= 15) {
    return priceDelta > 0
      ? `Estimate adjusted +$${Math.abs(priceDelta)} based on scope`
      : `Scope optimized · saving $${Math.abs(priceDelta)}`;
  }
  if (Math.abs(next.hours - prev.hours) >= 0.3) {
    const diff = (next.hours - prev.hours).toFixed(1);
    return Number(diff) > 0 ? `+${diff} labor hours allocated` : `${diff} hours removed from plan`;
  }

  return 'Plan parameters synchronized';
}

export function useLivePlan(estimate: EstimateResult) {
  const prevEstimate = useRef(estimate);
  const pendingAction = useRef<PlanAction | null>(null);
  const recalcTimer = useRef<ReturnType<typeof setTimeout>>();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const triggerRecalc = useCallback((action: PlanAction) => {
    if (recalcTimer.current) clearTimeout(recalcTimer.current);
    pendingAction.current = action;
    setIsRecalculating(true);
    recalcTimer.current = setTimeout(() => setIsRecalculating(false), 500);
  }, []);

  useEffect(() => {
    if (!pendingAction.current) return;
    const message = buildInsight(pendingAction.current, prevEstimate.current, estimate);
    setInsight(message);
    prevEstimate.current = estimate;
    pendingAction.current = null;
  }, [estimate]);

  useEffect(() => {
    return () => {
      if (recalcTimer.current) clearTimeout(recalcTimer.current);
    };
  }, []);

  return { isRecalculating, insight, triggerRecalc };
}

export function getTaskMeta(taskId: string) {
  for (const room of Object.values(ROOMS_MAP)) {
    const task = room.tasks.find(t => t.id === taskId);
    if (task) return task;
  }
  return null;
}

export function getCleaningTypeName(id: CleaningType) {
  return CLEANING_TYPES.find(t => t.id === id)?.name ?? id;
}

export function getSelectedTaskList(selectedTasks: Set<string>) {
  const items: { id: string; name: string; room: string; minutes: number }[] = [];
  Object.entries(ROOMS_MAP).forEach(([, room]) => {
    room.tasks.forEach(task => {
      if (selectedTasks.has(task.id)) {
        items.push({
          id: task.id,
          name: task.name,
          room: room.name,
          minutes: task.estimatedMinutesPerUnit,
        });
      }
    });
  });
  return items;
}

export function getPlanSummaryLabel(
  cleaningType: CleaningType,
  propertyDetails: PropertyDetails,
  taskCount: number
) {
  const typeName = getCleaningTypeName(cleaningType);
  return `${typeName} · ${propertyDetails.sqFt.toLocaleString()} sq ft · ${taskCount} focus areas`;
}

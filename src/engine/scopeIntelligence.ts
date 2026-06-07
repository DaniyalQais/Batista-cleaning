import { BUSINESS_CONFIG, ComplexityLabel, ServicePriority } from '../config/business';
import { calculateLaborBreakdown, LaborBreakdown } from './laborBreakdown';
import { CLEANING_TYPES, ROOMS_MAP } from '../data';
import {
  CleaningType,
  EstimateResult,
  PropertyDetails,
} from '../types';

export interface ComplexityFactor {
  label: string;
  impact: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  id: string;
  label: string;
  value: string;
  reason: string;
}

export interface ScopeIntelligence {
  recommendations: Recommendation[];
  complexityLabel: ComplexityLabel;
  complexityFactors: ComplexityFactor[];
  laborBreakdown: LaborBreakdown;
  scopeInsights: string[];
  scopeConfidence: number;
  estimatedArrivalWindow: string;
  servicePriority: ServicePriority;
  recommendedFrequency: string;
}

function getComplexityLabel(score: number): ComplexityLabel {
  const { low, moderate, high } = BUSINESS_CONFIG.complexityLabels;
  if (score <= low) return 'Low';
  if (score <= moderate) return 'Moderate';
  if (score <= high) return 'High';
  return 'Very High';
}

function buildComplexityFactors(
  cleaningType: CleaningType,
  selectedTasks: Set<string>,
  properties: PropertyDetails,
  estimate: EstimateResult
): ComplexityFactor[] {
  const factors: ComplexityFactor[] = [];
  const typeConfig = CLEANING_TYPES.find(t => t.id === cleaningType)!;

  if (properties.sqFt >= 2500) {
    factors.push({ label: `Large property (${properties.sqFt.toLocaleString()} sq ft)`, impact: 'high' });
  } else if (properties.sqFt >= 1500) {
    factors.push({ label: `Mid-size layout (${properties.sqFt.toLocaleString()} sq ft)`, impact: 'medium' });
  } else {
    factors.push({ label: `Compact layout (${properties.sqFt.toLocaleString()} sq ft)`, impact: 'low' });
  }

  if (typeConfig.multiplier >= 1.5) {
    factors.push({ label: `${typeConfig.name} service tier`, impact: 'high' });
  } else if (typeConfig.multiplier > 1.0) {
    factors.push({ label: `${typeConfig.name} service tier`, impact: 'medium' });
  }

  const taskCount = selectedTasks.size;
  if (taskCount >= 8) {
    factors.push({ label: `${taskCount} scoped focus areas`, impact: 'high' });
  } else if (taskCount >= 4) {
    factors.push({ label: `${taskCount} scoped focus areas`, impact: 'medium' });
  } else {
    factors.push({ label: `${taskCount} scoped focus areas`, impact: 'low' });
  }

  if (properties.hasPets) {
    factors.push({ label: 'Pet-safe filtration required', impact: 'medium' });
  }

  if (properties.lastCleanInterval === '6-plus') {
    factors.push({ label: 'Extended time since last professional clean', impact: 'high' });
  } else if (properties.lastCleanInterval === '3-6-months') {
    factors.push({ label: 'Moderate buildup since last clean', impact: 'medium' });
  } else if (properties.lastCleanInterval === 'less-than-1') {
    factors.push({ label: 'Recent cleaning history reduces effort', impact: 'low' });
  }

  if (estimate.hours >= 6) {
    factors.push({ label: `${estimate.hours}h estimated labor load`, impact: 'high' });
  } else if (estimate.hours >= 4) {
    factors.push({ label: `${estimate.hours}h estimated labor load`, impact: 'medium' });
  }

  return factors.slice(0, 5);
}

function recommendService(cleaningType: CleaningType, properties: PropertyDetails): Recommendation {
  const current = CLEANING_TYPES.find(t => t.id === cleaningType)!;

  if (
    (properties.lastCleanInterval === '6-plus' || properties.lastCleanInterval === '3-6-months') &&
    cleaningType === 'standard'
  ) {
    return {
      id: 'service',
      label: 'Recommended Service',
      value: 'Deep Cleaning',
      reason: 'Cleaning history suggests restorative detailing for best results',
    };
  }

  if (properties.sqFt >= 3000 && cleaningType === 'standard') {
    return {
      id: 'service',
      label: 'Recommended Service',
      value: 'Deep Cleaning',
      reason: 'Property size benefits from an expanded scope pass',
    };
  }

  return {
    id: 'service',
    label: 'Recommended Service',
    value: current.name,
    reason: 'Aligned with your selected plan and property profile',
  };
}

function recommendFrequency(properties: PropertyDetails, cleaningType: CleaningType): string {
  if (cleaningType === 'airbnb') return 'Per turnover / guest checkout';
  if (cleaningType === 'move') return 'One-time move service';

  if (properties.lastCleanInterval === 'less-than-1') return 'Bi-weekly';
  if (properties.hasPets) return 'Bi-weekly';
  if (properties.lastCleanInterval === '6-plus') return 'Monthly (then bi-weekly)';
  return 'Monthly';
}

function recommendCrew(estimate: EstimateResult): Recommendation {
  const label =
    estimate.teamSize === 1
      ? '1 Professional'
      : `${estimate.teamSize} Professionals`;

  let reason = 'Single specialist can complete within target window';
  if (estimate.teamSize === 2) {
    reason = 'Property size and scope suggest a two-person crew for efficiency';
  } else if (estimate.teamSize === 3) {
    reason = 'High labor load requires a three-person crew to stay on schedule';
  }

  return {
    id: 'crew',
    label: 'Recommended Crew',
    value: label,
    reason,
  };
}

function buildScopeInsights(
  cleaningType: CleaningType,
  selectedTasks: Set<string>,
  properties: PropertyDetails,
  estimate: EstimateResult,
  breakdown: LaborBreakdown
): string[] {
  const insights: string[] = [];
  const typeConfig = CLEANING_TYPES.find(t => t.id === cleaningType)!;

  const specialTaskMinutes = Object.values(ROOMS_MAP).flatMap(r => r.tasks)
    .filter(t => selectedTasks.has(t.id) && t.baseWeightLevel >= 3)
    .reduce((s, t) => s + t.estimatedMinutesPerUnit, 0);

  if (specialTaskMinutes >= 30) {
    insights.push(
      `Deep-cleaning tasks increased labor requirements by ${specialTaskMinutes} minutes.`
    );
  }

  if (estimate.teamSize === 3) {
    insights.push('High labor load suggests a three-person crew.');
  } else if (estimate.teamSize === 2) {
    insights.push('Property size suggests a two-person crew.');
  }

  if (properties.lastCleanInterval === 'less-than-1') {
    insights.push('Recent cleaning history reduced estimated effort.');
  } else if (properties.lastCleanInterval === '6-plus') {
    insights.push('Extended cleaning interval increased scope intensity.');
  }

  if (properties.hasPets) {
    insights.push('Pet presence adds allergen filtration to the service plan.');
  }

  if (typeConfig.multiplier > 1.2 && cleaningType !== 'standard') {
    insights.push(`${typeConfig.name} tier expanded baseline labor by ${Math.round((typeConfig.multiplier - 1) * 100)}%.`);
  }

  if (breakdown.kitchenScopeHours + breakdown.bathroomScopeHours >= breakdown.baseCleaningHours * 0.5) {
    insights.push('Kitchen and bath scope drive a significant share of total labor.');
  }

  if (insights.length === 0) {
    insights.push('Scope parameters are balanced for a standard service window.');
  }

  return insights.slice(0, 4);
}

function computeScopeConfidence(
  selectedTasks: Set<string>,
  properties: PropertyDetails,
  hasCompletedStep2: boolean
): number {
  const cfg = BUSINESS_CONFIG.scopeConfidence;
  let score = cfg.baseWithDefaults;
  score += Math.min(selectedTasks.size * cfg.perTask, cfg.maxTasksBonus);
  if (hasCompletedStep2) score += cfg.step2Bonus;
  if (selectedTasks.size >= 6) score += cfg.completeScopeBonus;
  return Math.min(98, Math.round(score));
}

function computeArrivalWindow(estimate: EstimateResult): string {
  const perPersonHours = estimate.hours / estimate.teamSize;
  const low = Math.max(2, Math.floor(perPersonHours * 0.85));
  const high = Math.ceil(perPersonHours * 1.15) + 1;
  return `${low}–${high} hour on-site window`;
}

function computeServicePriority(
  estimate: EstimateResult,
  cleaningType: CleaningType,
  complexityLabel: ComplexityLabel
): ServicePriority {
  if (cleaningType === 'move' || complexityLabel === 'Very High') return 'Intensive';
  if (complexityLabel === 'High' || cleaningType === 'deep') return 'Priority';
  if (complexityLabel === 'Moderate' || cleaningType === 'airbnb') return 'Elevated';
  return 'Standard';
}

export function buildScopeIntelligence(
  cleaningType: CleaningType,
  selectedTasks: Set<string>,
  properties: PropertyDetails,
  estimate: EstimateResult,
  options?: { hasCompletedStep2?: boolean }
): ScopeIntelligence {
  const laborBreakdown = calculateLaborBreakdown(
    cleaningType,
    selectedTasks,
    properties,
    estimate.hours
  );

  const complexityLabel = getComplexityLabel(estimate.complexityScoreNumeric);
  const complexityFactors = buildComplexityFactors(cleaningType, selectedTasks, properties, estimate);

  const recommendations: Recommendation[] = [
    recommendCrew(estimate),
    recommendService(cleaningType, properties),
    {
      id: 'frequency',
      label: 'Recommended Frequency',
      value: recommendFrequency(properties, cleaningType),
      reason: 'Based on property profile and cleaning history',
    },
  ];

  return {
    recommendations,
    complexityLabel,
    complexityFactors,
    laborBreakdown,
    scopeInsights: buildScopeInsights(cleaningType, selectedTasks, properties, estimate, laborBreakdown),
    scopeConfidence: computeScopeConfidence(selectedTasks, properties, options?.hasCompletedStep2 ?? false),
    estimatedArrivalWindow: computeArrivalWindow(estimate),
    servicePriority: computeServicePriority(estimate, cleaningType, complexityLabel),
    recommendedFrequency: recommendFrequency(properties, cleaningType),
  };
}

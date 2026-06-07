import { BUSINESS_CONFIG } from './config/business';
import { CleaningTypeOption, RoomType, TaskSelection, PropertyDetails, EstimateResult } from './types';

export const CLEANING_TYPES: CleaningTypeOption[] = [
  {
    id: 'standard',
    name: 'Standard Cleaning',
    tagline: 'Routine Maintenance',
    description: 'Perfect for keeping your home consistently clean, dust-free, and sanitized on an ongoing basis.',
    multiplier: 1.0,
    perSqFtRate: 0.08,
  },
  {
    id: 'deep',
    name: 'Deep Cleaning',
    tagline: 'Deep Restorative Wash',
    description: 'Intense detailing including hard-to-reach areas, built-up residue, and specialized grease removal.',
    multiplier: 1.4,
    perSqFtRate: 0.12,
  },
  {
    id: 'move',
    name: 'Move-In / Move-Out',
    tagline: 'Complete Empty Turnover',
    description: 'Breathes life into an empty property, sanitizing inside drawers, cabinets, oven, and fridge from top to bottom.',
    multiplier: 1.6,
    perSqFtRate: 0.15,
  },
  {
    id: 'airbnb',
    name: 'Airbnb Turnover',
    tagline: '5-Star Hospitality Clean',
    description: 'Same-day fast turnover with staging, cosmetic luxury resets, restocking, and guest satisfaction checks.',
    multiplier: 1.3,
    perSqFtRate: 0.11,
  },
];

export const ROOMS_MAP: Record<RoomType, { name: string; icon: string; tasks: Omit<TaskSelection, 'selected'>[] }> = {
  kitchen: {
    name: 'Kitchen',
    icon: 'ChefHat',
    tasks: [
      { id: 'k-oven', name: 'Deep clean oven interior', description: 'Degrease racks and bake elements', baseWeightLevel: 3, estimatedMinutesPerUnit: 35 },
      { id: 'k-stovetop', name: 'Deep clean stovetop & burners', description: 'Heavy-duty grease removal', baseWeightLevel: 2, estimatedMinutesPerUnit: 20 },
      { id: 'k-cabinet-handles', name: 'Detail cabinet handles & faces', description: 'Sanitize finger-touch spots', baseWeightLevel: 2, estimatedMinutesPerUnit: 25 },
      { id: 'k-fridge', name: 'Clean refrigerator inside', description: 'Wipe down shelves and crisper drawers', baseWeightLevel: 3, estimatedMinutesPerUnit: 30 },
    ],
  },
  bathrooms: {
    name: 'Bathrooms',
    icon: 'Bath',
    tasks: [
      { id: 'ba-shower', name: 'Scrub shower walls & disinfect fixtures', description: 'Mineral and grime removal', baseWeightLevel: 3, estimatedMinutesPerUnit: 25 },
      { id: 'ba-fixtures', name: 'Polish handles and chrome mirrors', description: 'Streak-free glossy detail', baseWeightLevel: 2, estimatedMinutesPerUnit: 15 },
      { id: 'ba-surfaces', name: 'Sanitize toilet and vanity areas', description: 'Complete anti-microbial reset', baseWeightLevel: 3, estimatedMinutesPerUnit: 20 },
    ],
  },
  bedrooms: {
    name: 'Bedrooms',
    icon: 'BedDouble',
    tasks: [
      { id: 'be-bedding', name: 'Wash bedding & custom layout', description: 'Stretched linens & hospital corners', baseWeightLevel: 2, estimatedMinutesPerUnit: 20 },
      { id: 'be-furniture', name: 'Dust high surfaces & sills', description: 'Static micro-dust elimination', baseWeightLevel: 1, estimatedMinutesPerUnit: 15 },
      { id: 'be-vacuum', name: 'Vacuum carpet & edge details', description: 'Deep fiber allergens removal', baseWeightLevel: 1, estimatedMinutesPerUnit: 15 },
    ],
  },
  living: {
    name: 'Living Areas',
    icon: 'Sparkles',
    tasks: [
      { id: 'l-mop', name: 'Steam-mop hardwood surfaces', description: 'Sanitize floor and corner boards', baseWeightLevel: 1, estimatedMinutesPerUnit: 15 },
      { id: 'l-dust', name: 'Detail baseboards & trim details', description: 'Acre-by-acre microfiber details', baseWeightLevel: 2, estimatedMinutesPerUnit: 20 },
      { id: 'l-glass', name: 'Wipe down window glass tracks', description: 'Remove thumbprints & track dirt', baseWeightLevel: 3, estimatedMinutesPerUnit: 35 },
    ],
  },
};

export const AIRBNB_TURNOVER_CHECKLIST = [
  { id: 'ab-1', title: 'Hotel Corner Bed Reset', detail: 'Triple bedding layout styled tight with hospital-corners.' },
  { id: 'ab-2', title: 'Coffee Pod Restocking', detail: 'Refill standard counts, check tea choices & sugar bowls.' },
  { id: 'ab-3', title: 'Bathroom Restocking', detail: 'Arrange fresh towel architecture, soap bars & dynamic rolls.' },
  { id: 'ab-4', title: 'Folded Toilet Paper Ends', detail: 'V-shaped folding point on top of bathroom rolls.' },
  { id: 'ab-5', title: 'Kitchen Appliance Inspection', detail: 'Confirm empty microwave, clean dishwasher & run waste disposal.' },
  { id: 'ab-6', title: 'Guest-Ready Final Walkthrough', detail: 'Strict photographic verification of immaculate cleanliness.' },
];

export function calculateEstimate(
  cleaningType: 'standard' | 'deep' | 'move' | 'airbnb',
  selectedTasks: Set<string>,
  properties: PropertyDetails
): EstimateResult {
  const cfg = BUSINESS_CONFIG;
  const selectedTypeConfig = CLEANING_TYPES.find(t => t.id === cleaningType) || CLEANING_TYPES[0];

  let baseMinutes = (properties.sqFt / 1000) * cfg.sqFtMinutesPer1000;
  baseMinutes += properties.bedroomsCount * cfg.minutesPerBedroom;
  baseMinutes += properties.bathroomsCount * cfg.minutesPerBathroom;

  let tasksTimeAddition = 0;
  Object.values(ROOMS_MAP).forEach(room => {
    room.tasks.forEach(task => {
      if (selectedTasks.has(task.id)) {
        tasksTimeAddition += task.estimatedMinutesPerUnit;
      }
    });
  });

  let totalTimeMinutes = (baseMinutes + tasksTimeAddition) * selectedTypeConfig.multiplier;

  if (properties.hasPets) {
    totalTimeMinutes *= cfg.petLaborMultiplier;
  }

  const ageWeight = cfg.lastCleanMultipliers[properties.lastCleanInterval];
  totalTimeMinutes *= ageWeight;

  if (totalTimeMinutes < cfg.minimumLaborMinutes) {
    totalTimeMinutes = cfg.minimumLaborMinutes;
  }

  const hours = parseFloat((totalTimeMinutes / 60).toFixed(1));

  let teamSize = 1;
  if (hours > cfg.crewThresholds.threePersonHours) {
    teamSize = 3;
  } else if (hours > cfg.crewThresholds.twoPersonHours) {
    teamSize = 2;
  }

  const gradeCfg = cfg.classGradeThresholds;
  let score: 'A' | 'B' | 'C' = 'A';
  const multiplierIndex = selectedTypeConfig.multiplier * ageWeight;
  if (multiplierIndex > gradeCfg.cMultiplierIndex || hours > gradeCfg.cHours) {
    score = 'C';
  } else if (multiplierIndex > gradeCfg.bMultiplierIndex || hours > gradeCfg.bHours) {
    score = 'B';
  }

  const rawPriceBase = hours * cfg.hourlyRate;
  let priceRangeMin = Math.round(rawPriceBase * cfg.priceRangeSpread.low);
  let priceRangeMax = Math.round(rawPriceBase * cfg.priceRangeSpread.high);

  if (priceRangeMin < cfg.minimumPrice.min) {
    priceRangeMin = cfg.minimumPrice.min;
    priceRangeMax = cfg.minimumPrice.max;
  }

  const discountedMin = Math.max(cfg.minimumPrice.min, priceRangeMin - cfg.discountAmount);
  const discountedMax = Math.max(cfg.minimumPrice.max, priceRangeMax - cfg.discountAmount);

  const cx = cfg.complexityNumeric;
  let taskWeight = 0;
  Object.values(ROOMS_MAP).forEach(room => {
    room.tasks.forEach(task => {
      if (selectedTasks.has(task.id)) {
        taskWeight += task.baseWeightLevel * cx.taskWeightMultiplier;
      }
    });
  });

  const sizeFactor = Math.min(cx.maxSizeFactor, (properties.sqFt / cx.sizeFactorDivisor) * cx.maxSizeFactor);
  const roomFactor = properties.bedroomsCount * cx.bedroomFactor + properties.bathroomsCount * cx.bathroomFactor;
  const typeFactor = selectedTypeConfig.multiplier * cx.typeFactorMultiplier;
  const petFactor = properties.hasPets ? cx.petFactor : 0;
  const ageFactor = (ageWeight - 1) * cx.ageFactorMultiplier;
  const hourFactor = hours * cx.hourFactorMultiplier;

  const rawComplexity = taskWeight + sizeFactor + roomFactor + typeFactor + petFactor + ageFactor + hourFactor;
  const complexityScoreNumeric = Math.min(
    cx.max,
    Math.max(cx.min, Math.round(rawComplexity * cx.scaleFactor))
  );

  return {
    hours,
    teamSize,
    complexityScore: score,
    complexityScoreNumeric,
    priceRangeMin,
    priceRangeMax,
    discountedMin,
    discountedMax,
  };
}

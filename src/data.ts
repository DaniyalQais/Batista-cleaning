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
  // Find base configuration rates
  const selectedTypeConfig = CLEANING_TYPES.find(t => t.id === cleaningType) || CLEANING_TYPES[0];
  
  // Base time based on square footage
  // 1000 sq ft takes roughly 120 minutes of standard cleaning
  let baseMinutes = (properties.sqFt / 1000) * 120;
  
  // Room counts base multipliers
  baseMinutes += properties.bedroomsCount * 25;
  baseMinutes += properties.bathroomsCount * 45;

  // Add selected task times
  let tasksTimeAddition = 0;
  Object.values(ROOMS_MAP).forEach(room => {
    room.tasks.forEach(task => {
      if (selectedTasks.has(task.id)) {
        tasksTimeAddition += task.estimatedMinutesPerUnit;
      }
    });
  });
  
  // Combine & apply multiplier based on type (deep/move cleaning requires extra detailing etc.)
  let totalTimeMinutes = (baseMinutes + tasksTimeAddition) * selectedTypeConfig.multiplier;
  
  // Add time for pets
  if (properties.hasPets) {
    totalTimeMinutes *= 1.15; // +15% for pet dander/fur detailing
  }

  // Last cleaning multiplier
  let ageWeight = 1.0;
  switch (properties.lastCleanInterval) {
    case 'less-than-1': ageWeight = 0.95; break;
    case '1-3-months': ageWeight = 1.05; break;
    case '3-6-months': ageWeight = 1.25; break;
    case '6-plus': ageWeight = 1.4; break;
  }
  totalTimeMinutes *= ageWeight;

  // Clip minimum & maximum times
  if (totalTimeMinutes < 90) totalTimeMinutes = 90; // At least 1.5 hrs
  
  const hours = parseFloat((totalTimeMinutes / 60).toFixed(1));

  // Determine ideal team size to finish within 2 - 4 hours
  let teamSize = 1;
  if (hours > 7.5) {
    teamSize = 3;
  } else if (hours > 3.5) {
    teamSize = 2;
  }

  // Calculate Complexity Score
  let score: 'A' | 'B' | 'C' = 'A'; // A is simple, B is moderate, C is heavy-duty
  const multiplierIndex = selectedTypeConfig.multiplier * ageWeight;
  if (multiplierIndex > 1.8 || hours > 7.0) {
    score = 'C';
  } else if (multiplierIndex > 1.25 || hours > 4.0) {
    score = 'B';
  }

  // Estimate price ranges dynamically
  // Average hourly rate ranges between $45 - $65 per person-hour depending on complexity
  const ratePerHour = 55;
  const rawPriceBase = hours * ratePerHour;
  
  // Apply a dynamic range
  let priceRangeMin = Math.round(rawPriceBase * 0.88);
  let priceRangeMax = Math.round(rawPriceBase * 1.12);

  // Set minimum rate floor
  if (priceRangeMin < 110) {
    priceRangeMin = 110;
    priceRangeMax = 160;
  }

  const discountedMin = Math.max(110, priceRangeMin - 50);
  const discountedMax = Math.max(160, priceRangeMax - 50);

  // Dynamic complexity score (0–100) from labor, tasks, and property factors
  let taskWeight = 0;
  Object.values(ROOMS_MAP).forEach(room => {
    room.tasks.forEach(task => {
      if (selectedTasks.has(task.id)) {
        taskWeight += task.baseWeightLevel * 4;
      }
    });
  });

  const sizeFactor = Math.min(30, (properties.sqFt / 5000) * 30);
  const roomFactor = properties.bedroomsCount * 3 + properties.bathroomsCount * 5;
  const typeFactor = selectedTypeConfig.multiplier * 12;
  const petFactor = properties.hasPets ? 8 : 0;
  const ageFactor = (ageWeight - 1) * 25;
  const hourFactor = hours * 6;

  const rawComplexity = taskWeight + sizeFactor + roomFactor + typeFactor + petFactor + ageFactor + hourFactor;
  const complexityScoreNumeric = Math.min(100, Math.max(15, Math.round(rawComplexity * 0.55)));

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

export const BUSINESS_CONFIG = {
  hourlyRate: 55,
  discountAmount: 50,
  minimumPrice: { min: 110, max: 160 },
  minimumLaborMinutes: 90,

  priceRangeSpread: { low: 0.88, high: 1.12 },

  sqFtMinutesPer1000: 120,
  minutesPerBedroom: 25,
  minutesPerBathroom: 45,
  petLaborMultiplier: 1.15,

  lastCleanMultipliers: {
    'less-than-1': 0.95,
    '1-3-months': 1.05,
    '3-6-months': 1.25,
    '6-plus': 1.4,
  } as const,

  crewThresholds: {
    twoPersonHours: 3.5,
    threePersonHours: 7.5,
  },

  classGradeThresholds: {
    cMultiplierIndex: 1.8,
    cHours: 7.0,
    bMultiplierIndex: 1.25,
    bHours: 4.0,
  },

  complexityNumeric: {
    min: 15,
    max: 100,
    scaleFactor: 0.55,
    taskWeightMultiplier: 4,
    maxSizeFactor: 30,
    sizeFactorDivisor: 5000,
    bedroomFactor: 3,
    bathroomFactor: 5,
    typeFactorMultiplier: 12,
    petFactor: 8,
    ageFactorMultiplier: 25,
    hourFactorMultiplier: 6,
  },

  complexityLabels: {
    low: 25,
    moderate: 50,
    high: 75,
  },

  scopeConfidence: {
    baseWithDefaults: 72,
    perTask: 2,
    maxTasksBonus: 12,
    step2Bonus: 8,
    completeScopeBonus: 6,
  },

  responseSlaHours: 24,
} as const;

export type ComplexityLabel = 'Low' | 'Moderate' | 'High' | 'Very High';
export type ServicePriority = 'Standard' | 'Elevated' | 'Priority' | 'Intensive';

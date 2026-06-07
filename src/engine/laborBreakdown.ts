import { BUSINESS_CONFIG } from '../config/business';
import { CLEANING_TYPES, ROOMS_MAP } from '../data';
import { CleaningType, PropertyDetails, RoomType } from '../types';

export interface LaborBreakdown {
  baseCleaningHours: number;
  kitchenScopeHours: number;
  bathroomScopeHours: number;
  bedroomScopeHours: number;
  livingScopeHours: number;
  adjustmentHours: number;
  totalHours: number;
}

function getAgeWeight(lastCleanInterval: PropertyDetails['lastCleanInterval']) {
  return BUSINESS_CONFIG.lastCleanMultipliers[lastCleanInterval];
}

function scopeMinutesForRoom(roomKey: RoomType, selectedTasks: Set<string>) {
  return ROOMS_MAP[roomKey].tasks.reduce(
    (sum, task) => sum + (selectedTasks.has(task.id) ? task.estimatedMinutesPerUnit : 0),
    0
  );
}

function applyPipeline(minutes: number, typeMultiplier: number, petMult: number, ageMult: number) {
  return (minutes * typeMultiplier * petMult * ageMult) / 60;
}

export function calculateLaborBreakdown(
  cleaningType: CleaningType,
  selectedTasks: Set<string>,
  properties: PropertyDetails,
  totalHoursFromEstimate: number
): LaborBreakdown {
  const typeConfig = CLEANING_TYPES.find(t => t.id === cleaningType) || CLEANING_TYPES[0];
  const typeMultiplier = typeConfig.multiplier;
  const petMult = properties.hasPets ? BUSINESS_CONFIG.petLaborMultiplier : 1;
  const ageMult = getAgeWeight(properties.lastCleanInterval);

  const baseMinutes =
    (properties.sqFt / 1000) * BUSINESS_CONFIG.sqFtMinutesPer1000 +
    properties.bedroomsCount * BUSINESS_CONFIG.minutesPerBedroom +
    properties.bathroomsCount * BUSINESS_CONFIG.minutesPerBathroom;

  const kitchenMin = scopeMinutesForRoom('kitchen', selectedTasks);
  const bathroomMin = scopeMinutesForRoom('bathrooms', selectedTasks);
  const bedroomMin = scopeMinutesForRoom('bedrooms', selectedTasks);
  const livingMin = scopeMinutesForRoom('living', selectedTasks);

  const rawSubtotalMin = baseMinutes + kitchenMin + bathroomMin + bedroomMin + livingMin;
  const pipedSubtotalHours = applyPipeline(rawSubtotalMin, typeMultiplier, petMult, ageMult);

  const baseCleaningHours = applyPipeline(baseMinutes, typeMultiplier, petMult, ageMult);
  const kitchenScopeHours = applyPipeline(kitchenMin, typeMultiplier, petMult, ageMult);
  const bathroomScopeHours = applyPipeline(bathroomMin, typeMultiplier, petMult, ageMult);
  const bedroomScopeHours = applyPipeline(bedroomMin, typeMultiplier, petMult, ageMult);
  const livingScopeHours = applyPipeline(livingMin, typeMultiplier, petMult, ageMult);

  const minimumHours = BUSINESS_CONFIG.minimumLaborMinutes / 60;
  const adjustmentHours =
    totalHoursFromEstimate > pipedSubtotalHours
      ? parseFloat((totalHoursFromEstimate - pipedSubtotalHours).toFixed(1))
      : totalHoursFromEstimate < pipedSubtotalHours
        ? parseFloat((totalHoursFromEstimate - pipedSubtotalHours).toFixed(1))
        : 0;

  return {
    baseCleaningHours: parseFloat(baseCleaningHours.toFixed(1)),
    kitchenScopeHours: parseFloat(kitchenScopeHours.toFixed(1)),
    bathroomScopeHours: parseFloat(bathroomScopeHours.toFixed(1)),
    bedroomScopeHours: parseFloat(bedroomScopeHours.toFixed(1)),
    livingScopeHours: parseFloat(livingScopeHours.toFixed(1)),
    adjustmentHours,
    totalHours: totalHoursFromEstimate >= minimumHours ? totalHoursFromEstimate : minimumHours,
  };
}

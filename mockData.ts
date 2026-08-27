// mockData.ts — Faculty/Staff coupon mock data
// Replace with real API calls when backend is ready.

export type SubsidyTier = 'full' | 'half' | 'free';

export interface FacultyUser {
  name: string;
  designation: string;
  employeeId: string;
  department: string;
  subsidyTier: SubsidyTier;
  balance: number;
  /** Meals already purchased today, by meal id */
  purchasedMealsToday: string[];
}

export interface MealDefinition {
  id: string;
  label: string;
  /** 24h format hours */
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  basePrice: number; // in INR
}

export const MEALS: MealDefinition[] = [
  { id: 'breakfast', label: 'Breakfast', startHour: 7, startMinute: 0, endHour: 9, endMinute: 0, basePrice: 40 },
  { id: 'lunch', label: 'Lunch', startHour: 11, startMinute: 0, endHour: 14, endMinute: 0, basePrice: 80 },
  { id: 'tea', label: 'Tea', startHour: 15, startMinute: 0, endHour: 17, endMinute: 0, basePrice: 20 },
  { id: 'dinner', label: 'Dinner', startHour: 18, startMinute: 0, endHour: 24, endMinute: 0, basePrice: 80 },
];

/** Compute effective price based on subsidy tier */
export function effectivePrice(basePrice: number, tier: SubsidyTier): number {
  if (tier === 'free') return 0;
  if (tier === 'half') return Math.round(basePrice * 0.5);
  if (tier === 'full') return basePrice;
  return basePrice;
}

/** Check if a meal is currently within its serving window */
export function isMealAvailable(meal: MealDefinition, now: Date = new Date()): boolean {
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMinutes = h * 60 + m;
  const start = meal.startHour * 60 + meal.startMinute;
  const end = meal.endHour * 60 + meal.endMinute;
  return totalMinutes >= start && totalMinutes < end;
}

/** Mock faculty user — swap with API response */
export const MOCK_FACULTY_USER: FacultyUser = {
  name: 'Dr. Rajesh Kumar',
  designation: 'Professor',
  employeeId: 'EMP-8042',
  department: 'Computer Science',
  subsidyTier: 'full',
  balance: 450,
  purchasedMealsToday: [],
};

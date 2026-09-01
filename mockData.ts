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

/**
 * Whose pass this is. Faculty passes carry the cardholder; spot coupons are
 * anonymous walk-ins and pass `null`.
 */
export interface PassHolder {
  name: string;
  department: string;
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
  { id: 'breakfast', label: 'Breakfast', startHour: 7, startMinute: 0, endHour: 24, endMinute: 0, basePrice: 40 },
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

/** Quantity bounds for a single spot-coupon purchase */
export const SPOT_MIN_QUANTITY = 1;
export const SPOT_MAX_QUANTITY = 10;

/** Spot coupons are walk-in purchases — no card, no subsidy, always full price. */
export function spotCouponTotal(meal: MealDefinition, quantity: number): number {
  return meal.basePrice * quantity;
}

/** Formats an amount as INR, or "Free" when nothing is owed. */
export function formatINR(amount: number): string {
  return amount === 0 ? 'Free' : `₹${amount.toFixed(2)}`;
}

/** Renders a meal's serving window as e.g. "7 AM - 9 AM" */
export function formatMealWindow(meal: MealDefinition): string {
  const label = (h: number, m: number) => {
    const suffix = h >= 12 && h < 24 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 || h === 24 ? 12 : h;
    const displayM = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
    return `${displayH}${displayM} ${suffix}`;
  };
  return `${label(meal.startHour, meal.startMinute)} - ${label(meal.endHour, meal.endMinute)}`;
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

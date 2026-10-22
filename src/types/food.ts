export interface FoodItem {
  name: string;
  estimatedWeightGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface DietaryAnalysis {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  itemsDetected: FoodItem[];
  allergens: string[];
  dietaryFlags: string[]; 
  healthInsight: string;  /* A short, chill wellness note */
}
export interface Meal{
  id?: number;
  name: string;
  price: number;
  ingredients: string;
  imageUrl?: string;
  restaurantId?: number;
}
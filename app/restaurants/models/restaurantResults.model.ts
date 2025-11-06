import { Restaurant } from "./restaurant.model";

export interface RestaurantResults {
  data: Restaurant[];
  totalCount: number;
}
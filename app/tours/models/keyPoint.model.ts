export interface KeyPoint {
  id?: number;
  name: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  tourId?: number;
}
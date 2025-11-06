export interface Tour {
  id?: number;
  name: string;
  description: string;
  maxGuests: number;
  dateTime: string; 
  guideId?: number;
}

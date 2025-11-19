import { KeyPoint } from "./keyPoint.model";

export interface Tour {
  id?: number;
  name: string;
  description: string;
  maxGuests: number;
  dateTime: string; 
  guideId?: number;
  status?: string;
  keyPoints?: KeyPoint[];
}

import { KeyPoint } from "../models/keyPoint.model";

export class KeyPointService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'http://localhost:5105/api/tours';
  }

  getByTourId(tourId: string): Promise<KeyPoint[]> {
    return fetch(`${this.apiUrl}/${tourId}/key-points`)
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorMessage => {
            throw { status: response.status, message: errorMessage }
          })
        }
        return response.json()
      })
      .then((keyPoints: KeyPoint[]) => {
        return keyPoints;
      })
      .catch(error => {
        console.error('Error:', error.status)
        throw error
      });
  }

  add(tourId: string, keyPoint: KeyPoint): Promise<KeyPoint> {
    return fetch(`${this.apiUrl}/${tourId}/key-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keyPoint)
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorMessage => {
            throw { status: response.status, message: errorMessage }
          })
        }
        return response.json()
      })
      .then((keyPoint: KeyPoint) => {
        return keyPoint
      })
      .catch(error => {
        console.error('Error:', error.status)
        throw error
      })
  }

  delete(tourId: string, keyPointId: string): Promise<void> {
    return fetch(`${this.apiUrl}/${tourId}/key-points/${keyPointId}`, { 
      method: 'DELETE' 
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorMessage => {
            throw { status: response.status, message: errorMessage }
          })
        }
      })
      .catch(error => {
        console.error('Error:', error.status)
        throw error
      });
  }
}
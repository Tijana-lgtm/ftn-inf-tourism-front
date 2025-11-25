import { Tour } from "../models/tour.model";
import { TourResult } from "../models/tourResult.model";

export class TourService {

  private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:5105/api/tours';
    }

    getAll(
    orderBy: string = "Name", 
    orderDirection: string = "ASC",
    page: number = 1,
    pageSize: number = 10
): Promise<TourResult> {  
    const queryParams = new URLSearchParams({
        orderBy: orderBy,
        orderDirection: orderDirection,
        page: page.toString(),
        pageSize: pageSize.toString()
    });

    const url = `${this.apiUrl}?${queryParams.toString()}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorMessage => {
                    throw { status: response.status, message: errorMessage }
                })
            }
            return response.json()
        })
        .then((results: TourResult) => {
            return results;  
        })
        .catch(error => {
            console.error('Error:', error.status)
            throw error
        });
}

    add(formData: Tour): Promise<Tour> {
        return fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage }
                    })
                }
                return response.json()
            })
            .then((tour: Tour) => {
                return tour
            })
            .catch(error => {
                console.error('Error:', error.status)
                throw error
            })
    }

    getById (id: string): Promise <Tour> {
    return fetch (`${this.apiUrl}/${id}`)
    .then (response => {
      if (!response.ok) {
        return response.text().then (errorMessage => {
          throw {status: response.status, message: errorMessage}
        })
      }
      return response.json()
      })
            .then((tour: Tour) => {
                return tour
            })
            .catch(error => {
                console.error('Error:', error.status)
                throw error
            })
    }

    update(id: string, formData: Tour): Promise <Tour> {
      return fetch (`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      })
    .then (response => {
      if (!response.ok) {
        return response.text().then (errorMessage => {
          throw {status: response.status, message: errorMessage}
        })
      }
      return response.json()
      })
            .then((tour: Tour) => {
                return tour
            })
            .catch(error => {
                console.error('Error:', error.status)
                throw error
            })
    }

    deleteTour(tourId: string): Promise<void> {
        return fetch(`${this.apiUrl}/${tourId}`, { method: 'DELETE' })
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
    publish(tourId: string): Promise<Tour> {
    return fetch(`${this.apiUrl}/${tourId}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(errorMessage => {
                throw { status: response.status, message: errorMessage }
            })
        }
        return response.json()
    })
    .then((tour: Tour) => {
        return tour
    })
    .catch(error => {
        console.error('Error:', error.status)
        throw error
    })
    }
}
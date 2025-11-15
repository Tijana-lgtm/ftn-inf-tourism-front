import { Restaurant } from "../models/restaurant.model";
import { RestaurantResults } from "../models/restaurantResults.model";

export class RestaurantService {

  private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:5105/api/restaurants';
    }

    getAll(): Promise<Restaurant[]> {
        return fetch(this.apiUrl)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage }
                    })
                }
                return response.json()
            })
            .then((results: RestaurantResults) => {
                return results.data;
            })
            .catch(error => {
                console.error('Error:', error.status)
                throw error
            });
    }

    add(formData: Restaurant): Promise<Restaurant> {
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
            .then((restaurant: Restaurant) => {
                return restaurant
            })
            .catch(error => {
                console.error('Error:', error.status)
                throw error
            })
    }

    getById(id: string): Promise<Restaurant>{
    return fetch(`${this.apiUrl}/${id}`)
      .then(response =>{
        if(!response.ok){
          return response.text().then(errorMessage =>{
            throw{status: response.status, message: errorMessage}
          })
        }
        return response.json();
      })
      .then((user: Restaurant) =>{
        return user;
      })
      .catch(error =>{
        console.error(error.status)
        throw error
      });
    
    }

    delete(userId: string): Promise<void>{
    return fetch(`${this.apiUrl}/${userId}`, {method: 'DELETE'})
      .then(response =>{
        if(!response.ok){
          return response.text().then(errorMessage =>{
            throw{status: response.status, message: errorMessage}
          })
        }
      })
      .catch(error =>{
        console.error(error.status)
        throw error
      });
    }

    update(id: string, formData: Restaurant): Promise<Restaurant>{
    return fetch(`${this.apiUrl}/${id}`,{
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(response =>{
        if(!response.ok){
          return response.text().then(errorMessage =>{
            throw{status: response.status, message: errorMessage}
          })
        }
        return response.json()
      })
      .then((user: Restaurant) =>{
        return user;
      })
      .catch(error =>{
        console.error(error.status)
        throw error
      });
    } 
}
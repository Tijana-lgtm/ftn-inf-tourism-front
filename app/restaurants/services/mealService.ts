import {Meal} from "../models/meal";
import { Restaurant } from "../models/restaurant.model";

export class MealService{
  private apiUrl: string;

  constructor(){
    this.apiUrl = 'http://localhost:5105/api/restaurants';
  }

  getAll(restaurantId: string): Promise<Meal[]> {
    return fetch(`http://localhost:5105/api/restaurants/${restaurantId}`)
              .then(response => {
                  if (!response.ok) {
                      return response.text().then(errorMessage => {
                          throw { status: response.status, message: errorMessage }
                      })
                  }
                  return response.json()
              })
              .then((restaurant: Restaurant) => {
            // Vrati samo meals iz restorana
            return restaurant.meals || [];
              })
              .catch(error => {
                  console.error('Error:', error.status)
                  throw error
              });
      }
      
  add(restaurantId: string, formData: Meal): Promise<Meal> {
          return fetch(`${this.apiUrl}/${restaurantId}/meals`, {
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
              .then((meal: Meal) => {
                  return meal
              })
              .catch(error => {
                  console.error('Error:', error.status)
                  throw error
              })
      }

  delete(restaurantId: string, mealId: string): Promise<void>{
    return fetch(`${this.apiUrl}/${restaurantId}/meals/${mealId}`, {method: 'DELETE'})
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
      
}
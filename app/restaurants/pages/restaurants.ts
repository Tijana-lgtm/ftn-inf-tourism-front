import { Restaurant } from "../models/restaurant.model";
import { RestaurantService } from "../services/restaurantService";
import { Meal } from "../models/meal";
import { MealService } from "../services/mealService";


const restaurantService = new RestaurantService();
const mealService = new MealService();

let currentRestaurantId: string | null = null;
let meals: Meal[] = [];

function renderData(): void {
    const button = document.querySelector("#addRestaurant")
    if (button) {
        button.addEventListener("click", async(event) => {
            event.preventDefault();
            submitData()})
    }
    const addMealBtn = document.querySelector("#addMealBtn");
    if (addMealBtn) {
        addMealBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            toggleMealForm(true);
        });
    }

    const saveMealBtn = document.querySelector("#saveMeal");
    if (saveMealBtn) {
        saveMealBtn.addEventListener("click", (event) => {
            event.preventDefault();
            submitMeal();
        });
    }

    const cancelMealBtn = document.querySelector("#cancelMeal");
    if (cancelMealBtn) {
        cancelMealBtn.addEventListener("click", () => {
            toggleMealForm(false);
        });
    }

    const publishBtn = document.querySelector("#publishRestaurant");
    if (publishBtn) {
        publishBtn.addEventListener("click", () => {
            publishRestaurant();
        });
    }

  restaurantService.getAll()
      .then(restaurants => {
        console.log(restaurants);

        const table = document.querySelector('#restaurantsTableBody');

            if (!table) {
                console.error('Table body not found');
                return;
            }

            for (let i = 0; i < restaurants.length; i++) {

                const newRow = document.createElement('tr');

                const cell2 = document.createElement('td');
                cell2.textContent = restaurants[i].name;
                newRow.appendChild(cell2);

                const cell3 = document.createElement('td');
                cell3.textContent = restaurants[i].description;
                newRow.appendChild(cell3);

                const cell4 = document.createElement('td');
                cell4.textContent = restaurants[i].capacity.toString();
                newRow.appendChild(cell4);

                const cell5 = document.createElement('td');
                cell5.textContent = restaurants[i].latitude.toString();
                newRow.appendChild(cell5);

                const cell6 = document.createElement('td');
                cell6.textContent = restaurants[i].longitude.toString();
                newRow.appendChild(cell6);

                const cell7 = document.createElement('td');
                cell7.textContent = restaurants[i].status;
                newRow.appendChild(cell7);

                const cell8 = document.createElement('td');
                const restImage = document.createElement('img');
                restImage.src = restaurants[i].imageUrl
                cell8.appendChild(restImage)
                newRow.appendChild(cell8);

                const cell9 = document.createElement('td');               
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                const restaurantId = restaurants[i].id;
                editBtn.onclick = function(){
                    
                    window.location.href = `restaurants.html?id=${restaurantId}`;
                };

                cell9.appendChild(editBtn);
                newRow.appendChild(cell9);

                const cell10 = document.createElement('td');               
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Remove';
                deleteBtn.onclick = function(){
                    restaurantService.delete(restaurantId.toString())
                        .then(() => {
                            window.location.reload();
                         })
                        .catch(error =>{
                            console.error(error.status, error.text);
                        });
                    };
                cell10.appendChild(deleteBtn);
                newRow.appendChild(cell10);

                table.appendChild(newRow);
            }

      }).catch(error => {
            console.error(error.status, error.message);
        });
}

function submitData(): void {
    const name = (document.querySelector('#name') as HTMLInputElement).value
    const description = (document.querySelector('#description') as HTMLInputElement).value
    const capacity = (document.querySelector('#capacity') as HTMLInputElement).value
    const latitude = (document.querySelector('#latitude') as HTMLInputElement).value
    const longitude = (document.querySelector('#longitude') as HTMLInputElement).value
    const picture = (document.querySelector('#picture') as HTMLInputElement).value

    if (!name || !description || !capacity || !latitude || !longitude || !picture) {
        alert("All fields are required!");
        return
    }

    const formData: Restaurant = { name: name, description : description, capacity : Number(capacity), latitude : Number(latitude),
          longitude : Number(longitude), status : 'prepairing', imageUrl : picture, ownerId: Number(localStorage.getItem('userId'))}

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    if (id) {
        getRestaurantData(id);
        restaurantService.update(id, formData)
            .then(() => {
                alert('Successfully updated the restaurant');
                window.location.href = '../pages/restaurants.html';
            })
            .catch(error => {
                console.error(error.status, error.text);
            });
        }
    else{
        restaurantService.add(formData)
            .then(() => {
                alert('Successfully added a new restourant');
            })
            .catch(error => {
                console.error(error.status, error.text);
            });
        }
}

function initializeForm(): void{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    if(id){
        currentRestaurantId = id;

        const mealSection = document.querySelector('#mealsSection');
        if(mealSection){
            (mealSection as HTMLElement).style.display = 'block';
        }

        restaurantService.getById(id)
        .then(restaurant =>{
            (document.querySelector('#name') as HTMLInputElement).value = restaurant.name;
            (document.querySelector('#description') as HTMLInputElement).value = restaurant.description;
            (document.querySelector('#capacity') as HTMLInputElement).value = restaurant.capacity.toString();
            (document.querySelector('#latitude') as HTMLInputElement).value = restaurant.latitude.toString();
            (document.querySelector('#longitude') as HTMLInputElement).value = restaurant.longitude.toString();
            (document.querySelector('#picture') as HTMLInputElement).value = restaurant.imageUrl;

            loadMeals(id);
        })
        .catch(error =>{
            console.error(error.status, error.text);
        });
    }
    else{
        const mealsSection = document.querySelector('#mealsSection');
        if (mealsSection) {
            (mealsSection as HTMLElement).style.display = 'none';
        }
    }
}

function loadMeals(restaurantId: string): void {
    mealService.getAll(restaurantId)
        .then(loadedMeals => {
            meals = loadedMeals;
            renderMeals();
            updatePublishButtonState();
        })
        .catch(error => {
            console.error('Error loading meals:', error);
        });
}

function renderMeals(): void {
    const mealsContainer = document.querySelector('#mealsContainer');
    if (!mealsContainer) return;

    mealsContainer.innerHTML = '';

    if (meals.length === 0) {
        mealsContainer.innerHTML = '5 meals are required for opening a restaurant.';
        return;
    }

    meals.forEach(meal => {
        const mealCard = createMealCard(meal);
        mealsContainer.appendChild(mealCard);
    });
}

function createMealCard(meal: Meal): HTMLElement {
    const card = document.createElement('div');
    card.className = 'meal-card';

    const info = document.createElement('div');
    info.className = 'meal-info';

    if (meal.imageUrl) {
        const img = document.createElement('img');
        img.src = meal.imageUrl;
        img.alt = meal.name;
        img.className = 'meal-image';
        info.appendChild(img);
    }

    const text = document.createElement('div');
    const nameEl = document.createElement('h4');
    nameEl.textContent = meal.name;
    const priceEl = document.createElement('p');
    priceEl.innerHTML = `<strong>Price:</strong> ${meal.price} RSD`;
    const ingredientsEl = document.createElement('p');
    ingredientsEl.innerHTML = `<strong>Ingredients:</strong> ${meal.ingredients}`;

    text.appendChild(nameEl);
    text.appendChild(priceEl);
    text.appendChild(ingredientsEl);

    info.appendChild(text);
    card.appendChild(info);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-meal-btn';
    deleteBtn.dataset.mealId = meal.id?.toString() || '';
    deleteBtn.textContent = 'Delete';
    card.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', () => {
        if (currentRestaurantId && meal.id) {
            deleteMeal(currentRestaurantId, meal.id.toString());
        }
    });

    return card;
}

function toggleMealForm(show: boolean): void {
    const mealForm = document.querySelector('#mealForm');
    if (mealForm) {
        (mealForm as HTMLElement).style.display = show ? 'block' : 'none';
        
        if (!show) {
            (document.querySelector('#mealName') as HTMLInputElement).value = '';
            (document.querySelector('#mealPrice') as HTMLInputElement).value = '';
            (document.querySelector('#mealIngredients') as HTMLTextAreaElement).value = '';
            (document.querySelector('#mealImage') as HTMLInputElement).value = '';
            
            const errorMsg = document.querySelector('#mealErrorMessage');
            if (errorMsg) {
                errorMsg.textContent = '';
                (errorMsg as HTMLElement).style.display = 'none';
            }
        }
    }
}

function submitMeal(): void {
    if (!currentRestaurantId) {
        alert('Restaurant ID not found');
        return;
    }

    const name = (document.querySelector('#mealName') as HTMLInputElement).value;
    const price = (document.querySelector('#mealPrice') as HTMLInputElement).value;
    const ingredients = (document.querySelector('#mealIngredients') as HTMLTextAreaElement).value;
    const imageUrl = (document.querySelector('#mealImage') as HTMLInputElement).value;

    const errorMsg = document.querySelector('#mealErrorMessage') as HTMLElement;

    if (!name || !price || !ingredients) {
        errorMsg.textContent = 'Name, price and ingredients are required.';
        errorMsg.style.display = 'block';
        return;
    }

    const mealData: Meal = {
        name: name,
        price: Number(price),
        ingredients: ingredients,
        imageUrl: imageUrl || undefined
    };

    mealService.add(currentRestaurantId, mealData)
        .then(newMeal => {
            meals.push(newMeal);
            renderMeals();
            toggleMealForm(false);
            updatePublishButtonState();
            alert('Meal has been added sucesfully.');
        })
        .catch(error => {
            errorMsg.textContent = 'Error while adding meal.';
            errorMsg.style.display = 'block';
            console.error('Error adding meal:', error);
        });
}

function deleteMeal(restaurantId: string, mealId: string): void {
    if (!confirm('You want to delete this meal??')) {
        return;
    }

    mealService.delete(restaurantId, mealId)
        .then(() => {
            meals = meals.filter(m => m.id?.toString() !== mealId);
            renderMeals();
            updatePublishButtonState();
            alert('Meal is deleted sucessfuly!');
        })
        .catch(error => {
            alert('Errow while deleting meal.');
            console.error('Error deleting meal:', error);
        });
}

function updatePublishButtonState(): void {
    const publishBtn = document.querySelector('#publishRestaurant') as HTMLButtonElement;
    const statusMessage = document.querySelector('#publishStatus') as HTMLElement;
    const picture = (document.querySelector('#picture') as HTMLInputElement).value;

    if (!publishBtn || !statusMessage) return;

    const hasFiveMeals = meals.length >= 5;
    const hasImage = picture && picture !== '';

    if (hasFiveMeals && hasImage) {
        publishBtn.disabled = false;
        statusMessage.textContent = 'Restaurant is ready for opening';
        statusMessage.style.color = 'green';
    } else {
        publishBtn.disabled = true;
        const missing = [];
        if (!hasFiveMeals) missing.push(`${meals.length}/5 dishes`);
        if (!hasImage) missing.push('picturea');
        statusMessage.textContent = `Missing: ${missing.join(', ')}`;
        statusMessage.style.color = 'red';
    }
}

function publishRestaurant(): void {
    if (!currentRestaurantId) return;

    const name = (document.querySelector('#name') as HTMLInputElement).value;
    const description = (document.querySelector('#description') as HTMLInputElement).value;
    const capacity = (document.querySelector('#capacity') as HTMLInputElement).value;
    const latitude = (document.querySelector('#latitude') as HTMLInputElement).value;
    const longitude = (document.querySelector('#longitude') as HTMLInputElement).value;
    const picture = (document.querySelector('#picture') as HTMLInputElement).value;

    const formData: Restaurant = {
        name: name,
        description: description,
        capacity: Number(capacity),
        latitude: Number(latitude),
        longitude: Number(longitude),
        status: 'otvoren',
        imageUrl: picture,
        ownerId: Number(localStorage.getItem('userId'))
    };

    restaurantService.update(currentRestaurantId, formData)
        .then(() => {
            alert('Restaurant is succesfuly published!');
            window.location.href = '../pages/restaurants.html';
        })
        .catch(error => {
            alert('Error while publishing restaurant.');
            console.error(error);
        });
}

function getRestaurantData(id: string): void{
    restaurantService.getById(id)
        .then(restaurant => {
            (document.querySelector('#name') as HTMLInputElement).value = restaurant.name;
            (document.querySelector('#description') as HTMLInputElement).value = restaurant.description;
            (document.querySelector('#capacity') as HTMLInputElement).value = restaurant.capacity.toString();
            (document.querySelector('#latitude') as HTMLInputElement).value = restaurant.latitude.toString();
            (document.querySelector('#longitude') as HTMLInputElement).value = restaurant.longitude.toString();
            (document.querySelector('#picture') as HTMLInputElement).value = restaurant.imageUrl;
        })
        .catch(error =>{
            console.error ("Error", error)
        })
}

document.addEventListener("DOMContentLoaded", () => {
    renderData();
    initializeForm();

    const pictureInput = document.querySelector('#picture');
    if (pictureInput) {
        pictureInput.addEventListener('input', updatePublishButtonState);
    }
});
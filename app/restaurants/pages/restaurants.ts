import { Restaurant } from "../models/restaurant.model";
import { RestaurantService } from "../services/restaurantService";

const restaurantService = new RestaurantService();

function renderData(): void {
    const button = document.querySelector("#addRestaurant")
    if (button) {
        button.addEventListener("click", async(event) => {
            event.preventDefault();
            submitData()})
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
                window.location.href = `restaurants.html?id=${restaurantId}`
                }
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
          longitude : Number(longitude), status : 'u pripremi', imageUrl : picture, ownerId: Number(localStorage.getItem('userId'))}

        const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    if (id) {
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
        restaurantService.getById(id)
        .then(restaurant =>{
            (document.querySelector('#name') as HTMLInputElement).value = restaurant.name;
            (document.querySelector('#description') as HTMLInputElement).value = restaurant.description;
            (document.querySelector('#capacity') as HTMLInputElement).value = restaurant.capacity.toString();
            (document.querySelector('#latitude') as HTMLInputElement).value = restaurant.latitude.toString();
            (document.querySelector('#longitude') as HTMLInputElement).value = restaurant.longitude.toString();
            (document.querySelector('#picture') as HTMLInputElement).value = restaurant.imageUrl;
        })
        .catch(error =>{
            console.error(error.status, error.text);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderData();
    initializeForm();
});

 
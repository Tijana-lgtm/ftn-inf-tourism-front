import { Tour } from "../models/tour.model";
import { TourService } from "../services/tourService";

const tourService = new TourService();

function renderData(): void {
    const button = document.querySelector("#addTourBtn")
    if (button) {
        button.addEventListener("click", async(event) => {
            event.preventDefault();
            submitData()})
    }

  tourService.getAll()
      .then(tours => {
        console.log(tours);

        const table = document.querySelector('#toursTBody');

            if (!table) {
                console.error('Table body not found');
                return;
            }

            for (let i = 0; i < tours.length; i++) {

                const newRow = document.createElement('tr');

                const cell1 = document.createElement('td');
                cell1.textContent = tours[i].name;
                newRow.appendChild(cell1);

                const cell2 = document.createElement('td');
                cell2.textContent = tours[i].description;
                newRow.appendChild(cell2);

                const cell3 = document.createElement('td');
                cell3.textContent = tours[i].maxGuests.toString();
                newRow.appendChild(cell3);

                const cell4 = document.createElement("td");
                cell4.textContent = tours[i].dateTime;
                newRow.appendChild(cell4);

                const cell5 = document.createElement("td");
                const editButton = document.createElement ('button');
                editButton.textContent='Edit';
        
                const tourId = tours[i].id;
                editButton.onclick= function () {
                    window.location.href = `tours.html?id=${tourId}`;
                };
                cell5.appendChild(editButton);
                newRow.appendChild (cell5);

                const cell6 = document.createElement("td");
                const deleteButton = document.createElement ('button');
                deleteButton.textContent='Delete';
        
                deleteButton.onclick= function () {
                tourService.deleteTour(tourId.toString())
                        .then(() => {
                            window.location.reload();
                        })
                        .catch(error => {
                            console.error(error.status, error.text);
                        });
                };
                cell6.appendChild(deleteButton);
                newRow.appendChild (cell6);

                table.appendChild(newRow);
            }

      }).catch(error => {
            console.error(error.status, error.message);
        });
}

function submitData(): void {
    const name = (document.querySelector('#name') as HTMLInputElement).value;
    const description = (document.querySelector('#description') as HTMLInputElement).value;
    const maxGuests = (document.querySelector('#capacity') as HTMLInputElement).value;
    const dateTime = (document.querySelector('#dateTime') as HTMLInputElement).value;

    if (!name || !description || !maxGuests || !dateTime) {
        alert("All fields are required!");
        return;
    }

    const formData: Tour = { 
        name, 
        description, 
        maxGuests: Number(maxGuests), 
        dateTime,
        guideId: Number(localStorage.getItem('userId'))
    };

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    if (id) {
        tourService.update(id, formData)
            .then(() => {
                alert('Successfully updated the tour');
                window.location.href = '../pages/tours.html';
            })
            .catch(error => {
                console.error(error.status, error.text);
            });
    } else {
        tourService.add(formData)
            .then(() => {
                alert('Successfully added a new tour');
                location.reload();
            })
            .catch(error => {
                console.error(error.status, error.text);
            });
    }
}

function initializeForm(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    if (id) {
        tourService.getById(id)
            .then(tour => {  
                (document.querySelector('#name') as HTMLInputElement).value = tour.name;
                (document.querySelector('#description') as HTMLInputElement).value = tour.description;
                (document.querySelector('#capacity') as HTMLInputElement).value = tour.maxGuests.toString(); 
                (document.querySelector('#dateTime') as HTMLInputElement).value = tour.dateTime;
            }).catch(error => {
                console.error(error.status, error.text);
            });
    }
    
}  

document.addEventListener("DOMContentLoaded", () => {
    renderData();
    initializeForm();  
});


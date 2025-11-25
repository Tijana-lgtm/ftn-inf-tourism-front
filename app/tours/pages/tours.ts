import { Tour } from "../models/tour.model";
import { KeyPoint } from "../models/keyPoint.model";
import { TourService } from "../services/tourService";
import { KeyPointService } from "../services/keyPointService";

const tourService = new TourService();
const keyPointService = new KeyPointService();

let currentTourId: string | null = null;
let keyPoints: KeyPoint[] = [];

// ==================== NOVE VARIJABLE ZA TURISTE ====================
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let currentSort = "Name";
let currentOrder = "ASC";

// ==================== PROVERA ROLE ====================
function getUserRole(): string | null {
    return localStorage.getItem('role');
}

function isGuide(): boolean {
    return getUserRole() === 'vodic';
}

// ==================== TURISTICKI PRIKAZ (NOVI KOD) ====================
function showTouristView(): void {
    const guideView = document.querySelector('#guideView') as HTMLElement;
    const touristView = document.querySelector('#touristView') as HTMLElement;
    
    if (guideView) guideView.style.display = 'none';
    if (touristView) touristView.style.display = 'block';
    
    setupTouristControls();
    renderTouristCards();
}

function setupTouristControls(): void {
    const sortDropdown = document.getElementById("sortDropdown") as HTMLSelectElement;
    const orderDropdown = document.getElementById("orderDropdown") as HTMLSelectElement;
    const pageSizeDropdown = document.getElementById("pageSizeDropdown") as HTMLSelectElement;
    const prevPageBtn = document.getElementById("prevPageBtn") as HTMLButtonElement;
    const nextPageBtn = document.getElementById("nextPageBtn") as HTMLButtonElement;

    if (sortDropdown) {
        sortDropdown.addEventListener("change", () => {
            currentSort = sortDropdown.value;
            currentPage = 1;
            renderTouristCards();
        });
    }

    if (orderDropdown) {
        orderDropdown.addEventListener("change", () => {
            currentOrder = orderDropdown.value;
            currentPage = 1;
            renderTouristCards();
        });
    }

    if (pageSizeDropdown) {
        pageSizeDropdown.addEventListener("change", () => {
            pageSize = parseInt(pageSizeDropdown.value);
            currentPage = 1;
            renderTouristCards();
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTouristCards();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTouristCards();
            }
        });
    }

    const modal = document.getElementById("tourDetailsModal") as HTMLElement;
    const closeBtn = modal?.querySelector(".close") as HTMLElement;

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (modal) modal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

function renderTouristCards(): void {
    tourService.getAll(currentSort, currentOrder, currentPage, pageSize)
        .then(results => {
            const allTours = results.data;
            const publishedTours = allTours.filter(tour => tour.status === 'published');
            
            const totalCount = publishedTours.length;
            totalPages = Math.ceil(totalCount / pageSize);
            
            const container = document.querySelector('#toursCardsContainer');
            if (!container) {
                console.error('Cards container not found');
                return;
            }

            container.innerHTML = '';

            if (publishedTours.length === 0) {
                container.innerHTML = '<p>No published tours available.</p>';
                updatePaginationControls();
                return;
            }

            publishedTours.forEach(tour => {
                const card = createTourCard(tour);
                container.appendChild(card);
            });

            updatePaginationControls();
        })
        .catch(error => {
            console.error('Error loading tours:', error);
            alert('Greška pri učitavanju tura');
        });
}

function createTourCard(tour: Tour): HTMLElement {
    const card = document.createElement('div');
    card.classList.add('tour-card');

    const title = document.createElement('h3');
    title.textContent = tour.name;
    card.appendChild(title);

    const description = document.createElement('p');
    const shortDesc = tour.description.length > 250 
        ? tour.description.substring(0, 250) + '...' 
        : tour.description;
    description.textContent = shortDesc;
    description.classList.add('tour-description');
    card.appendChild(description);

    const dateTime = document.createElement('p');
    dateTime.innerHTML = `<strong>Date:</strong> ${formatDateTime(tour.dateTime)}`;
    card.appendChild(dateTime);

    const maxGuests = document.createElement('p');
    maxGuests.innerHTML = `<strong>Max Guests:</strong> ${tour.maxGuests}`;
    card.appendChild(maxGuests);

    const detailsBtn = document.createElement('button');
    detailsBtn.textContent = 'View Details';
    detailsBtn.classList.add('details-btn');
    detailsBtn.addEventListener('click', () => {
        showTourDetails(tour.id!.toString());
    });
    card.appendChild(detailsBtn);

    return card;
}

function formatDateTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('sr-RS', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function showTourDetails(tourId: string): void {
    tourService.getById(tourId)
        .then(tour => {
            const modal = document.getElementById("tourDetailsModal") as HTMLElement;
            const content = document.getElementById("tourDetailsContent") as HTMLElement;

            if (!modal || !content) return;

            content.innerHTML = '';

            const title = document.createElement('h2');
            title.textContent = tour.name;
            content.appendChild(title);

            const description = document.createElement('p');
            description.textContent = tour.description;
            description.style.marginBottom = '20px';
            content.appendChild(description);

            const dateTime = document.createElement('p');
            dateTime.innerHTML = `<strong>Date and Time:</strong> ${formatDateTime(tour.dateTime)}`;
            content.appendChild(dateTime);

            const maxGuests = document.createElement('p');
            maxGuests.innerHTML = `<strong>Maximum Guests:</strong> ${tour.maxGuests}`;
            content.appendChild(maxGuests);

            if (tour.keyPoints && tour.keyPoints.length > 0) {
                const kpTitle = document.createElement('h3');
                kpTitle.textContent = 'Key Points';
                kpTitle.style.marginTop = '30px';
                content.appendChild(kpTitle);

                tour.keyPoints.forEach(kp => {
                    const kpCard = document.createElement('div');
                    kpCard.classList.add('keypoint-detail');

                    const kpName = document.createElement('h4');
                    kpName.textContent = kp.name;
                    kpCard.appendChild(kpName);

                    const kpDesc = document.createElement('p');
                    kpDesc.textContent = kp.description;
                    kpCard.appendChild(kpDesc);

                    const kpCoords = document.createElement('p');
                    kpCoords.innerHTML = `<strong>Coordinates:</strong> ${kp.latitude}, ${kp.longitude}`;
                    kpCard.appendChild(kpCoords);

                    if (kp.imageUrl) {
                        const kpImg = document.createElement('img');
                        kpImg.src = kp.imageUrl;
                        kpImg.alt = kp.name;
                        kpImg.style.maxWidth = '100%';
                        kpImg.style.borderRadius = '8px';
                        kpImg.style.marginTop = '10px';
                        kpCard.appendChild(kpImg);
                    }

                    content.appendChild(kpCard);
                });
            }

            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading tour details:', error);
            alert('Greška pri učitavanju detalja ture');
        });
}

function updatePaginationControls(): void {
    const prevPageBtn = document.getElementById("prevPageBtn") as HTMLButtonElement;
    const nextPageBtn = document.getElementById("nextPageBtn") as HTMLButtonElement;
    const pageInfo = document.getElementById("pageInfo") as HTMLElement;

    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// ==================== PRIKAZ ZA VODICA (STARI KOD) ====================

function renderData(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    // PROVERA: Ako nije vodic, turisticki prikaz
    if (!isGuide() && !id) {
        showTouristView();
        return;
    }
     const guideView = document.querySelector('#guideView') as HTMLElement;
    const touristView = document.querySelector('#touristView') as HTMLElement;

    if (guideView) {
        guideView.style.display = 'block';
    }
    if (touristView) {
        touristView.style.display = 'none';
    }

    if (id) {
        const table = document.querySelector('table');
        if (table) {
            table.style.display = 'none';
        }
    }
    
    const addButton = document.querySelector("#addTourBtn");
    if (addButton) {
        addButton.addEventListener("click", async(event) => {
            event.preventDefault();
            submitData();
        });
    }
    
    const updateButton = document.querySelector("#updateTourBtn");
    if (updateButton) {
        updateButton.addEventListener("click", async(event) => {
            event.preventDefault();
            submitData();
        });
    }

    if (id) {
        return;
    }

    tourService.getAll("Name", "ASC", 1, 1000)
        .then(results => {
            const tours = results.data;
            console.log('Loaded tours:', tours);

            const table = document.querySelector('#toursTBody');

            if (!table) {
                console.error('Table body not found');
                return;
            }

            table.innerHTML = '';

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
                cell4.textContent = formatDateTime(tours[i].dateTime);
                newRow.appendChild(cell4);

                const cell5 = document.createElement("td");
                cell5.textContent = tours[i].status === 'published' ? 'objavljeno' : 'u pripremi';
                newRow.appendChild(cell5);

                const cell6 = document.createElement("td");
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
        
                const tourId = tours[i].id;
                editButton.onclick = function() {
                    window.location.href = `tours.html?id=${tourId}`;
                };
                cell6.appendChild(editButton);
                newRow.appendChild(cell6);

                const cell7 = document.createElement("td");
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
        
                deleteButton.onclick = function() {
                    if (confirm('Da li ste sigurni da želite da obrišete ovu turu?')) {
                        tourService.deleteTour(tourId!.toString())
                            .then(() => {
                                window.location.reload();
                            })
                            .catch(error => {
                                console.error(error.status, error.message);
                                alert('Greška pri brisanju ture');
                            });
                    }
                };
                cell7.appendChild(deleteButton);
                newRow.appendChild(cell7);

                table.appendChild(newRow);
            }
        })
        .catch(error => {
            console.error('Error loading tours:', error.status, error.message);
            alert('Greška pri učitavanju tura');
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
                alert('Tura je uspešno ažurirana');
                window.location.href = 'tours.html';
            })
            .catch(error => {
                console.error(error.status, error.message);
                alert('Greška pri ažuriranju ture');
            });
    } else {
        tourService.add(formData)
            .then(() => {
                alert('Nova tura je uspešno dodata');
                location.reload();
            })
            .catch(error => {
                console.error(error.status, error.message);
                alert('Greška pri dodavanju ture');
            });
    }
}

function initializeForm(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    
    if (id) {
        currentTourId = id;
        
        const keyPointsSection = document.querySelector('#keyPointsSection') as HTMLElement;
        if (keyPointsSection) {
            keyPointsSection.style.display = 'block';
        }
        
        const addBtn = document.querySelector('#addTourBtn') as HTMLElement;
        const updateBtn = document.querySelector('#updateTourBtn') as HTMLElement;
        const publishBtn = document.querySelector('#publishTourBtn') as HTMLElement;
        if (addBtn) addBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = 'inline-block';
        if (publishBtn) publishBtn.style.display = 'inline-block';
        
        tourService.getById(id)
            .then(tour => {  
                console.log('🔍 === TOUR DEBUG ===');
                console.log('Raw response:', JSON.stringify(tour, null, 2));
                console.log('tour.keyPoints exists?', 'keyPoints' in tour);
                console.log('tour.keyPoints value:', tour.keyPoints);
                console.log('tour.keyPoints type:', typeof tour.keyPoints);
                console.log('tour.keyPoints length:', tour.keyPoints?.length || 0);
                
                if (tour.keyPoints && tour.keyPoints.length > 0) {
                    console.log('Key points FOUND:', tour.keyPoints);
                } else {
                    console.log('Key points EMPTY or UNDEFINED');
                }
                console.log('===================');
                
                (document.querySelector('#name') as HTMLInputElement).value = tour.name;
                (document.querySelector('#description') as HTMLInputElement).value = tour.description;
                (document.querySelector('#capacity') as HTMLInputElement).value = tour.maxGuests.toString(); 
                (document.querySelector('#dateTime') as HTMLInputElement).value = tour.dateTime;
                
                updateDescriptionCounter();
                
                if (tour.keyPoints && tour.keyPoints.length > 0) {
                    console.log('Found', tour.keyPoints.length, 'key points');
                    keyPoints = tour.keyPoints;
                } else {
                    console.log('No key points in tour');
                    keyPoints = [];
                }
                renderKeyPoints();
                validatePublishConditions();
                setupKeyPointForm(); 
            }).catch(error => {
                console.error(error.status, error.text);
            });
    }
}

function loadKeyPoints(tourId: string): void {
    keyPointService.getByTourId(tourId)
        .then(kps => {
            keyPoints = kps;
            renderKeyPoints();
            validatePublishConditions();
        })
        .catch(error => {
            console.error('Error loading key points:', error);
        });
}

function renderKeyPoints(): void {
    const keyPointsList = document.querySelector('#keyPointsList');
    if (!keyPointsList) return;
    
    keyPointsList.innerHTML = '';
    
    if (keyPoints.length === 0) {
       keyPointsList.innerHTML = 'No key points added yet...';
        return;
    }
    
    keyPoints.forEach(kp => {
        const card = document.createElement('div');
        card.classList.add('keypoint-card'); 

        const nameEl = document.createElement('h4');
        nameEl.textContent = kp.name;
        card.appendChild(nameEl);

        const descriptionEl = document.createElement('p');
        descriptionEl.textContent = kp.description;
        card.appendChild(descriptionEl);

        const coordsEl = document.createElement('p');
        coordsEl.textContent = `Coordinates: ${kp.latitude}, ${kp.longitude}`;
        card.appendChild(coordsEl);

        if (kp.imageUrl) {
            const imgEl = document.createElement('img');
            imgEl.src = kp.imageUrl;
            imgEl.alt = kp.name;
            imgEl.classList.add('keypoint-image'); 
            card.appendChild(imgEl);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('deleteKeyPointBtn');
        deleteBtn.dataset.id = kp.id!.toString();
        card.appendChild(deleteBtn);

        keyPointsList.appendChild(card);
    });
    
    document.querySelectorAll('.deleteKeyPointBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const kpId = (e.target as HTMLElement).getAttribute('data-id');
            if (kpId && currentTourId) {
                deleteKeyPoint(currentTourId, kpId);
            }
        });
    });
}

function deleteKeyPoint(tourId: string, keyPointId: string): void {
    if (!confirm('Are you sure you want to delete this key point?')) {
        return;
    }
    
    keyPointService.delete(tourId, keyPointId)
        .then(() => {
            loadKeyPoints(tourId);
        })
        .catch(error => {
            alert('Error deleting key point: ' + error.message);
        });
}

function updateDescriptionCounter(): void {
    const description = document.querySelector('#description') as HTMLTextAreaElement;
    const counter = document.querySelector('#descriptionCounter') as HTMLElement;
    
    if (description && counter) {
        counter.textContent = `${description.value.length} / 250 karaktera`;
        description.addEventListener('input', () => {
            const length = description.value.length;
            counter.textContent = `${length} / 250 characters`;
            
            if (length >= 250) {
                counter.style.color = 'green';
            } else {
                counter.style.color = '#666';
            }
            
            validatePublishConditions();
        });
    }
}

function validatePublishConditions(): void {
    const publishBtn = document.querySelector('#publishTourBtn') as HTMLButtonElement;
    if (!publishBtn) return;
    
    const description = (document.querySelector('#description') as HTMLTextAreaElement).value;
    const hasEnoughKeyPoints = keyPoints.length >= 2;
    const hasLongDescription = description.length >= 250;
    
    publishBtn.disabled = !(hasEnoughKeyPoints && hasLongDescription);
    
    if (!hasEnoughKeyPoints && !hasLongDescription) {
        publishBtn.title = 'Need at least 2 key points and 250 characters in description';
    } else if (!hasEnoughKeyPoints) {
        publishBtn.title = 'Need at least 2 key points';
    } else if (!hasLongDescription) {
        publishBtn.title = 'Description must have at least 250 characters';
    } else {
        publishBtn.title = 'Publish tour';
    }
}

function setupKeyPointForm(): void {
    const addKeyPointBtn = document.querySelector('#addKeyPointBtn');
    const keyPointForm = document.querySelector('#keyPointForm') as HTMLElement;
    const saveKeyPointBtn = document.querySelector('#saveKeyPointBtn');
    const cancelKeyPointBtn = document.querySelector('#cancelKeyPointBtn');
    const publishBtn = document.querySelector('#publishTourBtn');
    
    if (addKeyPointBtn) {
        addKeyPointBtn.addEventListener('click', () => {
            if (keyPointForm) {
                keyPointForm.style.display = 'block';
                clearKeyPointForm();
            }
        });
    }
    
    if (cancelKeyPointBtn) {
        cancelKeyPointBtn.addEventListener('click', () => {
            if (keyPointForm) {
                keyPointForm.style.display = 'none';
                clearKeyPointForm();
            }
        });
    }
    
    if (saveKeyPointBtn) {
        saveKeyPointBtn.addEventListener('click', () => {
            saveKeyPoint();
        });
    }
    
    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            publishTour();
        });
    }
}

function clearKeyPointForm(): void {
    (document.querySelector('#kpName') as HTMLInputElement).value = '';
    (document.querySelector('#kpDescription') as HTMLTextAreaElement).value = '';
    (document.querySelector('#kpImageUrl') as HTMLInputElement).value = '';
    (document.querySelector('#kpLatitude') as HTMLInputElement).value = '';
    (document.querySelector('#kpLongitude') as HTMLInputElement).value = '';
    
    const errorDiv = document.querySelector('#keyPointError') as HTMLElement;
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
}

function saveKeyPoint(): void {
    if (!currentTourId) {
        alert('Error: Tour ID not found');
        return;
    }
    
    const name = (document.querySelector('#kpName') as HTMLInputElement).value;
    const description = (document.querySelector('#kpDescription') as HTMLTextAreaElement).value;
    const imageUrl = (document.querySelector('#kpImageUrl') as HTMLInputElement).value;
    const latitude = parseFloat((document.querySelector('#kpLatitude') as HTMLInputElement).value);
    const longitude = parseFloat((document.querySelector('#kpLongitude') as HTMLInputElement).value);
    
    if (!name || !description || !imageUrl || isNaN(latitude) || isNaN(longitude)) {
        showKeyPointError('All fields are required');
        return;
    }
    
    const keyPoint: KeyPoint = {
        name,
        description,
        imageUrl,
        latitude,
        longitude
    };
    
    keyPointService.add(currentTourId, keyPoint)
        .then(() => {
            const keyPointForm = document.querySelector('#keyPointForm') as HTMLElement;
            if (keyPointForm) {
                keyPointForm.style.display = 'none';
            }
            clearKeyPointForm();
            loadKeyPoints(currentTourId!);
        })
        .catch(error => {
            showKeyPointError(error.message || 'Error adding key point');
        });
}

function showKeyPointError(message: string): void {
    const errorDiv = document.querySelector('#keyPointError') as HTMLElement;
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function publishTour(): void {
    if (!currentTourId) {
        alert('Error: Tour ID not found');
        return;
    }
    
    if (!confirm('Are you sure you want to publish this tour?')) {
        return;
    }
    
    tourService.publish(currentTourId)
        .then(() => {
            alert('Tour successfully published!');
            window.location.href = 'tours.html';
        })
        .catch(error => {
            alert('Error publishing tour: ' + error.message);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    renderData();
    initializeForm();
    updateDescriptionCounter();
});
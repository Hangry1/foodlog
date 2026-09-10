// ============================================================
// Firebase imports
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ============================================================
// Firebase configuration
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBv3Krz0n6WHUGD3-EjLzMjl163jwWkkTA",
    authDomain: "foodlog-e1c83.firebaseapp.com",
    projectId: "foodlog-e1c83",
    storageBucket: "foodlog-e1c83.firebasestorage.app",
    messagingSenderId: "996797044798",
    appId: "1:996797044798:web:2301d5bae0e4c28e4b996f"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();


// ============================================================
// Application state
// ============================================================

let currentUser = null;
let restaurants = [];

let selectedRestaurant = null;

let editingRestaurantId = null;
let editingDishId = null;


// ============================================================
// DOM elements
// ============================================================

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app");

const googleSignInButton =
    document.getElementById("google-sign-in");

const loginError =
    document.getElementById("login-error");

const userPhoto =
    document.getElementById("user-photo");

const userName =
    document.getElementById("user-name");

const homeView =
    document.getElementById("home-view");

const restaurantView =
    document.getElementById("restaurant-view");

const restaurantList =
    document.getElementById("restaurant-list");

const emptyState =
    document.getElementById("empty-state");

const dishList =
    document.getElementById("dish-list");

const dishEmptyState =
    document.getElementById("dish-empty-state");


// Restaurant modal

const restaurantModal =
    document.getElementById("restaurant-modal");

const restaurantForm =
    document.getElementById("restaurant-form");

const restaurantModalTitle =
    document.getElementById("restaurant-modal-title");

const restaurantNameInput =
    document.getElementById("restaurant-name-input");

const restaurantLocationInput =
    document.getElementById("restaurant-location-input");

const restaurantCuisineInput =
    document.getElementById("restaurant-cuisine-input");

const restaurantRatingInput =
    document.getElementById("restaurant-rating-input");

const restaurantFormError =
    document.getElementById("restaurant-form-error");


// Dish modal

const dishModal =
    document.getElementById("dish-modal");

const dishForm =
    document.getElementById("dish-form");

const dishModalTitle =
    document.getElementById("dish-modal-title");

const dishNameInput =
    document.getElementById("dish-name-input");

const dishRatingInput =
    document.getElementById("dish-rating-input");

const dishReviewInput =
    document.getElementById("dish-review-input");

const dishNotesInput =
    document.getElementById("dish-notes-input");

const dishFormError =
    document.getElementById("dish-form-error");


// ============================================================
// Authentication
// ============================================================

googleSignInButton.addEventListener("click", async () => {

    loginError.textContent = "";

    try {

        await signInWithRedirect(auth, googleProvider);

    } catch (error) {

        console.error(error);

        loginError.textContent =
            "Unable to sign in. Please try again.";

    }

});


document.getElementById("sign-out-button")
    .addEventListener("click", async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error("Sign out error:", error);

        }

    });


onAuthStateChanged(auth, async (user) => {

    if (user) {

        currentUser = user;

        showApp();

        await loadRestaurants();

    } else {

        currentUser = null;

        showLogin();

    }

});


// ============================================================
// Login / App visibility
// ============================================================

function showLogin() {

    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");

}


function showApp() {

    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    userName.textContent =
        currentUser.displayName || "User";

    if (currentUser.photoURL) {

        userPhoto.src = currentUser.photoURL;
        userPhoto.alt = currentUser.displayName || "User";

    }

    showHome();

}


// ============================================================
// Restaurant loading
// ============================================================

async function loadRestaurants() {

    if (!currentUser) return;

    try {

        const restaurantCollection =
            collection(
                db,
                "users",
                currentUser.uid,
                "restaurants"
            );

        const snapshot =
            await getDocs(restaurantCollection);

        restaurants =
            snapshot.docs.map((document) => ({

                id: document.id,
                ...document.data()

            }));

        restaurants.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
        );

        renderRestaurants();

    } catch (error) {

        console.error(
            "Error loading restaurants:",
            error
        );

        restaurantList.innerHTML = `
            <p class="error-message">
                Unable to load your restaurants.
                Please refresh the page.
            </p>
        `;

    }

}


// ============================================================
// Restaurant rendering
// ============================================================

function renderRestaurants() {

    restaurantList.innerHTML = "";

    if (restaurants.length === 0) {

        emptyState.classList.remove("hidden");

        return;

    }

    emptyState.classList.add("hidden");


    restaurants.forEach((restaurant) => {

        const card =
            document.createElement("div");

        card.className = "restaurant-card";

        card.innerHTML = `

            <h3>${escapeHtml(restaurant.name)}</h3>

            <p class="card-location">
                ${escapeHtml(restaurant.location)}
            </p>

            <p class="card-cuisine">
                ${escapeHtml(restaurant.cuisine)}
            </p>

            <div class="card-bottom">

                <div class="card-rating">
                    ★ ${Number(restaurant.overallRating).toFixed(1)} / 10
                </div>

                <div class="card-dishes">
                    Loading dishes...
                </div>

            </div>

        `;


        card.addEventListener("click", () => {

            openRestaurant(restaurant.id);

        });


        restaurantList.appendChild(card);


        // Load dish count separately
        loadDishCount(
            restaurant.id,
            card.querySelector(".card-dishes")
        );

    });

}


// ============================================================
// Dish count
// ============================================================

async function loadDishCount(
    restaurantId,
    element
) {

    try {

        const dishCollection =
            collection(
                db,
                "users",
                currentUser.uid,
                "restaurants",
                restaurantId,
                "dishes"
            );

        const snapshot =
            await getDocs(dishCollection);

        const count = snapshot.size;

        element.textContent =
            `${count} ${count === 1 ? "dish" : "dishes"} logged`;

    } catch (error) {

        console.error(error);

        element.textContent = "";

    }

}


// ============================================================
// Restaurant detail
// ============================================================

async function openRestaurant(restaurantId) {

    selectedRestaurant =
        restaurants.find(
            restaurant => restaurant.id === restaurantId
        );

    if (!selectedRestaurant) return;

    homeView.classList.add("hidden");
    restaurantView.classList.remove("hidden");

    document.getElementById("restaurant-name")
        .textContent =
        selectedRestaurant.name;

    document.getElementById("restaurant-location")
        .textContent =
        selectedRestaurant.location;

    document.getElementById("restaurant-cuisine")
        .textContent =
        selectedRestaurant.cuisine;

    document.getElementById("restaurant-rating")
        .textContent =
        `★ ${Number(selectedRestaurant.overallRating).toFixed(1)} / 10`;

    await loadDishes();

}


// ============================================================
// Load dishes
// ============================================================

async function loadDishes() {

    if (!selectedRestaurant) return;

    dishList.innerHTML = "";

    try {

        const dishCollection =
            collection(
                db,
                "users",
                currentUser.uid,
                "restaurants",
                selectedRestaurant.id,
                "dishes"
            );

        const snapshot =
            await getDocs(dishCollection);

        const dishes =
            snapshot.docs.map((document) => ({

                id: document.id,
                ...document.data()

            }));


        dishes.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
        );


        if (dishes.length === 0) {

            dishEmptyState.classList.remove("hidden");

            return;

        }

        dishEmptyState.classList.add("hidden");


        dishes.forEach((dish) => {

            renderDish(dish);

        });

    } catch (error) {

        console.error(
            "Error loading dishes:",
            error
        );

        dishList.innerHTML = `
            <p class="error-message">
                Unable to load dishes.
            </p>
        `;

    }

}


// ============================================================
// Render a dish
// ============================================================

function renderDish(dish) {

    const card =
        document.createElement("div");

    card.className = "dish-card";

    card.innerHTML = `

        <div class="dish-card-header">

            <div>
                <h3>${escapeHtml(dish.name)}</h3>
            </div>

            <div class="dish-rating">
                ★ ${Number(dish.rating).toFixed(1)} / 10
            </div>

        </div>

        ${
            dish.review
                ? `<p class="dish-review">
                    ${escapeHtml(dish.review)}
                   </p>`
                : ""
        }

        ${
            dish.notes
                ? `<p class="dish-notes">
                    ${escapeHtml(dish.notes)}
                   </p>`
                : ""
        }

        <div class="dish-actions">

            <button
                class="secondary-button small-button edit-dish-button">
                Edit
            </button>

            <button
                class="danger-button small-button delete-dish-button">
                Delete
            </button>

        </div>

    `;


    card.querySelector(".edit-dish-button")
        .addEventListener("click", () => {

            openDishModal(dish);

        });


    card.querySelector(".delete-dish-button")
        .addEventListener("click", () => {

            deleteDish(dish.id);

        });


    dishList.appendChild(card);

}


// ============================================================
// Add / Edit Restaurant
// ============================================================

function openRestaurantModal(restaurant = null) {

    editingRestaurantId =
        restaurant ? restaurant.id : null;

    restaurantModalTitle.textContent =
        restaurant
            ? "Edit Restaurant"
            : "Add Restaurant";

    restaurantNameInput.value =
        restaurant?.name || "";

    restaurantLocationInput.value =
        restaurant?.location || "";

    restaurantCuisineInput.value =
        restaurant?.cuisine || "";

    restaurantRatingInput.value =
        restaurant?.overallRating ?? "";

    restaurantFormError.textContent = "";

    restaurantModal.classList.remove("hidden");

    restaurantNameInput.focus();

}


restaurantForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    restaurantFormError.textContent = "";

    const name =
        restaurantNameInput.value.trim();

    const location =
        restaurantLocationInput.value.trim();

    const cuisine =
        restaurantCuisineInput.value.trim();

    const rating =
        Number(restaurantRatingInput.value);


    if (
        !name ||
        !location ||
        !cuisine ||
        Number.isNaN(rating) ||
        rating < 0 ||
        rating > 10
    ) {

        restaurantFormError.textContent =
            "Please fill out all fields correctly.";

        return;

    }


    try {

        const restaurantData = {

            name,
            location,
            cuisine,
            overallRating: rating

        };


        if (editingRestaurantId) {

            const restaurantRef =
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    editingRestaurantId
                );

            await updateDoc(
                restaurantRef,
                restaurantData
            );

        } else {

            await addDoc(
                collection(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants"
                ),
                restaurantData
            );

        }


        closeModal(restaurantModal);

        await loadRestaurants();


        if (
            editingRestaurantId &&
            selectedRestaurant
        ) {

            selectedRestaurant =
                restaurants.find(
                    restaurant =>
                        restaurant.id === editingRestaurantId
                );

            await openRestaurant(
                editingRestaurantId
            );

        }

    } catch (error) {

        console.error(error);

        restaurantFormError.textContent =
            "Unable to save restaurant. Please try again.";

    }

});


// ============================================================
// Delete Restaurant
// ============================================================

async function deleteRestaurant() {

    if (!selectedRestaurant) return;

    const confirmed =
        confirm(
            `Delete "${selectedRestaurant.name}"?\n\n` +
            "This will permanently delete the restaurant " +
            "and all of its dishes."
        );

    if (!confirmed) return;


    try {

        // Delete dishes first
        const dishCollection =
            collection(
                db,
                "users",
                currentUser.uid,
                "restaurants",
                selectedRestaurant.id,
                "dishes"
            );

        const dishSnapshot =
            await getDocs(dishCollection);

        for (const dish of dishSnapshot.docs) {

            await deleteDoc(dish.ref);

        }


        // Delete restaurant
        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "restaurants",
                selectedRestaurant.id
            )
        );


        selectedRestaurant = null;

        await loadRestaurants();

        showHome();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete the restaurant."
        );

    }

}


// ============================================================
// Add / Edit Dish
// ============================================================

function openDishModal(dish = null) {

    editingDishId =
        dish ? dish.id : null;

    dishModalTitle.textContent =
        dish ? "Edit Dish" : "Add Dish";

    dishNameInput.value =
        dish?.name || "";

    dishRatingInput.value =
        dish?.rating ?? "";

    dishReviewInput.value =
        dish?.review || "";

    dishNotesInput.value =
        dish?.notes || "";

    dishFormError.textContent = "";

    dishModal.classList.remove("hidden");

    dishNameInput.focus();

}


dishForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    dishFormError.textContent = "";

    if (!selectedRestaurant) return;


    const name =
        dishNameInput.value.trim();

    const rating =
        Number(dishRatingInput.value);

    const review =
        dishReviewInput.value.trim();

    const notes =
        dishNotesInput.value.trim();


    if (
        !name ||
        Number.isNaN(rating) ||
        rating < 0 ||
        rating > 10
    ) {

        dishFormError.textContent =
            "Please enter a dish name and rating from 0 to 10.";

        return;

    }


    const dishData = {

        name,
        rating,
        review,
        notes

    };


    try {

        const dishesPath = [
            "users",
            currentUser.uid,
            "restaurants",
            selectedRestaurant.id,
            "dishes"
        ];


        if (editingDishId) {

            await updateDoc(
                doc(
                    db,
                    ...dishesPath,
                    editingDishId
                ),
                dishData
            );

        } else {

            await addDoc(
                collection(
                    db,
                    ...dishesPath
                ),
                dishData
            );

        }


        closeModal(dishModal);

        await loadDishes();

    } catch (error) {

        console.error(error);

        dishFormError.textContent =
            "Unable to save dish. Please try again.";

    }

});


// ============================================================
// Delete Dish
// ============================================================

async function deleteDish(dishId) {

    if (!selectedRestaurant) return;

    const confirmed =
        confirm(
            "Delete this dish?\n\n" +
            "This cannot be undone."
        );

    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "restaurants",
                selectedRestaurant.id,
                "dishes",
                dishId
            )
        );

        await loadDishes();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete the dish."
        );

    }

}


// ============================================================
// Navigation
// ============================================================

function showHome() {

    homeView.classList.remove("hidden");
    restaurantView.classList.add("hidden");

    selectedRestaurant = null;

}


document.getElementById("home-button")
    .addEventListener("click", () => {

        showHome();

    });


document.getElementById("back-button")
    .addEventListener("click", () => {

        showHome();

    });


// ============================================================
// Buttons
// ============================================================

document.getElementById("add-restaurant-button")
    .addEventListener("click", () => {

        openRestaurantModal();

    });


document.getElementById("empty-add-button")
    .addEventListener("click", () => {

        openRestaurantModal();

    });


document.getElementById("edit-restaurant-button")
    .addEventListener("click", () => {

        if (selectedRestaurant) {

            openRestaurantModal(
                selectedRestaurant
            );

        }

    });


document.getElementById("delete-restaurant-button")
    .addEventListener("click", () => {

        deleteRestaurant();

    });


document.getElementById("add-dish-button")
    .addEventListener("click", () => {

        openDishModal();

    });


document.getElementById("empty-add-dish-button")
    .addEventListener("click", () => {

        openDishModal();

    });


// ============================================================
// Modal controls
// ============================================================

document.querySelectorAll(".modal-close")
    .forEach((button) => {

        button.addEventListener("click", () => {

            const modalId =
                button.dataset.close;

            closeModal(
                document.getElementById(modalId)
            );

        });

    });


document.querySelectorAll(".modal")
    .forEach((modal) => {

        modal.addEventListener("click", (event) => {

            if (event.target === modal) {

                closeModal(modal);

            }

        });

    });


function closeModal(modal) {

    modal.classList.add("hidden");

}


// ============================================================
// Basic HTML escaping
// ============================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

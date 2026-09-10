// ============================================================
// Firebase imports
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
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
    deleteDoc,
    setDoc
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

let userLocations = [];
let userCategories = [];


// ============================================================
// DOM elements
// ============================================================

const loginScreen =
    document.getElementById("login-screen");

const appScreen =
    document.getElementById("app");

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

const restaurantRatingInput =
    document.getElementById("restaurant-rating-input");

const restaurantFormError =
    document.getElementById("restaurant-form-error");

const locationOptions =
    document.getElementById("location-options");

const categoryOptions =
    document.getElementById("category-options");

const locationSelectionError =
    document.getElementById("location-selection-error");

const categorySelectionError =
    document.getElementById("category-selection-error");


// Lists modal

const listsModal =
    document.getElementById("lists-modal");

const locationForm =
    document.getElementById("location-form");

const newLocationInput =
    document.getElementById("new-location-input");

const locationFormError =
    document.getElementById("location-form-error");

const locationList =
    document.getElementById("location-list");

const categoryForm =
    document.getElementById("category-form");

const newCategoryInput =
    document.getElementById("new-category-input");

const categoryFormError =
    document.getElementById("category-form-error");

const categoryList =
    document.getElementById("category-list");


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

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        console.log(
            "Google sign-in successful:",
            result.user
        );

    } catch (error) {

        console.error(
            "GOOGLE SIGN-IN ERROR:",
            error
        );

        console.error(
            "Error code:",
            error.code
        );

        console.error(
            "Error message:",
            error.message
        );

        loginError.textContent =
            `Sign-in error: ${error.code || "unknown"} — ${error.message || "Unknown error"}`;

    }

});


document.getElementById("sign-out-button")
    .addEventListener("click", async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Sign out error:",
                error
            );

        }

    });


onAuthStateChanged(auth, async (user) => {

    if (user) {

        currentUser = user;

        showApp();

        await loadUserLists();

        await loadRestaurants();

    } else {

        currentUser = null;

        userLocations = [];
        userCategories = [];

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

        userPhoto.src =
            currentUser.photoURL;

        userPhoto.alt =
            currentUser.displayName || "User";

    }

    showHome();

}


// ============================================================
// User Lists
// ============================================================

async function loadUserLists() {

    if (!currentUser) return;

    try {

        const settingsRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "settings",
                "lists"
            );

        const settingsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    currentUser.uid,
                    "settings"
                )
            );

        let settingsData = null;

        settingsSnapshot.forEach((document) => {

            if (document.id === "lists") {

                settingsData =
                    document.data();

            }

        });


        if (settingsData) {

            userLocations =
                Array.isArray(settingsData.locations)
                    ? settingsData.locations
                    : [];

            userCategories =
                Array.isArray(settingsData.categories)
                    ? settingsData.categories
                    : [];

        } else {

            userLocations = [];
            userCategories = [];

        }

        userLocations =
            cleanStringArray(userLocations);

        userCategories =
            cleanStringArray(userCategories);

        renderManagedLists();

    } catch (error) {

        console.error(
            "Error loading user lists:",
            error
        );

        userLocations = [];
        userCategories = [];

    }

}


async function saveUserLists() {

    if (!currentUser) return;

    const settingsRef =
        doc(
            db,
            "users",
            currentUser.uid,
            "settings",
            "lists"
        );

    await setDoc(
        settingsRef,
        {
            locations: userLocations,
            categories: userCategories
        }
    );

}


// ============================================================
// List Management
// ============================================================

document.getElementById("manage-lists-button")
    .addEventListener("click", () => {

        renderManagedLists();

        listsModal.classList.remove("hidden");

    });


document.getElementById("manage-locations-from-restaurant")
    .addEventListener("click", () => {

        restaurantModal.classList.add("hidden");

        renderManagedLists();

        listsModal.classList.remove("hidden");

    });


document.getElementById("manage-categories-from-restaurant")
    .addEventListener("click", () => {

        restaurantModal.classList.add("hidden");

        renderManagedLists();

        listsModal.classList.remove("hidden");

    });


locationForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    locationFormError.textContent = "";

    const value =
        newLocationInput.value.trim();

    if (!value) {

        locationFormError.textContent =
            "Please enter a location.";

        return;

    }

    const exists =
        userLocations.some(
            location =>
                location.toLowerCase() === value.toLowerCase()
        );

    if (exists) {

        locationFormError.textContent =
            "That location already exists.";

        return;

    }

    try {

        userLocations.push(value);

        userLocations.sort(
            (a, b) => a.localeCompare(b)
        );

        await saveUserLists();

        newLocationInput.value = "";

        renderManagedLists();

        renderLocationOptions();

    } catch (error) {

        console.error(error);

        locationFormError.textContent =
            "Unable to save the location.";

    }

});


categoryForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    categoryFormError.textContent = "";

    const value =
        newCategoryInput.value.trim();

    if (!value) {

        categoryFormError.textContent =
            "Please enter a category.";

        return;

    }

    const exists =
        userCategories.some(
            category =>
                category.toLowerCase() === value.toLowerCase()
        );

    if (exists) {

        categoryFormError.textContent =
            "That category already exists.";

        return;

    }

    try {

        userCategories.push(value);

        userCategories.sort(
            (a, b) => a.localeCompare(b)
        );

        await saveUserLists();

        newCategoryInput.value = "";

        renderManagedLists();

        renderCategoryOptions();

    } catch (error) {

        console.error(error);

        categoryFormError.textContent =
            "Unable to save the category.";

    }

});


async function deleteLocation(location) {

    const usedBy =
        restaurants.filter(
            restaurant =>
                getRestaurantLocations(restaurant)
                    .includes(location)
        );

    let message =
        `Delete "${location}" from your location list?`;

    if (usedBy.length > 0) {

        message +=
            `\n\n${usedBy.length} restaurant` +
            `${usedBy.length === 1 ? "" : "s"} currently ` +
            `use${usedBy.length === 1 ? "s" : ""} this location.`;

        message +=
            "\n\nThe location will be removed from those restaurants as well.";

    }

    if (!confirm(message)) return;

    try {

        userLocations =
            userLocations.filter(
                item => item !== location
            );

        for (const restaurant of usedBy) {

            const locations =
                getRestaurantLocations(restaurant)
                    .filter(item => item !== location);

            await updateDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    restaurant.id
                ),
                {
                    locations,
                    location:
                        locations.join(", ")
                }
            );

        }

        await saveUserLists();

        await loadRestaurants();

        renderManagedLists();

        renderLocationOptions();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete the location."
        );

    }

}


async function deleteCategory(category) {

    const usedBy =
        restaurants.filter(
            restaurant =>
                getRestaurantCategories(restaurant)
                    .includes(category)
        );

    let message =
        `Delete "${category}" from your category list?`;

    if (usedBy.length > 0) {

        message +=
            `\n\n${usedBy.length} restaurant` +
            `${usedBy.length === 1 ? "" : "s"} currently ` +
            `use${usedBy.length === 1 ? "" : ""} this category.`;

        message +=
            "\n\nThe category will be removed from those restaurants as well.";

    }

    if (!confirm(message)) return;

    try {

        userCategories =
            userCategories.filter(
                item => item !== category
            );

        for (const restaurant of usedBy) {

            const categories =
                getRestaurantCategories(restaurant)
                    .filter(item => item !== category);

            await updateDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    restaurant.id
                ),
                {
                    categories,
                    cuisine:
                        categories.join(", ")
                }
            );

        }

        await saveUserLists();

        await loadRestaurants();

        renderManagedLists();

        renderCategoryOptions();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete the category."
        );

    }

}


function renderManagedLists() {

    locationList.innerHTML = "";

    categoryList.innerHTML = "";


    if (userLocations.length === 0) {

        locationList.innerHTML =
            `<div class="managed-list-empty">
                No locations added yet.
            </div>`;

    } else {

        userLocations.forEach((location) => {

            const item =
                document.createElement("div");

            item.className =
                "managed-list-item";

            item.innerHTML = `

                <span>
                    ${escapeHtml(location)}
                </span>

                <button
                    type="button"
                    class="delete-list-button">
                    Delete
                </button>

            `;

            item.querySelector(
                ".delete-list-button"
            ).addEventListener(
                "click",
                () => deleteLocation(location)
            );

            locationList.appendChild(item);

        });

    }


    if (userCategories.length === 0) {

        categoryList.innerHTML =
            `<div class="managed-list-empty">
                No categories added yet.
            </div>`;

    } else {

        userCategories.forEach((category) => {

            const item =
                document.createElement("div");

            item.className =
                "managed-list-item";

            item.innerHTML = `

                <span>
                    ${escapeHtml(category)}
                </span>

                <button
                    type="button"
                    class="delete-list-button">
                    Delete
                </button>

            `;

            item.querySelector(
                ".delete-list-button"
            ).addEventListener(
                "click",
                () => deleteCategory(category)
            );

            categoryList.appendChild(item);

        });

    }

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
            await getDocs(
                restaurantCollection
            );

        restaurants =
            snapshot.docs.map((document) => ({

                id: document.id,
                ...document.data()

            }));

        restaurants.sort((a, b) =>
            (a.name || "")
                .localeCompare(b.name || "")
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
// Restaurant helper functions
// ============================================================

function getRestaurantLocations(restaurant) {

    if (Array.isArray(restaurant.locations)) {

        return cleanStringArray(
            restaurant.locations
        );

    }

    if (restaurant.location) {

        return cleanStringArray(
            String(restaurant.location)
                .split(",")
        );

    }

    return [];

}


function getRestaurantCategories(restaurant) {

    if (Array.isArray(restaurant.categories)) {

        return cleanStringArray(
            restaurant.categories
        );

    }

    if (restaurant.cuisine) {

        return cleanStringArray(
            String(restaurant.cuisine)
                .split(",")
        );

    }

    return [];

}


function cleanStringArray(values) {

    return [...new Set(
        values
            .map(value => String(value).trim())
            .filter(Boolean)
    )];

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

        const locations =
            getRestaurantLocations(restaurant);

        const categories =
            getRestaurantCategories(restaurant);


        const card =
            document.createElement("div");

        card.className =
            "restaurant-card";

        card.innerHTML = `

            <h3>
                ${escapeHtml(restaurant.name)}
            </h3>

            <p class="card-location">
                ${escapeHtml(
                    locations.join(" • ") ||
                    "No location"
                )}
            </p>

            <p class="card-cuisine">
                ${escapeHtml(
                    categories.join(" • ") ||
                    "No categories"
                )}
            </p>

            <div class="card-bottom">

                <div class="card-rating">
                    ★ ${Number(
                        restaurant.overallRating
                    ).toFixed(1)} / 10
                </div>

                <div class="card-dishes">
                    Loading dishes...
                </div>

            </div>

        `;


        card.addEventListener("click", () => {

            openRestaurant(
                restaurant.id
            );

        });


        restaurantList.appendChild(card);


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

        const count =
            snapshot.size;

        element.textContent =
            `${count} ${
                count === 1
                    ? "dish"
                    : "dishes"
            } logged`;

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
            restaurant =>
                restaurant.id === restaurantId
        );

    if (!selectedRestaurant) return;

    homeView.classList.add("hidden");

    restaurantView.classList.remove("hidden");


    const locations =
        getRestaurantLocations(
            selectedRestaurant
        );

    const categories =
        getRestaurantCategories(
            selectedRestaurant
        );


    document.getElementById("restaurant-name")
        .textContent =
        selectedRestaurant.name;


    document.getElementById("restaurant-location")
        .textContent =
        locations.join(" • ");


    document.getElementById("restaurant-cuisine")
        .textContent =
        categories.join(" • ");


    document.getElementById("restaurant-rating")
        .textContent =
        `★ ${
            Number(
                selectedRestaurant.overallRating
            ).toFixed(1)
        } / 10`;


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
            (a.name || "")
                .localeCompare(b.name || "")
        );


        if (dishes.length === 0) {

            dishEmptyState
                .classList
                .remove("hidden");

            return;

        }

        dishEmptyState
            .classList
            .add("hidden");


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

    card.className =
        "dish-card";

    card.innerHTML = `

        <div class="dish-card-header">

            <div>
                <h3>
                    ${escapeHtml(dish.name)}
                </h3>
            </div>

            <div class="dish-rating">
                ★ ${
                    Number(dish.rating).toFixed(1)
                } / 10
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


    card.querySelector(
        ".edit-dish-button"
    ).addEventListener("click", (event) => {

        event.stopPropagation();

        openDishModal(dish);

    });


    card.querySelector(
        ".delete-dish-button"
    ).addEventListener("click", (event) => {

        event.stopPropagation();

        deleteDish(dish.id);

    });


    dishList.appendChild(card);

}


// ============================================================
// Add / Edit Restaurant
// ============================================================

function openRestaurantModal(
    restaurant = null
) {

    editingRestaurantId =
        restaurant
            ? restaurant.id
            : null;


    restaurantModalTitle.textContent =
        restaurant
            ? "Edit Restaurant"
            : "Add Restaurant";


    restaurantNameInput.value =
        restaurant?.name || "";


    restaurantRatingInput.value =
        restaurant?.overallRating ?? "";


    restaurantFormError.textContent = "";

    locationSelectionError.textContent = "";

    categorySelectionError.textContent = "";


    const selectedLocations =
        restaurant
            ? getRestaurantLocations(
                restaurant
            )
            : [];


    const selectedCategories =
        restaurant
            ? getRestaurantCategories(
                restaurant
            )
            : [];


    renderLocationOptions(
        selectedLocations
    );

    renderCategoryOptions(
        selectedCategories
    );


    restaurantModal.classList.remove(
        "hidden"
    );

    restaurantNameInput.focus();

}


function renderLocationOptions(
    selectedValues = []
) {

    locationOptions.innerHTML = "";

    const selected =
        new Set(selectedValues);


    if (userLocations.length === 0) {

        locationOptions.innerHTML = `
            <p class="field-error">
                No locations yet. Add one using
                "Manage locations".
            </p>
        `;

        return;

    }


    userLocations.forEach((location, index) => {

        const id =
            `location-option-${index}`;

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "multi-select-option";

        wrapper.innerHTML = `

            <input
                type="checkbox"
                id="${id}"
                value="${escapeHtml(location)}"
                ${selected.has(location)
                    ? "checked"
                    : ""}
            >

            <label for="${id}">
                ${escapeHtml(location)}
            </label>

        `;

        locationOptions.appendChild(
            wrapper
        );

    });

}


function renderCategoryOptions(
    selectedValues = []
) {

    categoryOptions.innerHTML = "";

    const selected =
        new Set(selectedValues);


    if (userCategories.length === 0) {

        categoryOptions.innerHTML = `
            <p class="field-error">
                No categories yet. Add one using
                "Manage categories".
            </p>
        `;

        return;

    }


    userCategories.forEach((category, index) => {

        const id =
            `category-option-${index}`;

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "multi-select-option";

        wrapper.innerHTML = `

            <input
                type="checkbox"
                id="${id}"
                value="${escapeHtml(category)}"
                ${selected.has(category)
                    ? "checked"
                    : ""}
            >

            <label for="${id}">
                ${escapeHtml(category)}
            </label>

        `;

        categoryOptions.appendChild(
            wrapper
        );

    });

}


function getCheckedValues(container) {

    return [
        ...container.querySelectorAll(
            'input[type="checkbox"]:checked'
        )
    ].map(
        input => input.value
    );

}


restaurantForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        restaurantFormError.textContent = "";

        locationSelectionError.textContent = "";

        categorySelectionError.textContent = "";


        const name =
            restaurantNameInput.value.trim();


        const locations =
            getCheckedValues(
                locationOptions
            );


        const categories =
            getCheckedValues(
                categoryOptions
            );


        const rating =
            Number(
                restaurantRatingInput.value
            );


        if (!name) {

            restaurantFormError.textContent =
                "Please enter a restaurant name.";

            return;

        }


        if (locations.length === 0) {

            locationSelectionError.textContent =
                "Please select at least one location.";

            return;

        }


        if (categories.length === 0) {

            categorySelectionError.textContent =
                "Please select at least one category.";

            return;

        }


        if (
            Number.isNaN(rating) ||
            rating < 0 ||
            rating > 10
        ) {

            restaurantFormError.textContent =
                "Please enter a rating from 0 to 10.";

            return;

        }


        try {

            const restaurantData = {

                name,

                locations,

                categories,

                overallRating: rating,

                // Keep these fields for compatibility
                // with the original data structure.
                location:
                    locations.join(", "),

                cuisine:
                    categories.join(", ")

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


            closeModal(
                restaurantModal
            );


            await loadRestaurants();


            if (
                editingRestaurantId &&
                selectedRestaurant
            ) {

                selectedRestaurant =
                    restaurants.find(
                        restaurant =>
                            restaurant.id ===
                            editingRestaurantId
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

    }
);


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
            await getDocs(
                dishCollection
            );


        for (
            const dish
            of dishSnapshot.docs
        ) {

            await deleteDoc(
                dish.ref
            );

        }


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

function openDishModal(
    dish = null
) {

    editingDishId =
        dish
            ? dish.id
            : null;


    dishModalTitle.textContent =
        dish
            ? "Edit Dish"
            : "Add Dish";


    dishNameInput.value =
        dish?.name || "";


    dishRatingInput.value =
        dish?.rating ?? "";


    dishReviewInput.value =
        dish?.review || "";


    dishNotesInput.value =
        dish?.notes || "";


    dishFormError.textContent = "";


    dishModal.classList.remove(
        "hidden"
    );


    dishNameInput.focus();

}


dishForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        dishFormError.textContent = "";


        if (!selectedRestaurant) return;


        const name =
            dishNameInput.value.trim();


        const rating =
            Number(
                dishRatingInput.value
            );


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


            closeModal(
                dishModal
            );


            await loadDishes();

        } catch (error) {

            console.error(error);

            dishFormError.textContent =
                "Unable to save dish. Please try again.";

        }

    }
);


// ============================================================
// Delete Dish
// ============================================================

async function deleteDish(
    dishId
) {

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

    homeView.classList.remove(
        "hidden"
    );

    restaurantView.classList.add(
        "hidden"
    );

    selectedRestaurant = null;

}


document.getElementById("home-button")
    .addEventListener(
        "click",
        () => {

            showHome();

        }
    );


document.getElementById("back-button")
    .addEventListener(
        "click",
        () => {

            showHome();

        }
    );


// ============================================================
// Buttons
// ============================================================

document.getElementById(
    "add-restaurant-button"
).addEventListener(
    "click",
    () => {

        openRestaurantModal();

    }
);


document.getElementById(
    "empty-add-button"
).addEventListener(
    "click",
    () => {

        openRestaurantModal();

    }
);


document.getElementById(
    "edit-restaurant-button"
).addEventListener(
    "click",
    () => {

        if (selectedRestaurant) {

            openRestaurantModal(
                selectedRestaurant
            );

        }

    }
);


document.getElementById(
    "delete-restaurant-button"
).addEventListener(
    "click",
    () => {

        deleteRestaurant();

    }
);


document.getElementById(
    "add-dish-button"
).addEventListener(
    "click",
    () => {

        openDishModal();

    }
);


document.getElementById(
    "empty-add-dish-button"
).addEventListener(
    "click",
    () => {

        openDishModal();

    }
);


// ============================================================
// Modal controls
// ============================================================

document.querySelectorAll(
    ".modal-close"
).forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const modalId =
                button.dataset.close;

            closeModal(
                document.getElementById(
                    modalId
                )
            );

        }
    );

});


document.querySelectorAll(
    ".modal"
).forEach((modal) => {

    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === modal
            ) {

                closeModal(modal);

            }

        }
    );

});


function closeModal(modal) {

    modal.classList.add(
        "hidden"
    );

}


// ============================================================
// Basic HTML escaping
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}

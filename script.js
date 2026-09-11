/* ============================================================
   FIREBASE IMPORTS
   ============================================================ */

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


/* ============================================================
   FIREBASE CONFIGURATION
   ============================================================ */

const firebaseConfig = {
   apiKey: "AIzaSyBv3Krz0n6WHUGD3-EjLzMjl163jwWkkTA",
   authDomain: "foodlog-e1c83.firebaseapp.com",
   projectId: "foodlog-e1c83",
   storageBucket: "foodlog-e1c83.firebasestorage.app",
   messagingSenderId: "996797044798",
   appId: "1:996797044798:web:2301d5bae0e4c28e4b996f"
};


/* ============================================================
   INITIALIZE FIREBASE
   ============================================================ */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();


/* ============================================================
   APPLICATION STATE
   ============================================================ */

let currentUser = null;

let restaurants = [];

let selectedRestaurant = null;

let editingRestaurantId = null;

let editingDishId = null;

let userLocations = [];

let userCategories = [];

let userFoodCategories = [];

let dishes = [];

/* ============================================================
   DEFAULT USER LISTS
   ============================================================ */

const DEFAULT_LOCATIONS = [
    "Lansing",
    "Grand Rapids",
    "Portland",
    "Chicago"
];

const DEFAULT_CATEGORIES = [
    "Italian",
    "Steakhouse",
    "Breakfast",
    "American",
    "Mexican",
    "Pizzeria",
    "Fast Food"
];

const DEFAULT_FOOD_CATEGORIES = [
    "Burger",
    "Pizza",
    "Steak",
    "Salad",
    "Taco",
    "Quesadilla",
    "Pasta",
    "Chicken"
];

/* ============================================================
   DOM ELEMENTS
   ============================================================ */

/* Login */

const loginScreen =
    document.getElementById("login-screen");

const googleSignInButton =
    document.getElementById("google-sign-in");

const loginError =
    document.getElementById("login-error");


/* App */

const appElement =
    document.getElementById("app");

const homeButton =
    document.getElementById("home-button");

const userPhoto =
    document.getElementById("user-photo");

const userName =
    document.getElementById("user-name");

const signOutButton =
    document.getElementById("sign-out-button");

const manageListsButton =
    document.getElementById("manage-lists-button");


/* Home */

const homeView =
    document.getElementById("home-view");

const restaurantView =
    document.getElementById("restaurant-view");

const restaurantList =
    document.getElementById("restaurant-list");

const emptyState =
    document.getElementById("empty-state");

const addRestaurantButton =
    document.getElementById("add-restaurant-button");

const emptyAddButton =
    document.getElementById("empty-add-button");


/* Restaurant detail */

const backButton =
    document.getElementById("back-button");

const restaurantNameDisplay =
    document.getElementById("restaurant-name");

const restaurantLocationDisplay =
    document.getElementById("restaurant-location");

const restaurantCuisineDisplay =
    document.getElementById("restaurant-cuisine");

const restaurantRatingDisplay =
    document.getElementById("restaurant-rating");

const editRestaurantButton =
    document.getElementById("edit-restaurant-button");

const deleteRestaurantButton =
    document.getElementById("delete-restaurant-button");


/* Restaurant modal */

const restaurantModal =
    document.getElementById("restaurant-modal");

const restaurantModalTitle =
    document.getElementById("restaurant-modal-title");

const restaurantForm =
    document.getElementById("restaurant-form");

const restaurantNameInput =
    document.getElementById("restaurant-name-input");

const restaurantRatingInput =
    document.getElementById("restaurant-rating-input");

const locationOptions =
    document.getElementById("location-options");

const categoryOptions =
    document.getElementById("category-options");

const locationSelectionError =
    document.getElementById("location-selection-error");

const categorySelectionError =
    document.getElementById("category-selection-error");

const restaurantFormError =
    document.getElementById("restaurant-form-error");

const manageLocationsFromRestaurant =
    document.getElementById(
        "manage-locations-from-restaurant"
    );

const manageCategoriesFromRestaurant =
    document.getElementById(
        "manage-categories-from-restaurant"
    );


/* Lists modal */

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


const foodCategoryForm =
    document.getElementById("food-category-form");

const newFoodCategoryInput =
    document.getElementById("new-food-category-input");

const foodCategoryFormError =
    document.getElementById("food-category-form-error");

const foodCategoryList =
    document.getElementById("food-category-list");


/* Dishes */

const dishList =
    document.getElementById("dish-list");

const dishEmptyState =
    document.getElementById("dish-empty-state");

const addDishButton =
    document.getElementById("add-dish-button");

const emptyAddDishButton =
    document.getElementById("empty-add-dish-button");


/* Dish modal */

const dishModal =
    document.getElementById("dish-modal");

const dishModalTitle =
    document.getElementById("dish-modal-title");

const dishForm =
    document.getElementById("dish-form");

const dishNameInput =
    document.getElementById("dish-name-input");

const dishCategoryInput =
    document.getElementById("dish-category-input");

const dishRatingInput =
    document.getElementById("dish-rating-input");

const dishNotesInput =
    document.getElementById("dish-notes-input");

const dishCategorySelectionError =
    document.getElementById(
        "dish-category-selection-error"
    );

const dishFormError =
    document.getElementById("dish-form-error");

const manageFoodCategoriesFromDish =
    document.getElementById(
        "manage-food-categories-from-dish"
    );


/* ============================================================
   AUTHENTICATION
   ============================================================ */

googleSignInButton.addEventListener(
    "click",
    async () => {

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
                `Sign-in error: ${
                    error.code || "unknown"
                } — ${
                    error.message || "Unknown error"
                }`;
        }
    }
);


/* Sign out */

signOutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Sign-out error:",
                error
            );
        }
    }
);


/* Auth state */

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            currentUser = user;

            showApp();

            await loadUserLists();

            await loadRestaurants();

        } else {

            currentUser = null;

            restaurants = [];

            selectedRestaurant = null;

            dishes = [];

            userLocations = [];

            userCategories = [];

            userFoodCategories = [];

            showLogin();
        }
    }
);


/* ============================================================
   SCREEN MANAGEMENT
   ============================================================ */

function showLogin() {

    loginScreen.classList.remove("hidden");

    appElement.classList.add("hidden");

    homeView.classList.remove("hidden");

    restaurantView.classList.add("hidden");
}


function showApp() {

    loginScreen.classList.add("hidden");

    appElement.classList.remove("hidden");

    if (currentUser) {

        userName.textContent =
            currentUser.displayName || "";

        if (currentUser.photoURL) {

            userPhoto.src =
                currentUser.photoURL;

            userPhoto.alt =
                currentUser.displayName
                    ? `${currentUser.displayName}'s profile photo`
                    : "Profile photo";

            userPhoto.classList.remove("hidden");

        } else {

            userPhoto.removeAttribute("src");
            userPhoto.alt = "";
            userPhoto.classList.add("hidden");
        }
    }
}


/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

function cleanStringArray(values) {

    if (!Array.isArray(values)) {
        return [];
    }

    return values
        .map(value => String(value).trim())
        .filter(value => value.length > 0);
}


function getRestaurantLocations(restaurant) {

    if (Array.isArray(restaurant.locations)) {

        return cleanStringArray(
            restaurant.locations
        );
    }

    if (restaurant.location) {

        return cleanStringArray(
            String(restaurant.location).split(",")
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
            String(restaurant.cuisine).split(",")
        );
    }

    return [];
}


function getRestaurantLocationText(restaurant) {

    return getRestaurantLocations(restaurant)
        .join(" • ");
}


function getRestaurantCategoryText(restaurant) {

    return getRestaurantCategories(restaurant)
        .join(" • ");
}


function formatRating(value) {

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    return `${number.toFixed(1)} / 10`;
}


function closeModal(modal) {

    modal.classList.add("hidden");
}


/* ============================================================
   USER LISTS
   ============================================================ */

async function loadUserLists() {

    if (!currentUser) {
        return;
    }

    try {

        const settingsCollection =
            collection(
                db,
                "users",
                currentUser.uid,
                "settings"
            );

        const snapshot =
            await getDocs(
                settingsCollection
            );

        let listsData = null;

        snapshot.forEach(
            (documentSnapshot) => {

                if (
                    documentSnapshot.id === "lists"
                ) {
                    listsData =
                        documentSnapshot.data();
                }
            }
        );


        /*
         * If this user has never had their default
         * lists initialized, merge the default values
         * into whatever lists they currently have.
         *
         * This happens only once per user.
         */
        const defaultsAlreadyInitialized =
            listsData?.defaultsInitialized === true;


        if (listsData) {

            userLocations =
                cleanStringArray(
                    listsData.locations
                );

            userCategories =
                cleanStringArray(
                    listsData.categories
                );

            userFoodCategories =
                cleanStringArray(
                    listsData.foodCategories
                );

        } else {

            userLocations = [];

            userCategories = [];

            userFoodCategories = [];

        }


        /*
         * Add the default values once.
         *
         * The case-insensitive checks prevent duplicates
         * if a user already created one of these themselves.
         */
        if (!defaultsAlreadyInitialized) {

            const mergeDefaults = (
                existingValues,
                defaultValues
            ) => {

                const mergedValues = [
                    ...existingValues
                ];

                defaultValues.forEach(
                    (defaultValue) => {

                        const alreadyExists =
                            mergedValues.some(
                                value =>
                                    value.toLowerCase() ===
                                    defaultValue.toLowerCase()
                            );

                        if (!alreadyExists) {
                            mergedValues.push(
                                defaultValue
                            );
                        }
                    }
                );

                return mergedValues.sort(
                    (a, b) =>
                        a.localeCompare(b)
                );
            };


            userLocations =
                mergeDefaults(
                    userLocations,
                    DEFAULT_LOCATIONS
                );

            userCategories =
                mergeDefaults(
                    userCategories,
                    DEFAULT_CATEGORIES
                );

            userFoodCategories =
                mergeDefaults(
                    userFoodCategories,
                    DEFAULT_FOOD_CATEGORIES
                );


            /*
             * Save the merged lists and mark the defaults
             * as initialized so deleted defaults stay deleted.
             */
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
                    categories: userCategories,
                    foodCategories:
                        userFoodCategories,
                    defaultsInitialized: true
                }
            );

        }


        renderManagedLists();

        renderFoodCategoryOptions();

    } catch (error) {

        console.error(
            "Error loading user lists:",
            error
        );

    }
}

async function saveUserLists() {

    if (!currentUser) {
        return;
    }

    try {

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
                categories: userCategories,
                foodCategories:
                    userFoodCategories,
                defaultsInitialized: true
            }
        );

    } catch (error) {

        console.error(
            "Error saving user lists:",
            error
        );

        throw error;

    }
}

/* ============================================================
   MANAGED LIST RENDERING
   ============================================================ */

function renderManagedLists() {

    renderManagedList(
        locationList,
        userLocations,
        "location"
    );

    renderManagedList(
        categoryList,
        userCategories,
        "category"
    );

    renderManagedList(
        foodCategoryList,
        userFoodCategories,
        "food category"
    );
}


function renderManagedList(
    container,
    values,
    type
) {

    container.innerHTML = "";

    if (!values.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "managed-list-empty";

        empty.textContent =
            `No ${type}s added yet.`;

        container.appendChild(empty);

        return;
    }


    values.forEach(
        (value) => {

            const item =
                document.createElement("div");

            item.className =
                "managed-list-item";


            const text =
                document.createElement("span");

            text.textContent = value;


            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";

            deleteButton.className =
                "delete-list-button";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => {

                    if (type === "location") {

                        deleteLocation(value);

                    } else if (
                        type === "category"
                    ) {

                        deleteCategory(value);

                    } else {

                        deleteFoodCategory(value);
                    }
                }
            );


            item.appendChild(text);

            item.appendChild(deleteButton);

            container.appendChild(item);
        }
    );
}


/* ============================================================
   LOCATION MANAGEMENT
   ============================================================ */

locationForm.addEventListener(
    "submit",
    async (event) => {

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
                    location.toLowerCase() ===
                    value.toLowerCase()
            );

        if (exists) {

            locationFormError.textContent =
                "That location already exists.";

            return;
        }


        userLocations.push(value);

        userLocations.sort(
            (a, b) =>
                a.localeCompare(b)
        );


        try {

            await saveUserLists();

            newLocationInput.value = "";

            renderManagedLists();

        } catch (error) {

            locationFormError.textContent =
                "Could not save the location.";

            console.error(error);
        }
    }
);


async function deleteLocation(location) {

    const usedBy =
        restaurants.filter(
            restaurant =>
                getRestaurantLocations(
                    restaurant
                ).includes(location)
        );


    const confirmationMessage =
        usedBy.length > 0
            ? `"${location}" is currently used by ${
                usedBy.length
            } restaurant${
                usedBy.length === 1 ? "" : "s"
            }. Deleting it will also remove it from those restaurants. Continue?`
            : `Delete "${location}" from your location list?`;


    if (
        !confirm(
            confirmationMessage
        )
    ) {
        return;
    }


    userLocations =
        userLocations.filter(
            item => item !== location
        );


    try {

        for (
            const restaurant of usedBy
        ) {

            const updatedLocations =
                getRestaurantLocations(
                    restaurant
                ).filter(
                    item =>
                        item !== location
                );


            const restaurantRef =
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    restaurant.id
                );


            await updateDoc(
                restaurantRef,
                {
                    locations:
                        updatedLocations,

                    location:
                        updatedLocations.join(", ")
                }
            );


            restaurant.locations =
                updatedLocations;

            restaurant.location =
                updatedLocations.join(", ");
        }


        await saveUserLists();

        renderManagedLists();

        renderRestaurants();

    } catch (error) {

        console.error(
            "Error deleting location:",
            error
        );
    }
}


/* ============================================================
   RESTAURANT CATEGORY MANAGEMENT
   ============================================================ */

categoryForm.addEventListener(
    "submit",
    async (event) => {

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
                    category.toLowerCase() ===
                    value.toLowerCase()
            );

        if (exists) {

            categoryFormError.textContent =
                "That category already exists.";

            return;
        }


        userCategories.push(value);

        userCategories.sort(
            (a, b) =>
                a.localeCompare(b)
        );


        try {

            await saveUserLists();

            newCategoryInput.value = "";

            renderManagedLists();

        } catch (error) {

            categoryFormError.textContent =
                "Could not save the category.";

            console.error(error);
        }
    }
);


async function deleteCategory(category) {

    const usedBy =
        restaurants.filter(
            restaurant =>
                getRestaurantCategories(
                    restaurant
                ).includes(category)
        );


    const confirmationMessage =
        usedBy.length > 0
            ? `"${category}" is currently used by ${
                usedBy.length
            } restaurant${
                usedBy.length === 1 ? "" : "s"
            }. Deleting it will also remove it from those restaurants. Continue?`
            : `Delete "${category}" from your category list?`;


    if (
        !confirm(
            confirmationMessage
        )
    ) {
        return;
    }


    userCategories =
        userCategories.filter(
            item => item !== category
        );


    try {

        for (
            const restaurant of usedBy
        ) {

            const updatedCategories =
                getRestaurantCategories(
                    restaurant
                ).filter(
                    item =>
                        item !== category
                );


            const restaurantRef =
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    restaurant.id
                );


            await updateDoc(
                restaurantRef,
                {
                    categories:
                        updatedCategories,

                    cuisine:
                        updatedCategories.join(", ")
                }
            );


            restaurant.categories =
                updatedCategories;

            restaurant.cuisine =
                updatedCategories.join(", ");
        }


        await saveUserLists();

        renderManagedLists();

        renderRestaurants();

    } catch (error) {

        console.error(
            "Error deleting category:",
            error
        );
    }
}


/* ============================================================
   FOOD CATEGORY MANAGEMENT
   ============================================================ */

foodCategoryForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        foodCategoryFormError.textContent = "";

        const value =
            newFoodCategoryInput.value.trim();

        if (!value) {

            foodCategoryFormError.textContent =
                "Please enter a food category.";

            return;
        }


        const exists =
            userFoodCategories.some(
                category =>
                    category.toLowerCase() ===
                    value.toLowerCase()
            );

        if (exists) {

            foodCategoryFormError.textContent =
                "That food category already exists.";

            return;
        }


        userFoodCategories.push(value);

        userFoodCategories.sort(
            (a, b) =>
                a.localeCompare(b)
        );


        try {

            await saveUserLists();

            newFoodCategoryInput.value = "";

            renderManagedLists();

            /*
             * Refresh the dish dropdown as well.
             * This means a newly added category is immediately
             * available if the dish modal is opened afterward.
             */

            renderFoodCategoryOptions();

        } catch (error) {

            foodCategoryFormError.textContent =
                "Could not save the food category.";

            console.error(error);
        }
    }
);


async function deleteFoodCategory(
    foodCategory
) {

    const usedBy =
        await findDishesUsingFoodCategory(
            foodCategory
        );


    const confirmationMessage =
        usedBy.length > 0
            ? `"${foodCategory}" is currently used by ${
                usedBy.length
            } dish${
                usedBy.length === 1 ? "" : "es"
            }. Deleting it will also remove it from those dishes. Continue?`
            : `Delete "${foodCategory}" from your food category list?`;


    if (
        !confirm(
            confirmationMessage
        )
    ) {
        return;
    }


    userFoodCategories =
        userFoodCategories.filter(
            item =>
                item !== foodCategory
        );


    try {

        for (
            const dish of usedBy
        ) {

            const dishRef =
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    dish.restaurantId,
                    "dishes",
                    dish.id
                );


            await updateDoc(
                dishRef,
                {
                    foodCategory: ""
                }
            );


            if (
                selectedRestaurant &&
                selectedRestaurant.id ===
                    dish.restaurantId
            ) {

                const matchingDish =
                    dishes.find(
                        item =>
                            item.id === dish.id
                    );

                if (matchingDish) {

                    matchingDish.foodCategory =
                        "";
                }
            }
        }


        await saveUserLists();

        renderManagedLists();

        renderFoodCategoryOptions();

        renderDishes();

    } catch (error) {

        console.error(
            "Error deleting food category:",
            error
        );
    }
}


/*
 * Find every dish belonging to the current user that uses
 * the specified food category.
 *
 * This intentionally checks the user's restaurants individually
 * rather than requiring a separate global dish collection.
 */

async function findDishesUsingFoodCategory(
    foodCategory
) {

    const matches = [];

    if (!currentUser) {
        return matches;
    }


    try {

        for (
            const restaurant of restaurants
        ) {

            const dishesRef =
                collection(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    restaurant.id,
                    "dishes"
                );


            const snapshot =
                await getDocs(
                    dishesRef
                );


            snapshot.forEach(
                (dishSnapshot) => {

                    const dish =
                        dishSnapshot.data();

                    if (
                        dish.foodCategory ===
                        foodCategory
                    ) {

                        matches.push({
                            id:
                                dishSnapshot.id,

                            restaurantId:
                                restaurant.id,

                            ...dish
                        });
                    }
                }
            );
        }

    } catch (error) {

        console.error(
            "Error finding dishes using food category:",
            error
        );
    }


    return matches;
}


/* ============================================================
   RESTAURANT LISTS / DISPLAY
   ============================================================ */

async function loadRestaurants() {

    if (!currentUser) {
        return;
    }


    try {

        const restaurantsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "restaurants"
            );


        const snapshot =
            await getDocs(
                restaurantsRef
            );


        restaurants =
            snapshot.docs.map(
                documentSnapshot => ({
                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()
                })
            );


        restaurants.sort(
            (a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    )
        );


        renderRestaurants();

    } catch (error) {

        console.error(
            "Error loading restaurants:",
            error
        );
    }
}


function renderRestaurants() {

    restaurantList.innerHTML = "";


    if (!restaurants.length) {

        restaurantList.classList.add(
            "hidden"
        );

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }


    restaurantList.classList.remove(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );


    restaurants.forEach(
        restaurant => {

            const card =
                document.createElement("div");

            card.className =
                "restaurant-card";


            const name =
                document.createElement("h3");

            name.textContent =
                restaurant.name ||
                "Unnamed Restaurant";


            const location =
                document.createElement("p");

            location.className =
                "card-location";

            location.textContent =
                getRestaurantLocationText(
                    restaurant
                );


            const cuisine =
                document.createElement("p");

            cuisine.className =
                "card-cuisine";

            cuisine.textContent =
                getRestaurantCategoryText(
                    restaurant
                );


            const bottom =
                document.createElement("div");

            bottom.className =
                "card-bottom";


            const rating =
                document.createElement("span");

            rating.className =
                "card-rating";

            rating.textContent =
                formatRating(
                    restaurant.overallRating
                );


            const dishesCount =
                document.createElement("span");

            dishesCount.className =
                "card-dishes";

            dishesCount.textContent =
                "View dishes";


            bottom.appendChild(rating);

            bottom.appendChild(dishesCount);


            card.appendChild(name);

            if (
                getRestaurantLocationText(
                    restaurant
                )
            ) {
                card.appendChild(location);
            }

            if (
                getRestaurantCategoryText(
                    restaurant
                )
            ) {
                card.appendChild(cuisine);
            }

            card.appendChild(bottom);


            card.addEventListener(
                "click",
                () => {
                    openRestaurant(
                        restaurant.id
                    );
                }
            );


            restaurantList.appendChild(card);
        }
    );
}


/* ============================================================
   RESTAURANT MODAL
   ============================================================ */

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
        restaurant?.overallRating ??
        "";


    locationSelectionError.textContent =
        "";

    categorySelectionError.textContent =
        "";

    restaurantFormError.textContent =
        "";


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


    /*
     * Delay focus until after the modal has been
     * displayed. This is more reliable on mobile browsers.
     */

    requestAnimationFrame(
        () => {

            try {

                restaurantNameInput.focus();

            } catch (error) {

                console.warn(
                    "Could not focus restaurant name input.",
                    error
                );
            }
        }
    );
}


/* Location checkbox options */

function renderLocationOptions(
    selectedLocations = []
) {

    locationOptions.innerHTML = "";


    if (!userLocations.length) {

        const empty =
            document.createElement("p");

        empty.className =
            "field-error";

        empty.textContent =
            "No locations have been created yet. Use Manage locations below to add one.";

        locationOptions.appendChild(
            empty
        );

        return;
    }


    userLocations.forEach(
        (location, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "multi-select-option";


            const input =
                document.createElement("input");

            input.type = "checkbox";

            input.id =
                `restaurant-location-${index}`;

            input.name =
                "restaurant-location";

            input.value =
                location;

            input.checked =
                selectedLocations.includes(
                    location
                );


            const label =
                document.createElement("label");

            label.htmlFor =
                input.id;

            label.textContent =
                location;


            wrapper.appendChild(input);

            wrapper.appendChild(label);

            locationOptions.appendChild(
                wrapper
            );
        }
    );
}


/* Restaurant category checkbox options */

function renderCategoryOptions(
    selectedCategories = []
) {

    categoryOptions.innerHTML = "";


    if (!userCategories.length) {

        const empty =
            document.createElement("p");

        empty.className =
            "field-error";

        empty.textContent =
            "No cuisine/categories have been created yet. Use Manage categories below to add one.";

        categoryOptions.appendChild(
            empty
        );

        return;
    }


    userCategories.forEach(
        (category, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "multi-select-option";


            const input =
                document.createElement("input");

            input.type = "checkbox";

            input.id =
                `restaurant-category-${index}`;

            input.name =
                "restaurant-category";

            input.value =
                category;

            input.checked =
                selectedCategories.includes(
                    category
                );


            const label =
                document.createElement("label");

            label.htmlFor =
                input.id;

            label.textContent =
                category;


            wrapper.appendChild(input);

            wrapper.appendChild(label);

            categoryOptions.appendChild(
                wrapper
            );
        }
    );
}


/* ============================================================
   ADD / EDIT RESTAURANT
   ============================================================ */

restaurantForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        locationSelectionError.textContent =
            "";

        categorySelectionError.textContent =
            "";

        restaurantFormError.textContent =
            "";


        const name =
            restaurantNameInput.value.trim();


        const rating =
            Number(
                restaurantRatingInput.value
            );


        const selectedLocations =
            Array.from(
                document.querySelectorAll(
                    'input[name="restaurant-location"]:checked'
                )
            ).map(
                input =>
                    input.value
            );


        const selectedCategories =
            Array.from(
                document.querySelectorAll(
                    'input[name="restaurant-category"]:checked'
                )
            ).map(
                input =>
                    input.value
            );


        let hasError = false;


        if (!name) {

            restaurantFormError.textContent =
                "Please enter a restaurant name.";

            hasError = true;
        }


        if (!selectedLocations.length) {

            locationSelectionError.textContent =
                "Please select at least one location.";

            hasError = true;
        }


        if (!selectedCategories.length) {

            categorySelectionError.textContent =
                "Please select at least one cuisine/category.";

            hasError = true;
        }


        if (
            Number.isNaN(rating) ||
            rating < 0 ||
            rating > 10
        ) {

            restaurantFormError.textContent =
                "Please enter a rating between 0 and 10.";

            hasError = true;
        }


        if (hasError) {
            return;
        }


        const restaurantData = {

            name,

            locations:
                selectedLocations,

            categories:
                selectedCategories,

            /*
             * These two fields preserve compatibility with
             * the older version of the database.
             */

            location:
                selectedLocations.join(", "),

            cuisine:
                selectedCategories.join(", "),

            overallRating:
                rating
        };


        try {

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


                const index =
                    restaurants.findIndex(
                        restaurant =>
                            restaurant.id ===
                            editingRestaurantId
                    );


                if (index !== -1) {

                    restaurants[index] = {

                        ...restaurants[index],

                        ...restaurantData
                    };
                }


                if (
                    selectedRestaurant &&
                    selectedRestaurant.id ===
                        editingRestaurantId
                ) {

                    selectedRestaurant = {

                        ...selectedRestaurant,

                        ...restaurantData
                    };
                }


            } else {

                const restaurantsRef =
                    collection(
                        db,
                        "users",
                        currentUser.uid,
                        "restaurants"
                    );


                const documentReference =
                    await addDoc(
                        restaurantsRef,
                        restaurantData
                    );


                restaurants.push({

                    id:
                        documentReference.id,

                    ...restaurantData
                });
            }


            closeModal(
                restaurantModal
            );


            renderRestaurants();


            /*
             * If editing the restaurant currently being viewed,
             * refresh the detail view immediately.
             */

            if (
                selectedRestaurant &&
                editingRestaurantId ===
                    selectedRestaurant.id
            ) {

                renderSelectedRestaurant();
            }


        } catch (error) {

            console.error(
                "Error saving restaurant:",
                error
            );

            restaurantFormError.textContent =
                "Could not save the restaurant. Please try again.";
        }
    }
);


/* ============================================================
   RESTAURANT NAVIGATION
   ============================================================ */

addRestaurantButton.addEventListener(
    "click",
    () => {
        openRestaurantModal();
    }
);


emptyAddButton.addEventListener(
    "click",
    () => {
        openRestaurantModal();
    }
);


homeButton.addEventListener(
    "click",
    () => {
        showHomeView();
    }
);


backButton.addEventListener(
    "click",
    () => {
        showHomeView();
    }
);


function showHomeView() {

    restaurantView.classList.add(
        "hidden"
    );

    homeView.classList.remove(
        "hidden"
    );

    selectedRestaurant = null;

    dishes = [];
}


async function openRestaurant(
    restaurantId
) {

    const restaurant =
        restaurants.find(
            item =>
                item.id ===
                restaurantId
        );


    if (!restaurant) {
        return;
    }


    selectedRestaurant =
        restaurant;


    homeView.classList.add(
        "hidden"
    );

    restaurantView.classList.remove(
        "hidden"
    );


    renderSelectedRestaurant();

    await loadDishes(
        restaurantId
    );
}


function renderSelectedRestaurant() {

    if (!selectedRestaurant) {
        return;
    }


    restaurantNameDisplay.textContent =
        selectedRestaurant.name ||
        "Unnamed Restaurant";


    restaurantLocationDisplay.textContent =
        getRestaurantLocationText(
            selectedRestaurant
        );


    restaurantCuisineDisplay.textContent =
        getRestaurantCategoryText(
            selectedRestaurant
        );


    restaurantRatingDisplay.textContent =
        formatRating(
            selectedRestaurant.overallRating
        );
}


/* ============================================================
   EDIT / DELETE RESTAURANT
   ============================================================ */

editRestaurantButton.addEventListener(
    "click",
    () => {

        if (selectedRestaurant) {

            openRestaurantModal(
                selectedRestaurant
            );
        }
    }
);


deleteRestaurantButton.addEventListener(
    "click",
    async () => {

        if (!selectedRestaurant) {
            return;
        }


        const confirmed =
            confirm(
                `Delete "${selectedRestaurant.name}"? This will also delete all dishes logged for this restaurant.`
            );


        if (!confirmed) {
            return;
        }


        try {

            /*
             * Delete all dishes first.
             */

            const dishesRef =
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
                    dishesRef
                );


            for (
                const dishDocument of
                dishSnapshot.docs
            ) {

                await deleteDoc(
                    dishDocument.ref
                );
            }


            /*
             * Delete restaurant.
             */

            const restaurantRef =
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    selectedRestaurant.id
                );


            await deleteDoc(
                restaurantRef
            );


            restaurants =
                restaurants.filter(
                    restaurant =>
                        restaurant.id !==
                        selectedRestaurant.id
                );


            selectedRestaurant = null;

            dishes = [];


            renderRestaurants();

            showHomeView();


        } catch (error) {

            console.error(
                "Error deleting restaurant:",
                error
            );

            alert(
                "Could not delete the restaurant. Please try again."
            );
        }
    }
);


/* ============================================================
   DISHES
   ============================================================ */

async function loadDishes(
    restaurantId
) {

    if (!currentUser) {
        return;
    }


    try {

        const dishesRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "restaurants",
                restaurantId,
                "dishes"
            );


        const snapshot =
            await getDocs(
                dishesRef
            );


        dishes =
            snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()
                })
            );


        dishes.sort(
            (a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    )
        );


        renderDishes();

    } catch (error) {

        console.error(
            "Error loading dishes:",
            error
        );
    }
}


function renderDishes() {

    dishList.innerHTML = "";


    if (!dishes.length) {

        dishList.classList.add(
            "hidden"
        );

        dishEmptyState.classList.remove(
            "hidden"
        );

        return;
    }


    dishList.classList.remove(
        "hidden"
    );

    dishEmptyState.classList.add(
        "hidden"
    );


    dishes.forEach(
        dish => {

            const card =
                document.createElement("div");

            card.className =
                "dish-card";


            const header =
                document.createElement("div");

            header.className =
                "dish-card-header";


            const titleContainer =
                document.createElement("div");


            const name =
                document.createElement("h3");

            name.textContent =
                dish.name ||
                "Unnamed Dish";


            const category =
                document.createElement("span");

            category.className =
                "dish-category";

            category.textContent =
                dish.foodCategory ||
                "Uncategorized";


            titleContainer.appendChild(
                name
            );

            titleContainer.appendChild(
                category
            );


            const rating =
                document.createElement("span");

            rating.className =
                "dish-rating";

            rating.textContent =
                formatRating(
                    dish.rating
                );


            header.appendChild(
                titleContainer
            );

            header.appendChild(
                rating
            );


            card.appendChild(
                header
            );


            if (
                dish.notes &&
                String(dish.notes).trim()
            ) {

                const notes =
                    document.createElement("p");

                notes.className =
                    "dish-notes";

                notes.textContent =
                    dish.notes;

                card.appendChild(
                    notes
                );
            }


            const actions =
                document.createElement("div");

            actions.className =
                "dish-actions";


            const editButton =
                document.createElement("button");

            editButton.type = "button";

            editButton.className =
                "secondary-button small-button";

            editButton.textContent =
                "✎ Edit";


            editButton.addEventListener(
                "click",
                () => {
                    openDishModal(dish);
                }
            );


            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";

            deleteButton.className =
                "danger-button small-button";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => {
                    deleteDish(dish);
                }
            );


            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );


            card.appendChild(
                actions
            );


            dishList.appendChild(
                card
            );
        }
    );
}


/* ============================================================
   DISH MODAL
   ============================================================ */

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


    dishNotesInput.value =
        dish?.notes || "";


    dishCategorySelectionError.textContent =
        "";

    dishFormError.textContent =
        "";


    renderFoodCategoryOptions(
        dish?.foodCategory || ""
    );


    dishModal.classList.remove(
        "hidden"
    );


    requestAnimationFrame(
        () => {

            try {

                dishNameInput.focus();

            } catch (error) {

                console.warn(
                    "Could not focus dish name input.",
                    error
                );
            }
        }
    );
}


/*
 * Render the dish category dropdown.
 *
 * If an existing dish has a category that has since been removed
 * from the user's list, it is still temporarily displayed so that
 * editing that dish does not silently lose its existing value.
 */

function renderFoodCategoryOptions(
    selectedCategory = ""
) {

    dishCategoryInput.innerHTML = "";


    const placeholder =
        document.createElement("option");

    placeholder.value = "";

    placeholder.textContent =
        "Select a category";

    dishCategoryInput.appendChild(
        placeholder
    );


    const categories =
        [...userFoodCategories];


    if (
        selectedCategory &&
        !categories.includes(
            selectedCategory
        )
    ) {

        categories.push(
            selectedCategory
        );
    }


    categories.sort(
        (a, b) =>
            a.localeCompare(b)
    );


    categories.forEach(
        category => {

            const option =
                document.createElement("option");

            option.value =
                category;

            option.textContent =
                category;

            dishCategoryInput.appendChild(
                option
            );
        }
    );


    dishCategoryInput.value =
        selectedCategory || "";
}


/* ============================================================
   ADD / EDIT DISH
   ============================================================ */

addDishButton.addEventListener(
    "click",
    () => {
        openDishModal();
    }
);


emptyAddDishButton.addEventListener(
    "click",
    () => {
        openDishModal();
    }
);


dishForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        dishCategorySelectionError.textContent =
            "";

        dishFormError.textContent =
            "";


        if (!selectedRestaurant) {

            dishFormError.textContent =
                "No restaurant is currently selected.";

            return;
        }


        const name =
            dishNameInput.value.trim();


        const foodCategory =
            dishCategoryInput.value.trim();


        const rating =
            Number(
                dishRatingInput.value
            );


        const notes =
            dishNotesInput.value.trim();


        let hasError = false;


        if (!name) {

            dishFormError.textContent =
                "Please enter a dish name.";

            hasError = true;
        }


        if (!foodCategory) {

            dishCategorySelectionError.textContent =
                "Please select a food category.";

            hasError = true;
        }


        if (
            Number.isNaN(rating) ||
            rating < 0 ||
            rating > 10
        ) {

            dishFormError.textContent =
                "Please enter a rating between 0 and 10.";

            hasError = true;
        }


        if (hasError) {
            return;
        }


        const dishData = {

            name,

            foodCategory,

            rating,

            notes
        };


        try {

            const dishesRef =
                collection(
                    db,
                    "users",
                    currentUser.uid,
                    "restaurants",
                    selectedRestaurant.id,
                    "dishes"
                );


            if (editingDishId) {

                const dishRef =
                    doc(
                        db,
                        "users",
                        currentUser.uid,
                        "restaurants",
                        selectedRestaurant.id,
                        "dishes",
                        editingDishId
                    );


                await updateDoc(
                    dishRef,
                    dishData
                );


                const index =
                    dishes.findIndex(
                        dish =>
                            dish.id ===
                            editingDishId
                    );


                if (index !== -1) {

                    dishes[index] = {

                        ...dishes[index],

                        ...dishData
                    };
                }


            } else {

                const documentReference =
                    await addDoc(
                        dishesRef,
                        dishData
                    );


                dishes.push({

                    id:
                        documentReference.id,

                    ...dishData
                });
            }


            closeModal(
                dishModal
            );


            renderDishes();


        } catch (error) {

            console.error(
                "Error saving dish:",
                error
            );

            dishFormError.textContent =
                "Could not save the dish. Please try again.";
        }
    }
);


/* ============================================================
   DELETE DISH
   ============================================================ */

async function deleteDish(
    dish
) {

    if (!selectedRestaurant) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${dish.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const dishRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "restaurants",
                selectedRestaurant.id,
                "dishes",
                dish.id
            );


        await deleteDoc(
            dishRef
        );


        dishes =
            dishes.filter(
                item =>
                    item.id !==
                    dish.id
            );


        renderDishes();


    } catch (error) {

        console.error(
            "Error deleting dish:",
            error
        );

        alert(
            "Could not delete the dish. Please try again."
        );
    }
}


/* ============================================================
   MANAGE LISTS MODAL
   ============================================================ */

manageListsButton.addEventListener(
    "click",
    () => {

        renderManagedLists();

        listsModal.classList.remove(
            "hidden"
        );
    }
);


/*
 * These buttons intentionally close the current modal and open
 * Manage Lists. This matches the behavior of the existing
 * restaurant list-management buttons.
 */

manageLocationsFromRestaurant.addEventListener(
    "click",
    () => {

        closeModal(
            restaurantModal
        );

        renderManagedLists();

        listsModal.classList.remove(
            "hidden"
        );
    }
);


manageCategoriesFromRestaurant.addEventListener(
    "click",
    () => {

        closeModal(
            restaurantModal
        );

        renderManagedLists();

        listsModal.classList.remove(
            "hidden"
        );
    }
);


manageFoodCategoriesFromDish.addEventListener(
    "click",
    () => {

        closeModal(
            dishModal
        );

        renderManagedLists();

        listsModal.classList.remove(
            "hidden"
        );
    }
);


/* ============================================================
   MODAL CLOSE BUTTONS
   ============================================================ */

document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const modalId =
                        button.dataset.close;

                    const modal =
                        document.getElementById(
                            modalId
                        );


                    if (modal) {

                        closeModal(
                            modal
                        );
                    }
                }
            );
        }
    );


/* ============================================================
   CLOSE MODALS BY CLICKING OUTSIDE
   ============================================================ */

restaurantModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            restaurantModal
        ) {

            closeModal(
                restaurantModal
            );
        }
    }
);


listsModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            listsModal
        ) {

            closeModal(
                listsModal
            );
        }
    }
);


dishModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            dishModal
        ) {

            closeModal(
                dishModal
            );
        }
    }
);


/* ============================================================
   ESCAPE KEY
   ============================================================ */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {
            return;
        }


        closeModal(
            restaurantModal
        );

        closeModal(
            listsModal
        );

        closeModal(
            dishModal
        );
    }
);

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';
/* 
// global state of the app
    -search object
    -current recipe object
    -shopping list object
    -liked recipes

*/
const state ={};
window.state = state;

///////////////////////////////
// SEARCH CONTROLLER
///////////////////////////////

const controlSearch = async () =>{
    // 1. get query from view
    const query = searchView.getInput(); //TODO
    // console.log(query);

    if (query){

        // 2. new search obj and add to state
        state.search = new Search(query);

        // 3. prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);


        try {
            // 4. search for recipes
            await state.search.getResults();

            // 5. render result on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('something went wrong!!');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchRes.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


////////////////////////////
// RECIPE CONTROLLER
////////////////////////////

// const r = new Recipe(47746);
// r.getRecipe();
// console.log(r);

const controlRecipe = async () => {
    // Get ID from the url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // Prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingridents
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        } catch (err) {
            alert('Error processing recipe!');
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


////////////////////////////////
// LIST CONTROLLER
////////////////////////////////

const controlList = () =>{
    // create a new list if there is none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

/////////////////////////////
// LIKES CONTROLLER
/////////////////////////////

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID =state.recipe.id;

    // User has NOT liked current recipe yet
    if(!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // toggle the like button

        // add like to the UI list
        console.log(state.likes);
        
    // User has liked current recipe
    } else{
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // toggle the like button

        // add like to the UI list
        console.log(state.likes);

    }
};


// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);
        
    } else if (e.target.matches('.shopping__count-value')) { //handle the count update
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


// handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease btn is clicked
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }    

    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        // increase btn is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();

    }
    console.log(state.recipe);
});

window.l = new List();


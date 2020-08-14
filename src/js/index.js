import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';
/* 
// global state of the app
    -search object
    -current recipe object
    -shopping list object
    -liked recipes

*/
const state ={};

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
    }
    console.log(state.recipe);
});

window.l = new List();


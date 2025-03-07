import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
  combineReducers,
} from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";
import itemsReducer from "./items";
import favoriteReducer from "./favorite";
import reviewReducer from "./reviews";
import orderReducer from "./orders";
import cartReducer from "./cart";

const rootReducer = combineReducers({
  session: sessionReducer,
  items: itemsReducer,
  favorites: favoriteReducer,
  reviews: reviewReducer,
  orders:orderReducer,
  cart:cartReducer
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;

// ACTION TYPES
const FETCH_REVIEWS = 'FETCH_REVIEWS';
const ADD_REVIEW = 'ADD_REVIEW';
const UPDATE_REVIEW = 'UPDATE_REVIEW';
const DELETE_REVIEW = 'DELETE_REVIEW';




// THUNKS
export const fetchReviews = (itemId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/items/${itemId}/reviews`);
    if (!response.ok) {
      const data = await response.json();
      if (response.status === 404) {
        // If no reviews, set empty array
        dispatch({ type: FETCH_REVIEWS, payload: [] });
        return;
      }
      throw new Error(data.message);
    }
    const reviews = await response.json();
    dispatch({ type: FETCH_REVIEWS, payload: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    dispatch({ type: FETCH_REVIEWS, payload: [] });
  }
};

  export const fetchCurrentUserReviews = () => async (dispatch) => {
    try {
      const response = await fetch('/api/reviews/current', { method: 'GET' });
      const reviews = await response.json();
      dispatch({ type: FETCH_REVIEWS, payload: reviews });
    } catch (error) {
      console.error('Error fetching current user reviews:', error);
    }
  };
  
  export const addReview = (itemId, reviewData) => async (dispatch) => {
    try {
      const response = await fetch(`/api/items/${itemId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Ensure cookies (session) are sent with the request
        body: JSON.stringify(reviewData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add review');
      }
  
      const newReview = await response.json();
      dispatch({ type: ADD_REVIEW, payload: newReview });
      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  };
  
  
  export const updateReview = (id, reviewData) => async (dispatch) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      const updatedReview = await response.json();
      dispatch({ type: UPDATE_REVIEW, payload: updatedReview });
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };
  
  export const deleteReview = (id) => async (dispatch) => {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      dispatch({ type: DELETE_REVIEW, payload: id });
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const initialState = {
    reviews: [],
    isLoading: false,
    error: null
  };
  

  
  const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_REVIEWS:
      return {
        ...state,
        reviews: action.payload,
        isLoading: false,
        error: null
      };
      case ADD_REVIEW:
        return {
          ...state,
          reviews: [...state.reviews, action.payload],
        };
      case UPDATE_REVIEW:
        return {
          ...state,
          reviews: state.reviews.map((review) =>
            review.id === action.payload.id ? action.payload : review
          ),
        };
      case DELETE_REVIEW:
        return {
          ...state,
          reviews: state.reviews.filter((review) => review.id !== action.payload),
        };
      default:
        return state;
    }
  };
  
  export default reviewReducer;
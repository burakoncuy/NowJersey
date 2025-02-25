import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem } from '../../redux/items';
import { fetchReviews } from '../../redux/reviews';
import { addFavoriteItem, removeFavoriteItem, getFavorites } from '../../redux/favorite';
import { addToCart, fetchCart } from '../../redux/cart';
import './ItemDetail.css';

const ItemDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const { item, notFound, error } = useSelector(state => state.items);
  const reviews = useSelector(state => state.reviews.reviews);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const user = useSelector((state) => state.session?.user);
  const favorites = useSelector(state => state.favorites.favorites);

  useEffect(() => {
    const loadInitialData = async () => {
      if (id) {
        if (user) {
          await dispatch(fetchCart());
        }
        await dispatch(getItem(id));
        await dispatch(fetchReviews(id));
        await dispatch(getFavorites());
      }
    };
    loadInitialData();
  }, [dispatch, id, user]);

  const isFavorite = favorites.some(fav => fav.id === item?.id);
  
  // Check if the current user is the owner of this item
  const isOwner = user && item && user.id === item.user_id;

  const handleFavoriteToggle = () => {
    if (!item) return;
    if (isFavorite) {
      dispatch(removeFavoriteItem(item.id)).then(() => {
        dispatch(getFavorites());
      });
    } else {
      dispatch(addFavoriteItem(item.id)).then(() => {
        dispatch(getFavorites());
      });
    }
  };

  const handleAddReview = () => {
    navigate(`/items/${item.id}/reviews`);
  };

  const handleAddToCart = async (itemId, itemStatus) => {
    if (itemStatus !== 'SOLD' && !cartItems.some(cartItem => cartItem.item_id === itemId)) {
      try {
        await dispatch(addToCart(itemId, 1));
        await dispatch(fetchCart());
      } catch (error) {
        console.error('Failed to add item to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

  if (notFound) {
    return <div className="item-detail-error">Item not found</div>;
  }

  if (error) {
    return <div className="item-detail-error">Error: {error}</div>;
  }

  if (!item) {
    return <div className="item-detail-loading">Loading...</div>;
  }

  const inCart = cartItems.some(cartItem => cartItem.item_id === item.id);

  return (
    <div className="item-detail-container">
      <div className="item-detail-content">
        <img src={item.image_url} alt={item.name} className="item-detail-image" />

        <div className="item-detail-info">
          <h1 className="item-detail-name">{item.name}</h1>
          <p className="item-detail-description">{item.description}</p>
          <p className="item-detail-price">Price: ${item.price}</p>
          <p className="item-detail-category">Category: {item.category}</p>
          <p className="item-detail-condition">Condition: {item.condition}</p>
          <p className="item-detail-size">Size: {item.size}</p>
          <p className={`item-detail-status ${item.item_status === 'SOLD' ? 'sold' : 'available'}`}>
            Status: {item.item_status}
          </p>

          <div className="item-detail-actions">
            <button className="favorite-button" onClick={handleFavoriteToggle}>
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>

            <button 
              className="review-button" 
              onClick={handleAddReview}
              disabled={isOwner}
              title={isOwner ? "You cannot review your own item" : ""}
            >
              {isOwner ? 'Your Item' : 'Add Review'}
            </button>

            <button 
              className="add-to-cart-button"
              onClick={() => handleAddToCart(item.id, item.item_status)}
              disabled={item.item_status === 'SOLD' || inCart || isOwner}
              title={isOwner ? "You cannot add your own item to cart" : ""}
            >
              {item.item_status === 'SOLD' 
                ? 'Sold Out' 
                : isOwner 
                  ? 'Your Item' 
                  : inCart 
                    ? 'Item in Cart' 
                    : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h3 className="reviews-heading">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="no-reviews">
            {!user 
              ? 'Login to add a review!' 
              : isOwner 
                ? 'You cannot review your own item' 
                : 'Be the first to add one!'}
          </p>
        ) : (
          <ul className="review-list">
            {reviews.map((review) => (
              <li key={review.id} className="review-item">
                <div className="review-header">
                  <p className="review-author"><strong>{review.user_name}</strong></p>
                  <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="review-rating">Rating: {review.rating} / 5</div>
                <p className="review-comment">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
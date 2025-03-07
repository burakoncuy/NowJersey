import { useEffect, useState } from 'react';
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
  const [showCartConfirmation, setShowCartConfirmation] = useState(false);
  const [quantity, setQuantity] = useState(1); // New state for quantity

  const { item, notFound, error } = useSelector(state => state.items);
  const reviews = useSelector(state => state.reviews.reviews);
  const cartItems = useSelector(state => state.cart.cartItems);
  const user = useSelector(state => state.session?.user);
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
  const isOwner = user && item && user.id === item.user_id;

  const handleFavoriteToggle = () => {
    if (!item) return;
    if (isFavorite) {
      dispatch(removeFavoriteItem(item.id)).then(() => dispatch(getFavorites()));
    } else {
      dispatch(addFavoriteItem(item.id)).then(() => dispatch(getFavorites()));
    }
  };

  // const handleAddReview = () => {
  //   navigate(`/items/${item.id}/reviews`);
  // };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length > 0) {
      const existingSellerId = cartItems[0].item.user_id;
      if (existingSellerId !== item.user_id) {
        alert("You can only add items from one seller at a time. Please clear your cart first.");
        return;
      }
    }

    if (item.item_status !== 'SOLD') {
      try {
        await dispatch(addToCart(item.id, quantity));
        await dispatch(fetchCart());

        setShowCartConfirmation(true);
        setTimeout(() => setShowCartConfirmation(false), 3000);
      } catch (error) {
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

   // Star Rating component
   const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          const starValue = index + 1;
          return (
            <span 
              key={index} 
              className={`star ${starValue <= rating ? 'filled' : 'empty'}`}
            >
              {starValue <= rating ? '★' : '☆'}
            </span>
          );
        })}
      </div>
    );
  };
  
  if (notFound) return <div className="item-detail-error">Item not found</div>;
  if (error) return <div className="item-detail-error">Error: {error}</div>;
  if (!item) return <div className="item-detail-loading">Loading...</div>;

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

          {/* Show quantity selector only if the item condition is NEW */}
          {item.condition === 'NEW' && (
            <div className="quantity-selector">
              <button className="quantity-btn" onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
              <span>{quantity}</span>
              <button className="quantity-btn" onClick={increaseQuantity}>+</button>
            </div>
          )}

          <div className="item-detail-actions">
            <button className="favorite-button" onClick={handleFavoriteToggle}>
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>

            <button 
              className="review-button" 
              onClick={() => navigate(`/items/${item.id}/reviews`)}
              disabled={isOwner}
              title={isOwner ? "You cannot review your own item" : ""}
            >
              {isOwner ? 'Your Item' : 'Add Review'}
            </button>

            <button 
              className="add-to-cart-button"
              onClick={handleAddToCart}
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
            
            {showCartConfirmation && (
              <div className="cart-confirmation-message">
                Item added to cart successfully!
              </div>
            )}
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
                <div className="review-rating">
                  <StarRating rating={review.rating} />
                </div>
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

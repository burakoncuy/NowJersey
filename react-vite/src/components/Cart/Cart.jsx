import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart, updateCartItem } from '../../redux/cart'; // Assuming you have an action for updating cart items
import { checkout } from '../../redux/orders';
import './Cart.css'; // Importing the CSS file for styles

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      await dispatch(fetchCart());
      setLoading(false);
    };

    loadCart();
  }, [dispatch]);

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  // Handle increasing/decreasing item quantity
  const handleQuantityChange = (itemId, quantity) => {
    if (quantity < 1) return; // Prevent going below 1
    dispatch(updateCartItem(itemId, quantity));
  };

  if (loading) {
    return <div className="cart__loading-message">Loading your cart...</div>;
  }

  if (!Array.isArray(cartItems)) {
    console.error('cartItems is not an array:', cartItems);
    return <div className="cart__error-message">Error: Cart data is invalid.</div>;
  }

  if (cartItems.length === 0) {
    return <div className="cart__empty-message">Your cart is empty.</div>;
  }

  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.item?.price || 0) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    dispatch(checkout());
  };

  return (
    <div className="cart__container">
      <h2 className="cart__heading">Your Cart</h2>
      <ul className="cart__list">
        {cartItems.map((item) => (
          <li key={item.id} className="cart__item-card">
            <div className="cart__item-image-container">
              <img
                src={item.item.image_url}
                alt={item.item.name}
                className="cart__item-image"
              />
            </div>
            <div className="cart__item-info">
              <p className="cart__item-name">{item.item.name} - ${item.item.price}</p>
              <div className="cart__item-actions">
                {/* Show quantity controls for NEW items */}
                {item.item.condition === 'NEW' && (
                  <div className="cart__quantity-selector">
                    <button 
                      onClick={() => handleQuantityChange(item.item_id, item.quantity - 1)} 
                      disabled={item.quantity <= 1}
                      className="cart__quantity-btn"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)} 
                      className="cart__quantity-btn"
                    >
                      +
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => handleRemoveItem(item.item_id)} 
                  className="cart__remove-button"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart__total">
        <h3 className="cart__total-price">Total Price: ${totalPrice.toFixed(2)}</h3>
      </div>

      <button 
        onClick={handleCheckout} 
        disabled={cartItems.length === 0}
        className="cart__checkout-button"
      >
        Place Order
      </button>
    </div>
  );
};

export default Cart;

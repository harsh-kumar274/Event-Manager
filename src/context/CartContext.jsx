import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    event: null,
    quantity: 1,
    registration: null,
  });

  const setCheckoutEvent = (event, quantity = 1) => {
    setCart({ event, quantity, registration: null });
  };

  const setRegistration = (registration) => {
    setCart(prev => ({ ...prev, registration }));
  };

  const clearCart = () => setCart({ event: null, quantity: 1, registration: null });

  return (
    <CartContext.Provider value={{ cart, setCheckoutEvent, setRegistration, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [tableId, setTableId] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);

  const addItem = useCallback((menu) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menu_id === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.menu_id === menu.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        menu_id: menu.id,
        nama: menu.nama,
        harga: parseFloat(menu.harga),
        gambar: menu.gambar,
        quantity: 1,
        note: '',
      }];
    });
  }, []);

  const removeItem = useCallback((menuId) => {
    setItems((prev) => prev.filter((item) => item.menu_id !== menuId));
  }, []);

  const updateQuantity = useCallback((menuId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.menu_id !== menuId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.menu_id === menuId ? { ...item, quantity } : item
      )
    );
  }, []);

  const updateNote = useCallback((menuId, note) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menu_id === menuId ? { ...item, note } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.harga * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, tableId, tableNumber, totalItems, totalPrice,
      setTableId, setTableNumber,
      addItem, removeItem, updateQuantity, updateNote, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

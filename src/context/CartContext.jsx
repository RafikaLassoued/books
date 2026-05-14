import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bookstore_cart')) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('bookstore_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (book) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === book.id)
      if (existing) return prev.map(i => i.id === book.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...book, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id)
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const clearCart = () => setCart([])

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

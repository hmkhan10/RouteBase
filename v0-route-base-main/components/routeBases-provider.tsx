"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react"
import type { RouteBasesState, RouteBasesAction, CartItem, OrderHistory, InventoryLevels } from "@/lib/types"

const initialState: RouteBasesState = {
  cartItems: [],
  inventoryLevels: {
    "prod-1": 10,
    "prod-2": 5,
    "prod-3": 0,
    "prod-4": 15,
    "prod-5": 2,
  },
  orderHistory: [],
  isCheckingOut: false,
}

const routeBasesReducer = (state: RouteBasesState, action: RouteBasesAction): RouteBasesState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.cartItems.findIndex((item: CartItem) => item.productId === action.payload.productId)
      
      if (existingItemIndex >= 0) {
        const existingItem = state.cartItems[existingItemIndex]
        const newQuantity = existingItem.quantity + action.payload.quantity
        const availableStock = state.inventoryLevels[action.payload.productId] || 0
        
        if (newQuantity > availableStock) {
          return state
        }
        
        const updatedCartItems = [...state.cartItems]
        updatedCartItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        }
        return { ...state, cartItems: updatedCartItems }
      }
      
      const availableStock = state.inventoryLevels[action.payload.productId] || 0
      if (action.payload.quantity > availableStock) {
        return state
      }
      
      return { ...state, cartItems: [...state.cartItems, action.payload] }
    }
    
    case "REMOVE_ITEM":
      return {
        ...state,
        cartItems: state.cartItems.filter((item: CartItem) => item.productId !== action.payload)
      }
    
    case "UPDATE_QUANTITY": {
      const availableStock = state.inventoryLevels[action.payload.productId] || 0
      if (action.payload.quantity > availableStock) {
        return state
      }
      
      return {
        ...state,
        cartItems: state.cartItems.map((item: CartItem) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    }
    
    case "CLEAR_CART":
      return { ...state, cartItems: [] }
    
    case "START_CHECKOUT":
      return { ...state, isCheckingOut: true }
    
    case "END_CHECKOUT":
      return { ...state, isCheckingOut: false }
    
    case "CONFIRM_ORDER":
      return {
        ...state,
        cartItems: [],
        orderHistory: [...state.orderHistory, action.payload],
        isCheckingOut: false
      }
    
    case "LOAD_STATE":
      return action.payload
    
    case "SET_INVENTORY":
      return { ...state, inventoryLevels: action.payload }
    
    default:
      return state
  }
}

interface RouteBasesContextType {
  state: RouteBasesState
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  simulatePaymentSuccess: (orderData: Omit<OrderHistory, "id" | "createdAt">) => void
  startCheckout: () => void
  endCheckout: () => void
  getStockLevel: (productId: string) => number
  isItemInStock: (productId: string) => boolean
}

const RouteBasesContext = createContext<RouteBasesContextType | undefined>(undefined)

export const useRouteBases = () => {
  const context = useContext(RouteBasesContext)
  if (!context) {
    throw new Error("useRouteBases must be used within a RouteBasesProvider")
  }
  return context
}

interface RouteBasesProviderProps {
  children: ReactNode
}

export const RouteBasesProvider: React.FC<RouteBasesProviderProps> = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(routeBasesReducer, initialState)

  useEffect(() => {
    const savedState = localStorage.getItem("routeBasesState")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        dispatch({ type: "LOAD_STATE", payload: parsedState })
      } catch (error) {
        console.error("Failed to load saved state:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("routeBasesState", JSON.stringify(state))
  }, [state])

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } })
    }
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const startCheckout = () => {
    dispatch({ type: "START_CHECKOUT" })
  }

  const endCheckout = () => {
    dispatch({ type: "END_CHECKOUT" })
  }

  const simulatePaymentSuccess = (orderData: Omit<OrderHistory, "id" | "createdAt">) => {
    const order: OrderHistory = {
      ...orderData,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: "confirmed"
    }
    
    dispatch({ type: "CONFIRM_ORDER", payload: order })
  }

  const getStockLevel = (productId: string): number => {
    return state.inventoryLevels[productId] || 0
  }

  const isItemInStock = (productId: string): boolean => {
    return (state.inventoryLevels[productId] || 0) > 0
  }

  const value: RouteBasesContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    simulatePaymentSuccess,
    startCheckout,
    endCheckout,
    getStockLevel,
    isItemInStock
  }

  return (
    <RouteBasesContext.Provider value={value}>
      {children}
    </RouteBasesContext.Provider>
  )
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    bio: string;
    avatar?: string;
  }
  
  export interface Address {
    id: string;
    label: 'Home' | 'School' | 'Other';
    fullAddress: string;
    street: string;
    postCode: string;
    apartment: string;
  }
  
  export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    rating: number;
    cookTime: number;
    servings: number;
    category: string;
    calories?: number;
    protein?: number;
    fiber?: number;
    water?: number;
    fat?: number;
    ingredients?: Ingredient[];
  }
  
  export interface Ingredient {
    name: string;
    cooked: boolean;
    calories: number;
    protein: number;
    fiber: number;
    water: number;
    fat: number;
  }
  
  export interface CartItem {
    product: Product;
    quantity: number;
    size?: 'S' | 'M' | 'L';
    cooked?: boolean;
  }
  
  export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    status: 'ongoing' | 'completed' | 'canceled';
    date: string;
    address: string;
    courier?: {
      name: string;
      avatar: string;
    };
  }
  
  export interface PaymentMethod {
    id: string;
    type: 'cash' | 'visa' | 'mastercard' | 'paypal';
    cardNumber?: string;
    cardHolder?: string;
  }
  
  export interface Review {
    id: string;
    user: {
      name: string;
      avatar: string;
    };
    rating: number;
    comment: string;
    date: string;
  }
  
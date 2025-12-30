import { useMemo } from 'react';
import { Product } from '@/types/checkout';

interface ShopifyCartItem {
  variantId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShopifyCartData {
  items: ShopifyCartItem[];
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  discountCode?: string;
}

// Decode base64 cart data from URL
function decodeCartData(encodedCart: string): ShopifyCartData | null {
  try {
    const decoded = atob(encodedCart);
    const parsed = JSON.parse(decoded);
    return parsed as ShopifyCartData;
  } catch (error) {
    console.error('Failed to decode cart data:', error);
    return null;
  }
}

// Parse simple items format: id1:qty1:price1:title1,id2:qty2:price2:title2
function parseSimpleItems(itemsString: string): ShopifyCartItem[] {
  try {
    return itemsString.split(',').map(item => {
      const [productId, quantity, price, ...titleParts] = item.split(':');
      return {
        variantId: productId,
        productId,
        title: decodeURIComponent(titleParts.join(':') || 'Produto'),
        price: parseFloat(price) || 0,
        quantity: parseInt(quantity) || 1,
      };
    }).filter(item => item.productId && item.price > 0);
  } catch (error) {
    console.error('Failed to parse simple items:', error);
    return [];
  }
}

// Convert Shopify cart items to checkout Product format
function convertToProducts(items: ShopifyCartItem[]): Product[] {
  return items.map(item => ({
    id: item.variantId || item.productId,
    name: item.title,
    price: item.price,
    quantity: item.quantity,
    image: item.image || '/placeholder.svg',
  }));
}

export interface UseShopifyCartResult {
  products: Product[];
  customer: ShopifyCartData['customer'] | null;
  discountCode: string | null;
  isFromShopify: boolean;
}

export function useShopifyCart(): UseShopifyCartResult {
  return useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Try base64 encoded cart first
    const encodedCart = urlParams.get('cart');
    if (encodedCart) {
      const cartData = decodeCartData(encodedCart);
      if (cartData && cartData.items.length > 0) {
        return {
          products: convertToProducts(cartData.items),
          customer: cartData.customer || null,
          discountCode: cartData.discountCode || null,
          isFromShopify: true,
        };
      }
    }
    
    // Try simple items format
    const simpleItems = urlParams.get('items');
    if (simpleItems) {
      const items = parseSimpleItems(simpleItems);
      if (items.length > 0) {
        return {
          products: convertToProducts(items),
          customer: null,
          discountCode: urlParams.get('discount') || null,
          isFromShopify: true,
        };
      }
    }
    
    // No external cart data
    return {
      products: [],
      customer: null,
      discountCode: null,
      isFromShopify: false,
    };
  }, []);
}

// Helper to generate redirect URL for Shopify theme script
export function generateCheckoutRedirectUrl(
  checkoutBaseUrl: string,
  cartData: ShopifyCartData
): string {
  const encoded = btoa(JSON.stringify(cartData));
  return `${checkoutBaseUrl}?cart=${encodeURIComponent(encoded)}`;
}

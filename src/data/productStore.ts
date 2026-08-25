import { Product, PurityType, CategoryType } from '../types';
import { PRODUCTS, getLiveProductPrice, calculatePriceBreakdown } from './products';

const CUSTOM_PRODUCTS_STORAGE_KEY = 'kavitha_custom_products';

/**
 * Retrieve all custom products uploaded by the admin from localStorage
 */
export function getCustomProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CUSTOM_PRODUCTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading custom products:', e);
  }
  return [];
}

/**
 * Save custom products list
 */
export function saveCustomProducts(customList: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(customList));
    window.dispatchEvent(new CustomEvent('kavitha_products_updated'));
  } catch (e) {
    console.error('Error saving custom products:', e);
  }
}

/**
 * Get the full active product catalog (built-in + uploaded products)
 */
export function getAllProducts(): Product[] {
  const custom = getCustomProducts();
  return [...custom, ...PRODUCTS];
}

/**
 * Add a new product to the catalog
 */
export function addCustomProduct(newProduct: Omit<Product, 'id' | 'updatedTime'>): Product {
  const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const purityBadge = newProduct.purityBadge || 
    (newProduct.purity === '22K' ? '22K/916' : newProduct.purity === '18K' ? '18K/750' : '14K/585');

  const basePrice = calculatePriceBreakdown(newProduct.weightGrams, newProduct.purity).total;

  const product: Product = {
    ...newProduct,
    id,
    purityBadge,
    basePrice,
    updatedTime: timeStr,
  };

  const existing = getCustomProducts();
  const updated = [product, ...existing];
  saveCustomProducts(updated);
  return product;
}

/**
 * Delete a custom product by ID
 */
export function deleteCustomProduct(id: string): void {
  const existing = getCustomProducts();
  const filtered = existing.filter(p => p.id !== id);
  saveCustomProducts(filtered);
}

/**
 * Format a date or null value to a string
 * Safely formats a date that might be null
 */
export function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Format a currency amount from string or number
 */
export function formatCurrency(amount: string | number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
}

/**
 * Safely get a username from an ID
 */
export function getUserName(users: any[] | undefined, userId: number | null): string {
  if (!userId) return "N/A";
  const user = users?.find(u => u.id === userId);
  return user ? 
    user.companyName || user.contactName || user.username : 
    `User #${userId}`;
}

/**
 * Get an order from a list by ID
 */
export function getOrderById(orders: any[] | undefined, orderId: number | null) {
  if (!orderId || !orders) return null;
  return orders.find(order => order.id === orderId);
}

/**
 * Get a product from a list by ID 
 */
export function getProductById(products: any[] | undefined, productId: number | null) {
  if (!productId || !products) return null;
  const product = products.find(p => p.id === productId);
  return product ? product : null;
}

/**
 * Get a product name by ID
 */
export function getProductName(products: any[] | undefined, productId: number | null): string {
  if (!productId) return "N/A";
  const product = products?.find(p => p.id === productId);
  return product ? product.name : `Product #${productId}`;
}

/**
 * Get category name by ID
 */
export function getCategoryName(categories: any[] | undefined, categoryId: number | null): string {
  if (!categoryId) return "N/A";
  const category = categories?.find(c => c.id === categoryId);
  return category ? category.name : "Unknown";
}
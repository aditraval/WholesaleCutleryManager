import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import WholesalerLayout from "@/layouts/WholesalerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, Category, Order as OrderType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/product-card";
import { Search, Grid, List, Filter, ShoppingCart, Plus, Minus, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type CartItem = {
  productId: number;
  product: Product;
  quantity: number;
  price: number;
};

export default function WholesalerCatalog() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Filter products based on search query and category filter
  const filteredProducts = products?.filter(product => {
    const matchesSearch = 
      searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "all" || 
      product.categoryId === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Handle adding product to cart
  const addToCart = (product: Product, qty: number) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Update quantity if product already in cart
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + qty } 
          : item
      ));
    } else {
      // Add new product to cart
      setCart([...cart, {
        productId: product.id,
        product,
        quantity: qty,
        price: parseFloat(product.price.toString())
      }]);
    }
    
    toast({
      title: "Product added to cart",
      description: `${qty} × ${product.name} added to your order`,
    });
    
    setSelectedProduct(null);
    setQuantity(1);
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Update item quantity in cart
  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Submit order mutation
  const submitOrderMutation = useMutation({
    mutationFn: async () => {
      // Create order items from cart
      const orderItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Submit order
      const res = await apiRequest("POST", "/api/orders", {
        totalAmount: cartTotal,
        status: "pending",
        items: orderItems
      });
      
      return await res.json() as OrderType;
    },
    onSuccess: () => {
      // Clear cart and close dialog
      setCart([]);
      setOrderDialogOpen(false);
      
      // Show success toast
      toast({
        title: "Order submitted successfully",
        description: "Your order has been placed and is awaiting approval",
      });
      
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit order",
        description: error.message || "An error occurred while submitting your order",
        variant: "destructive",
      });
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <WholesalerLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Product Catalog</h1>
          <p className="text-neutral-600">Browse our premium cutlery collection</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-neutral-100" : ""}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-neutral-100" : ""}>
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setOrderDialogOpen(true)}
            disabled={cart.length === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="text-xs">{cart.length}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Filters Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input 
                    placeholder="Search products..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">
                  Category
                </label>
                <Select 
                  value={categoryFilter.toString()} 
                  onValueChange={(value) => setCategoryFilter(value === "all" ? "all" : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">
                  Availability
                </label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <Button variant="outline" className="w-full" onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Products</CardTitle>
                <span className="text-sm text-neutral-500">
                  {filteredProducts.length} items
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-4"
                }>
                  {filteredProducts.map((product) => (
                    viewMode === "grid" ? (
                      <ProductCard 
                        key={product.id} 
                        product={product}
                        onSelect={() => {
                          setSelectedProduct(product);
                          setQuantity(1);
                        }}
                      />
                    ) : (
                      <div key={product.id} className="flex border rounded-lg overflow-hidden">
                        {product.imageUrl && (
                          <div className="w-24 h-24 flex-shrink-0">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-neutral-600 line-clamp-1 mb-2">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-primary-700 font-bold">${parseFloat(product.price.toString()).toFixed(2)}</p>
                              <p className="text-xs text-neutral-500">SKU: {product.sku}</p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedProduct(product);
                                setQuantity(1);
                              }}
                              disabled={product.inventory <= 0}
                            >
                              Add to Order
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-500 mb-2">No products found matching your criteria</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add to Cart Dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Order</DialogTitle>
              <DialogDescription>
                Specify the quantity you want to order
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center space-x-4 mb-4">
                {selectedProduct.imageUrl && (
                  <div className="w-16 h-16 rounded bg-neutral-100 overflow-hidden">
                    <img 
                      src={selectedProduct.imageUrl} 
                      alt={selectedProduct.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-neutral-600">${parseFloat(selectedProduct.price.toString()).toFixed(2)} per unit</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-neutral-600">Quantity:</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                    max={selectedProduct.inventory}
                    className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => setQuantity(Math.min(selectedProduct.inventory, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Available:</span>
                <span className={selectedProduct.inventory > 20 ? "text-green-600" : selectedProduct.inventory > 0 ? "text-yellow-600" : "text-red-600"}>
                  {selectedProduct.inventory} units
                </span>
              </div>
              
              <div className="flex justify-between items-center font-medium mt-2">
                <span>Total:</span>
                <span>${(parseFloat(selectedProduct.price.toString()) * quantity).toFixed(2)}</span>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => addToCart(selectedProduct, quantity)}
                disabled={selectedProduct.inventory < 1 || quantity < 1}
              >
                Add to Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View/Submit Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Your Order</DialogTitle>
            <DialogDescription>
              Review and submit your order request
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="cart">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cart">Cart</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cart" className="space-y-4 py-4">
              {cart.length > 0 ? (
                <>
                  <div className="max-h-[300px] overflow-y-auto space-y-3">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center border-b border-neutral-200 pb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <p className="text-xs text-neutral-500">
                            ${item.price.toFixed(2)} per unit
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="w-20 text-right text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-2"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(cartTotal)}</span>
                    </div>
                    {user?.pricingTier === "premium" && (
                      <div className="flex justify-between items-center text-sm text-green-600 mt-1">
                        <span>Premium Discount (15%):</span>
                        <span>-{formatCurrency(cartTotal * 0.15)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-bold text-lg mt-2">
                      <span>Total:</span>
                      <span>
                        {user?.pricingTier === "premium" 
                          ? formatCurrency(cartTotal * 0.85)
                          : formatCurrency(cartTotal)
                        }
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-neutral-500">Your cart is empty</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Order Items:</span>
                  <span className="text-sm font-medium">{cart.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Total Quantity:</span>
                  <span className="text-sm font-medium">
                    {cart.reduce((total, item) => total + item.quantity, 0)} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Subtotal:</span>
                  <span className="text-sm font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                {user?.pricingTier === "premium" && (
                  <div className="flex justify-between">
                    <span className="text-sm text-green-600">Premium Discount:</span>
                    <span className="text-sm font-medium text-green-600">15%</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-medium">Final Total:</span>
                  <span className="font-bold">
                    {user?.pricingTier === "premium" 
                      ? formatCurrency(cartTotal * 0.85)
                      : formatCurrency(cartTotal)
                    }
                  </span>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-md mt-4">
                <h4 className="text-sm font-medium mb-2">Order Process:</h4>
                <ol className="text-sm text-neutral-600 space-y-1 list-decimal list-inside">
                  <li>Your order will be submitted for admin approval</li>
                  <li>Once approved, you'll receive an invoice</li>
                  <li>After payment, your order will be processed for shipping</li>
                  <li>You can track your order status from your dashboard</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              Continue Shopping
            </Button>
            <Button 
              onClick={() => submitOrderMutation.mutate()}
              disabled={cart.length === 0 || submitOrderMutation.isPending}
            >
              {submitOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WholesalerLayout>
  );
}

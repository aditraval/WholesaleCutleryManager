import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
}

export function ProductCard({ product, onSelect, showActions = true, className }: ProductCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-md", className)}>
      {product.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-200"
          />
        </div>
      )}
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-neutral-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-primary-700 font-bold">${parseFloat(product.price.toString()).toFixed(2)}</p>
            <p className="text-xs text-neutral-500">SKU: {product.sku}</p>
          </div>
          <div className="text-right">
            <span className={cn("px-2 py-1 text-xs font-medium rounded-full", 
              product.inventory > 20 
                ? "bg-green-100 text-green-800" 
                : product.inventory > 0 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-red-100 text-red-800"
            )}>
              {product.inventory > 20 
                ? `In Stock (${product.inventory})` 
                : product.inventory > 0 
                  ? `Low Stock (${product.inventory})` 
                  : "Out of Stock"}
            </span>
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={() => onSelect?.(product)} 
            variant="outline" 
            className="w-full"
            disabled={product.inventory <= 0}
          >
            {onSelect ? "Add to Order" : "View Details"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default ProductCard;

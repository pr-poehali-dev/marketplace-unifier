import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  seller: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isSale?: boolean;
  type: "product" | "service";
  city: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string) => void;
}

export default function ProductCard({ product, onAddToCart, onNavigate }: ProductCardProps) {
  const [isFav, setIsFav] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 600);
    onAddToCart(product);
    toast({
      description: `«${product.title}» добавлен в корзину`,
    });
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFav(!isFav);
    toast({
      description: isFav ? "Удалено из избранного" : "Добавлено в избранное",
    });
  };

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div
      className="card-product cursor-pointer group"
      onClick={() => onNavigate("product")}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.isNew && <span className="badge-new">Новинка</span>}
          {product.isSale && discount && (
            <span className="badge-sale">-{discount}%</span>
          )}
          {product.type === "service" && (
            <span className="inline-flex items-center gap-1 bg-blue-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              <Icon name="Briefcase" size={9} />
              Услуга
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFav}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isFav
              ? "bg-red-500 text-white shadow-md"
              : "bg-white/80 dark:bg-black/50 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Icon name="Heart" size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <p className="text-xs text-muted-foreground mb-1 truncate">{product.category} · {product.city}</p>
        <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                name="Star"
                size={11}
                className={i < Math.floor(product.rating) ? "star-filled" : "star-empty"}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Price & Add to cart */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-bold text-base leading-none">
              {product.price.toLocaleString("ru-RU")} ₽
            </div>
            {product.oldPrice && (
              <div className="text-xs text-muted-foreground line-through mt-0.5">
                {product.oldPrice.toLocaleString("ru-RU")} ₽
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={`rounded-xl h-8 px-3 text-xs font-semibold transition-all duration-200 ${
              isAdding ? "scale-90 btn-gradient" : "btn-gradient"
            }`}
          >
            {isAdding ? (
              <Icon name="Check" size={13} />
            ) : (
              <Icon name="Plus" size={13} />
            )}
          </Button>
        </div>

        {/* Seller */}
        <div className="mt-2.5 pt-2.5 border-t border-border/50 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full gradient-brand flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">{product.seller[0]}</span>
          </div>
          <span className="text-xs text-muted-foreground truncate">{product.seller}</span>
        </div>
      </div>
    </div>
  );
}

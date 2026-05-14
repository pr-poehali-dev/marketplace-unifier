import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import ProductCard, { Product } from "@/components/ProductCard";
import { PRODUCTS } from "@/data/mockData";

interface FavoritesPageProps {
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string) => void;
}

export default function FavoritesPage({ onAddToCart, onNavigate }: FavoritesPageProps) {
  const [favorites] = useState(PRODUCTS.slice(0, 5));

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-900/20 mx-auto flex items-center justify-center mb-6">
          <Icon name="Heart" size={36} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Избранное пусто</h2>
        <p className="text-muted-foreground mb-6">Добавляйте товары в избранное чтобы не потерять</p>
        <Button onClick={() => onNavigate("catalog")} className="btn-gradient rounded-xl px-8 font-semibold">
          Перейти в каталог
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Избранное
          <span className="text-muted-foreground text-base font-normal ml-2">({favorites.length})</span>
        </h1>
        <Button variant="ghost" size="sm" className="text-muted-foreground rounded-xl text-xs">
          <Icon name="Trash2" size={13} className="mr-1.5" />
          Очистить всё
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger">
        {favorites.map((product) => (
          <div key={product.id} className="animate-fade-in">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onNavigate={onNavigate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

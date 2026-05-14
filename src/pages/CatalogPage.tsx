import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import ProductCard, { Product } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/data/mockData";

interface CatalogPageProps {
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string) => void;
}

export default function CatalogPage({ onAddToCart, onNavigate }: CatalogPageProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [type, setType] = useState<"all" | "product" | "service">("all");
  const [priceRange, setPriceRange] = useState([0, 130000]);
  const [sortBy, setSortBy] = useState("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCat && p.category !== selectedCat) return false;
    if (type !== "all" && p.type !== type) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Каталог</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} объявлений</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border/60 md:hidden"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Icon name="SlidersHorizontal" size={15} className="mr-1.5" />
            Фильтры
            {(selectedCat || type !== "all") && (
              <Badge className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] gradient-brand text-white border-0">
                !
              </Badge>
            )}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-secondary border border-border/60 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="popular">По популярности</option>
            <option value="rating">По рейтингу</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className={`w-64 shrink-0 ${filtersOpen ? "block" : "hidden md:block"}`}>
          <div className="space-y-5 sticky top-20">
            {/* Search */}
            <div className="bg-card border border-border/60 rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3">Поиск</h3>
              <div className="relative">
                <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Название товара..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm rounded-xl border-border/60"
                />
              </div>
            </div>

            {/* Type */}
            <div className="bg-card border border-border/60 rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3">Тип</h3>
              <div className="space-y-1.5">
                {([["all", "Всё"], ["product", "Товары"], ["service", "Услуги"]] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setType(val)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      type === val
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="bg-card border border-border/60 rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3">Категория</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCat(null)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-all ${
                    !selectedCat ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Все категории
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.name)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-all flex items-center justify-between ${
                      selectedCat === cat.name
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {cat.name}
                    <span className="text-xs opacity-60">{cat.count.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="bg-card border border-border/60 rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3">Цена, ₽</h3>
              <Slider
                min={0}
                max={130000}
                step={1000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-3"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-secondary rounded-lg px-2 py-1 font-medium text-foreground">
                  {priceRange[0].toLocaleString()}
                </span>
                <span>—</span>
                <span className="bg-secondary rounded-lg px-2 py-1 font-medium text-foreground">
                  {priceRange[1].toLocaleString()}
                </span>
              </div>
            </div>

            {/* Reset */}
            {(selectedCat || type !== "all" || search) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-xl text-muted-foreground"
                onClick={() => { setSelectedCat(null); setType("all"); setSearch(""); setPriceRange([0, 130000]); }}
              >
                <Icon name="RotateCcw" size={13} className="mr-1.5" />
                Сбросить фильтры
              </Button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold mb-1">Ничего не найдено</p>
              <p className="text-sm">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {filtered.map((product) => (
                <div key={product.id} className="animate-fade-in">
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onNavigate={onNavigate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import ProductCard, { Product } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/data/mockData";

interface HomePageProps {
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string) => void;
}

export default function HomePage({ onAddToCart, onNavigate }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<"all" | "products" | "services">("all");

  const filtered = PRODUCTS.filter((p) => {
    if (activeTab === "products") return p.type === "product";
    if (activeTab === "services") return p.type === "service";
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 mesh-bg">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6 animate-fade-in">
            <Icon name="Zap" size={14} />
            Покупай и продавай в одном месте
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 animate-fade-up leading-[1.1]">
            Маркетплейс нового
            <br />
            <span className="gradient-text">поколения</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "100ms" }}>
            Одна роль — полные возможности. Любой пользователь может и покупать, и продавать без ограничений.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Button
              onClick={() => onNavigate("catalog")}
              size="lg"
              className="btn-gradient rounded-2xl px-8 font-semibold text-base shadow-brand"
            >
              <Icon name="Search" size={18} className="mr-2" />
              Найти товар
            </Button>
            <Button
              onClick={() => onNavigate("cabinet")}
              variant="outline"
              size="lg"
              className="rounded-2xl px-8 font-semibold text-base border-border/60 bg-background/60 backdrop-blur"
            >
              <Icon name="PlusCircle" size={18} className="mr-2" />
              Разместить объявление
            </Button>
          </div>

          {/* Stats bar */}
          <div className="mt-12 flex items-center justify-center gap-8 md:gap-16 flex-wrap animate-fade-up" style={{ animationDelay: "300ms" }}>
            {[
              { label: "Товаров и услуг", value: "12 847+" },
              { label: "Пользователей", value: "34 000+" },
              { label: "Продаж в месяц", value: "8 200+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-black gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-400/5 blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />
      </section>

      {/* Categories */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Категории</h2>
          <button
            onClick={() => onNavigate("catalog")}
            className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            Все категории <Icon name="ArrowRight" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 stagger">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate("catalog")}
              className="animate-fade-in flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 hover-lift group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-200`}>
                <Icon name={cat.icon} size={20} className="text-white" fallback="Tag" />
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold leading-tight">{cat.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{cat.count.toLocaleString()}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold">Рекомендуем</h2>
          <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
            {(["all", "products", "services"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === tab
                    ? "bg-card shadow-soft text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "all" ? "Всё" : tab === "products" ? "Товары" : "Услуги"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
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

        <div className="mt-8 text-center">
          <Button
            onClick={() => onNavigate("catalog")}
            variant="outline"
            className="rounded-2xl px-8 font-semibold border-border/60"
          >
            Смотреть все объявления
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Banner: Become seller */}
      <section className="py-12 container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-brand p-8 md:p-12 text-white shadow-brand">
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-semibold mb-4 backdrop-blur-sm">
              <Icon name="TrendingUp" size={14} />
              Начни зарабатывать сегодня
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
              Продавай свои товары и услуги
            </h2>
            <p className="text-white/80 mb-6 text-base leading-relaxed">
              Разместите объявление за 2 минуты. Комиссия только при продаже. Доступно всем зарегистрированным пользователям.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => onNavigate("cabinet")}
                className="bg-white text-primary font-bold rounded-xl hover:bg-white/90 shadow-soft-md"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Разместить объявление
              </Button>
              <Button
                variant="ghost"
                className="text-white border border-white/30 rounded-xl hover:bg-white/10 font-semibold"
              >
                Узнать подробнее
              </Button>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 bottom-0 top-0 w-64 pointer-events-none hidden md:block">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-l-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-3 opacity-30">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-white/20 rounded-2xl animate-float" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 mt-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <Icon name="Zap" size={13} className="text-white" />
              </div>
              <span className="font-bold gradient-text">Маркет</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Помощь</button>
              <button className="hover:text-foreground transition-colors">О нас</button>
              <button className="hover:text-foreground transition-colors">Контакты</button>
              <button onClick={() => onNavigate("admin")} className="hover:text-foreground transition-colors">Для продавцов</button>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Маркет. Все права защищены</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

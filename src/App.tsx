import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import CartPage from "@/pages/CartPage";
import CabinetPage from "@/pages/CabinetPage";
import ChatPage from "@/pages/ChatPage";
import OrdersPage from "@/pages/OrdersPage";
import FavoritesPage from "@/pages/FavoritesPage";
import AdminPage from "@/pages/AdminPage";
import { Product } from "@/components/ProductCard";

interface CartItem extends Product {
  quantity: number;
}

const ADMIN_ROUTE = "/admin";

export default function App() {
  const isAdminRoute = window.location.pathname === ADMIN_ROUTE;

  const [page, setPage] = useState(() => {
    if (isAdminRoute) return "admin";
    return "home";
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleNavigate = (newPage: string) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (newPage === "admin") {
      window.history.pushState({}, "", ADMIN_ROUTE);
    } else {
      window.history.pushState({}, "", "/");
    }
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (page === "admin") {
    return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AdminPage onNavigate={handleNavigate} />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-background">
        <Header
          currentPage={page}
          onNavigate={handleNavigate}
          cartCount={cartCount}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
        />
        <main>
          {page === "home" && (
            <HomePage onAddToCart={handleAddToCart} onNavigate={handleNavigate} />
          )}
          {page === "catalog" && (
            <CatalogPage onAddToCart={handleAddToCart} onNavigate={handleNavigate} />
          )}
          {page === "cart" && (
            <CartPage
              cartItems={cartItems}
              onUpdateCart={setCartItems}
              onNavigate={handleNavigate}
            />
          )}
          {page === "cabinet" && (
            <CabinetPage onNavigate={handleNavigate} />
          )}
          {page === "chat" && <ChatPage />}
          {page === "orders" && <OrdersPage onNavigate={handleNavigate} />}
          {page === "favorites" && (
            <FavoritesPage onAddToCart={handleAddToCart} onNavigate={handleNavigate} />
          )}
          {page === "product" && (
            <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
              <p className="text-2xl font-bold mb-2">Карточка товара</p>
              <p>Детальная страница товара появится в следующей версии</p>
              <button onClick={() => handleNavigate("catalog")} className="mt-6 text-primary font-semibold">
                ← Вернуться в каталог
              </button>
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import CartPage from "@/pages/CartPage";
import CabinetPage from "@/pages/CabinetPage";
import ChatPage from "@/pages/ChatPage";
import OrdersPage from "@/pages/OrdersPage";
import FavoritesPage from "@/pages/FavoritesPage";
import AdminPage from "@/pages/AdminPage";
import { Product } from "@/components/ProductCard";
import { auth, getSession, clearSession, cart as cartApi } from "@/lib/api";

interface CartItem extends Product {
  quantity: number;
}

interface UserState {
  id: number;
  name: string;
  permission_level: string;
}

const ADMIN_ROUTE = "/admin";

export default function App() {
  const isAdminRoute = window.location.pathname === ADMIN_ROUTE;

  const [page, setPage] = useState(() => isAdminRoute ? "admin" : "home");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserState | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Load user from session on mount
  useEffect(() => {
    const sid = getSession();
    if (sid) {
      auth.me().then((u) => {
        setUser({ id: u.id, name: u.display_name, permission_level: u.permission_level });
      }).catch(() => clearSession());
    }
  }, []);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleNavigate = (newPage: string) => {
    // Require auth for protected pages
    if (["cabinet", "chat", "orders", "favorites"].includes(newPage) && !user) {
      setAuthOpen(true);
      return;
    }
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState({}, "", newPage === "admin" ? ADMIN_ROUTE : "/");
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    // Optimistic local update
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Sync to backend
    cartApi.add(product.id, 1).catch(() => {});
  };

  const handleAuthSuccess = (u: UserState) => {
    setUser(u);
  };

  const handleLogout = async () => {
    await auth.logout().catch(() => {});
    clearSession();
    setUser(null);
    setPage("home");
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
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <div className="min-h-screen bg-background">
        <Header
          currentPage={page}
          onNavigate={handleNavigate}
          cartCount={cartCount}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          user={user}
          onAuthClick={() => setAuthOpen(true)}
          onLogout={handleLogout}
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
            <CabinetPage onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
          )}
          {page === "chat" && <ChatPage user={user} />}
          {page === "orders" && <OrdersPage onNavigate={handleNavigate} user={user} />}
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

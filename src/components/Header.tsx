import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount: number;
  isDark: boolean;
  onToggleDark: () => void;
  user?: { id: number; name: string; permission_level: string } | null;
  onAuthClick?: () => void;
  onLogout?: () => void;
}

export default function Header({ currentPage, onNavigate, cartCount, isDark, onToggleDark, user, onAuthClick, onLogout }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Каталог", page: "catalog", icon: "LayoutGrid" },
    { label: "Избранное", page: "favorites", icon: "Heart" },
    { label: "Заказы", page: "orders", icon: "Package" },
    { label: "Сообщения", page: "chat", icon: "MessageCircle" },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand-sm">
              <Icon name="Zap" size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              <span className="gradient-text">Маркет</span>
            </span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-2 relative">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Поиск товаров и услуг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 rounded-xl bg-secondary/60 border-border/50 text-sm focus-visible:ring-primary/30"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  currentPage === item.page
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            <button
              onClick={() => onNavigate("cart")}
              className={`relative p-2 rounded-xl transition-all duration-150 ${
                currentPage === "cart"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon name="ShoppingCart" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 gradient-brand rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Dark mode */}
            <button
              onClick={onToggleDark}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
            >
              <Icon name={isDark ? "Sun" : "Moon"} size={18} />
            </button>

            {/* Profile */}
            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  onClick={() => onNavigate("cabinet")}
                  size="sm"
                  className={`rounded-xl font-medium transition-all duration-200 ${
                    currentPage === "cabinet"
                      ? "btn-gradient shadow-brand-sm"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full gradient-brand flex items-center justify-center mr-1.5">
                    <span className="text-white text-[9px] font-bold">{user.name[0]}</span>
                  </div>
                  {user.name.split(" ")[0]}
                </Button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-secondary transition-all"
                  title="Выйти"
                >
                  <Icon name="LogOut" size={15} />
                </button>
              </div>
            ) : (
              <Button
                onClick={onAuthClick}
                size="sm"
                className="rounded-xl font-medium btn-gradient hidden sm:flex"
              >
                <Icon name="LogIn" size={15} className="mr-1.5" />
                Войти
              </Button>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-all"
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentPage === item.page
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { onNavigate("cabinet"); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-all"
              >
                <Icon name="User" size={16} />
                Личный кабинет
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
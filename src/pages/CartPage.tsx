import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/components/ProductCard";

interface CartItem extends Product {
  quantity: number;
}

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateCart: (items: CartItem[]) => void;
  onNavigate: (page: string) => void;
}

export default function CartPage({ cartItems, onUpdateCart, onNavigate }: CartPageProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const { toast } = useToast();

  const updateQty = (id: number, delta: number) => {
    onUpdateCart(
      cartItems
        .map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    onUpdateCart(cartItems.filter((i) => i.id !== id));
    toast({ description: "Товар удалён из корзины" });
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal - discount;
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 350;

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SUMMER25") {
      setPromoApplied(true);
      setPromoError("");
      toast({ description: "Промокод применён! Скидка 15%" });
    } else {
      setPromoError("Промокод не найден или истёк");
      setPromoApplied(false);
    }
  };

  const handleOrder = () => {
    toast({ description: "Заказ оформлен! Перейдите в раздел «Заказы» для отслеживания." });
    onUpdateCart([]);
    onNavigate("orders");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl gradient-brand mx-auto flex items-center justify-center mb-6 shadow-brand">
          <Icon name="ShoppingCart" size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Корзина пуста</h2>
        <p className="text-muted-foreground mb-6">Добавьте товары или услуги из каталога</p>
        <Button onClick={() => onNavigate("catalog")} className="btn-gradient rounded-xl px-8 font-semibold">
          Перейти в каталог
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Корзина
        <span className="text-muted-foreground text-base font-normal ml-2">
          ({cartItems.length} {cartItems.length === 1 ? "товар" : "товара"})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-card border border-border/60 rounded-2xl p-4 animate-fade-in"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-secondary"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{item.category}</p>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 mt-0.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Icon name="Store" size={11} />
                  {item.seller}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="font-bold">{(item.price * item.quantity).toLocaleString("ru-RU")} ₽</div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all"
                  >
                    <Icon name="Minus" size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all"
                  >
                    <Icon name="Plus" size={12} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-card border border-border/60 rounded-2xl p-5 sticky top-20">
            <h2 className="font-bold text-lg mb-4">Итого</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Товары ({cartItems.length})</span>
                <span>{subtotal.toLocaleString("ru-RU")} ₽</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500 font-medium">
                  <span>Скидка по промокоду</span>
                  <span>−{discount.toLocaleString("ru-RU")} ₽</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span>{shipping === 0 ? "Бесплатно" : `${shipping} ₽`}</span>
              </div>
              <div className="border-t border-border/50 pt-2.5 flex justify-between font-bold text-base">
                <span>К оплате</span>
                <span className="gradient-text">{(total + shipping).toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Промокод"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                  className="h-9 rounded-xl border-border/60 text-sm"
                />
                <Button
                  onClick={applyPromo}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/60 shrink-0"
                  disabled={promoApplied}
                >
                  {promoApplied ? <Icon name="Check" size={14} className="text-green-500" /> : "Применить"}
                </Button>
              </div>
              {promoError && <p className="text-xs text-destructive mt-1.5">{promoError}</p>}
              {promoApplied && <p className="text-xs text-green-500 mt-1.5">Промокод SUMMER25 применён (-15%)</p>}
              <p className="text-xs text-muted-foreground mt-1.5">Попробуйте: SUMMER25</p>
            </div>

            <Button
              onClick={handleOrder}
              className="w-full mt-5 btn-gradient rounded-xl font-semibold py-5"
            >
              <Icon name="CreditCard" size={16} className="mr-2" />
              Оформить заказ
            </Button>

            <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <Icon name="Shield" size={12} />
              <span>Безопасная оплата</span>
              <Icon name="RotateCcw" size={12} />
              <span>Возврат 14 дней</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

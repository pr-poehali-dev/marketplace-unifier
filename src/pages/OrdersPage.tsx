import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { ORDERS } from "@/data/mockData";

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30",
};
const STATUS_LABELS: Record<string, string> = {
  delivered: "Доставлен",
  in_progress: "В работе",
  pending: "В обработке",
  cancelled: "Отменён",
};

const STEPS = ["Принят", "Оплачен", "Собирается", "Доставляется", "Получен"];

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = ORDERS.filter((o) => filter === "all" || o.status === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Мои заказы</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          ["all", "Все"],
          ["pending", "В обработке"],
          ["in_progress", "В работе"],
          ["delivered", "Доставлены"],
          ["cancelled", "Отменённые"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filter === val
                ? "gradient-brand text-white shadow-brand-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="Package" size={48} className="mx-auto mb-3 opacity-20" />
            <p>Нет заказов в этом статусе</p>
          </div>
        )}
        {filtered.map((order) => (
          <div
            key={order.id}
            className="bg-card border border-border/60 rounded-2xl overflow-hidden transition-all hover:border-primary/30"
          >
            {/* Order header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="font-semibold">{order.product}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Icon name="Store" size={11} />
                      {order.seller} · {order.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{order.price.toLocaleString("ru-RU")} ₽</span>
                  <Icon
                    name={expanded === order.id ? "ChevronUp" : "ChevronDown"}
                    size={16}
                    className="text-muted-foreground transition-transform"
                  />
                </div>
              </div>
            </div>

            {/* Expanded */}
            {expanded === order.id && (
              <div className="border-t border-border/50 p-4 animate-fade-in">
                {/* Progress tracker */}
                {order.status !== "cancelled" && (
                  <div className="mb-5">
                    <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">Статус заказа</p>
                    <div className="flex items-center">
                      {STEPS.map((step, i) => {
                        const currentStep = order.status === "delivered" ? 5 : order.status === "in_progress" ? 3 : order.status === "pending" ? 1 : 0;
                        const done = i < currentStep;
                        const active = i === currentStep - 1;
                        return (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className={`flex flex-col items-center`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done || active ? "gradient-brand text-white shadow-brand-sm" : "bg-secondary text-muted-foreground"}`}>
                                {done && i < currentStep - 1 ? <Icon name="Check" size={12} /> : i + 1}
                              </div>
                              <span className="text-[10px] text-muted-foreground mt-1 text-center w-14 leading-tight hidden sm:block">{step}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 ${i < currentStep - 1 ? "gradient-brand" : "bg-border"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs border-border/60"
                    onClick={() => onNavigate("chat")}
                  >
                    <Icon name="MessageCircle" size={12} className="mr-1.5" />
                    Чат с продавцом
                  </Button>
                  {order.status === "delivered" && (
                    <Button size="sm" variant="outline" className="rounded-xl text-xs border-border/60">
                      <Icon name="Star" size={12} className="mr-1.5" />
                      Оставить отзыв
                    </Button>
                  )}
                  {order.status === "pending" && (
                    <Button size="sm" variant="outline" className="rounded-xl text-xs border-border/60 text-destructive hover:text-destructive">
                      <Icon name="X" size={12} className="mr-1.5" />
                      Отменить
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="rounded-xl text-xs border-border/60">
                    <Icon name="FileText" size={12} className="mr-1.5" />
                    Детали
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

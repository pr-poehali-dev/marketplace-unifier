import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { ORDERS, PRODUCTS } from "@/data/mockData";

const TABS = [
  { id: "overview", label: "Профиль", icon: "User" },
  { id: "my_listings", label: "Мои объявления", icon: "Package" },
  { id: "purchases", label: "Покупки", icon: "ShoppingBag" },
  { id: "stats", label: "Статистика", icon: "BarChart3" },
  { id: "reviews", label: "Отзывы", icon: "Star" },
  { id: "wallet", label: "Кошелёк", icon: "Wallet" },
];

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

interface CabinetPageProps {
  onNavigate: (page: string) => void;
}

export default function CabinetPage({ onNavigate }: CabinetPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Алексей Морозов");
  const [bio, setBio] = useState("Продаю электронику и гаджеты. Более 200 успешных сделок.");
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({ description: "Профиль обновлён" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          {/* Profile card */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 mb-4 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto flex items-center justify-center shadow-brand mb-3">
              <span className="text-white text-2xl font-black">{name[0]}</span>
            </div>
            <p className="font-bold">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Продавец-Покупатель</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="Star" size={12} className={i < 5 ? "star-filled" : "star-empty"} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">(42)</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-secondary rounded-xl p-2">
                <div className="font-bold text-base">18</div>
                <div className="text-muted-foreground">Продаж</div>
              </div>
              <div className="bg-secondary rounded-xl p-2">
                <div className="font-bold text-base">34</div>
                <div className="text-muted-foreground">Покупок</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon name={tab.icon} size={15} fallback="Circle" />
                {tab.label}
              </button>
            ))}
            <div className="pt-2 border-t border-border/50 mt-2">
              <button
                onClick={() => onNavigate("home")}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
              >
                <Icon name="LogOut" size={15} />
                Выйти
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Личные данные</h2>
                {!isEditing ? (
                  <Button variant="outline" size="sm" className="rounded-xl border-border/60" onClick={() => setIsEditing(true)}>
                    <Icon name="Pencil" size={13} className="mr-1.5" />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsEditing(false)}>Отмена</Button>
                    <Button size="sm" className="rounded-xl btn-gradient" onClick={handleSave}>Сохранить</Button>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Имя</label>
                    {isEditing
                      ? <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-border/60" />
                      : <p className="font-medium">{name}</p>
                    }
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Email</label>
                    {isEditing
                      ? <Input defaultValue="morozov@mail.ru" className="rounded-xl border-border/60" />
                      : <p className="font-medium">morozov@mail.ru</p>
                    }
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Телефон</label>
                    {isEditing
                      ? <Input defaultValue="+7 (999) 123-45-67" className="rounded-xl border-border/60" />
                      : <p className="font-medium">+7 (999) 123-45-67</p>
                    }
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Город</label>
                    {isEditing
                      ? <Input defaultValue="Москва" className="rounded-xl border-border/60" />
                      : <p className="font-medium">Москва</p>
                    }
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">О себе</label>
                  {isEditing
                    ? <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl border-border/60 resize-none" rows={3} />
                    : <p className="text-sm leading-relaxed">{bio}</p>
                  }
                </div>
              </div>

              {/* Verification */}
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Верификация</h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Email подтверждён", done: true },
                    { label: "Телефон подтверждён", done: true },
                    { label: "Паспорт", done: false },
                    { label: "ИНН / Самозанятый", done: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-secondary text-muted-foreground"}`}>
                        <Icon name={item.done ? "Check" : "Clock"} size={11} />
                      </div>
                      <span className={item.done ? "" : "text-muted-foreground"}>{item.label}</span>
                      {!item.done && (
                        <button className="ml-auto text-xs text-primary font-medium">Добавить →</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MY LISTINGS */}
          {activeTab === "my_listings" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Мои объявления</h2>
                <Button className="btn-gradient rounded-xl text-sm font-semibold">
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Новое объявление
                </Button>
              </div>
              <div className="space-y-3">
                {PRODUCTS.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl p-4 hover:border-primary/30 transition-all">
                    <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover bg-secondary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.category} · {p.city}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-sm">{p.price.toLocaleString("ru-RU")} ₽</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${i % 3 === 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30" : i % 3 === 1 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"}`}>
                          {i % 3 === 0 ? "Активно" : i % 3 === 1 ? "На модерации" : "Продано"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="p-2 rounded-xl hover:bg-secondary transition-all text-muted-foreground hover:text-foreground">
                        <Icon name="Pencil" size={14} />
                      </button>
                      <button className="p-2 rounded-xl hover:bg-secondary transition-all text-muted-foreground hover:text-destructive">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PURCHASES */}
          {activeTab === "purchases" && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-4">Мои покупки</h2>
              <div className="space-y-3">
                {ORDERS.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-border/60 rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-all"
                    onClick={() => onNavigate("orders")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="font-semibold text-sm">{order.product}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Icon name="Store" size={11} />
                          {order.seller}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold">{order.price.toLocaleString("ru-RU")} ₽</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                      </div>
                    </div>
                    {order.status === "in_progress" && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-lg text-xs border-border/60" onClick={(e) => { e.stopPropagation(); onNavigate("chat"); }}>
                          <Icon name="MessageCircle" size={12} className="mr-1" />
                          Написать продавцу
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATS */}
          {activeTab === "stats" && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-4">Статистика продаж</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Выручка за месяц", value: "142 300 ₽", icon: "TrendingUp", color: "text-green-500" },
                  { label: "Продано товаров", value: "18", icon: "Package", color: "text-blue-500" },
                  { label: "Просмотры", value: "3 420", icon: "Eye", color: "text-purple-500" },
                  { label: "Рейтинг", value: "4.9 ★", icon: "Star", color: "text-yellow-500" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-border/60 rounded-2xl p-4">
                    <Icon name={stat.icon} size={20} className={`${stat.color} mb-2`} fallback="Circle" />
                    <div className="font-bold text-xl">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
              {/* Simple chart placeholder */}
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Продажи по дням (май 2026)</h3>
                <div className="flex items-end gap-1.5 h-32">
                  {[30, 50, 40, 70, 60, 85, 45, 90, 55, 75, 80, 65, 50, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg gradient-brand opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ height: `${h}%` }}
                      title={`День ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-4">Отзывы обо мне</h2>
              <div className="space-y-3">
                {[
                  { name: "Мария К.", rating: 5, text: "Отличный продавец! Товар пришёл быстро, упакован хорошо. Всё соответствует описанию.", date: "12 мая 2026" },
                  { name: "Дмитрий С.", rating: 4, text: "Хорошая сделка, немного задержался с отправкой, но предупредил заранее.", date: "10 мая 2026" },
                  { name: "Анна В.", rating: 5, text: "Очень доволен! Рекомендую этого продавца всем. Честный, вежливый, профессиональный.", date: "8 мая 2026" },
                ].map((review, i) => (
                  <div key={i} className="bg-card border border-border/60 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center font-bold text-sm">
                          {review.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Icon key={j} name="Star" size={13} className={j < review.rating ? "star-filled" : "star-empty"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WALLET */}
          {activeTab === "wallet" && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-4">Кошелёк</h2>
              <div className="gradient-brand rounded-2xl p-6 text-white mb-4 shadow-brand">
                <p className="text-sm text-white/70 mb-1">Доступно для вывода</p>
                <p className="text-4xl font-black mb-4">24 300 ₽</p>
                <div className="flex gap-3">
                  <Button className="bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20">
                    <Icon name="ArrowUpRight" size={14} className="mr-1.5" />
                    Вывести
                  </Button>
                  <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl text-sm font-semibold border border-white/20">
                    <Icon name="History" size={14} className="mr-1.5" />
                    История
                  </Button>
                </div>
              </div>
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Последние операции</h3>
                <div className="space-y-3">
                  {[
                    { label: "Продажа: iPhone 15 Pro Max", amount: "+80 910 ₽", type: "in", date: "12 мая" },
                    { label: "Комиссия маркетплейса", amount: "−8 990 ₽", type: "out", date: "12 мая" },
                    { label: "Продажа: Дизайн логотипа", amount: "+4 050 ₽", type: "in", date: "10 мая" },
                    { label: "Вывод на карту *5678", amount: "−50 000 ₽", type: "out", date: "8 мая" },
                  ].map((op, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{op.label}</p>
                        <p className="text-xs text-muted-foreground">{op.date}</p>
                      </div>
                      <span className={`font-bold ${op.type === "in" ? "text-green-500" : "text-muted-foreground"}`}>
                        {op.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

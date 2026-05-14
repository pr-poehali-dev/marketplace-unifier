import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { ORDERS, PRODUCTS, PROMO_CODES, CATEGORIES, ADMIN_STATS } from "@/data/mockData";

const ADMIN_NAV = [
  { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
  { id: "users", label: "Пользователи", icon: "Users" },
  { id: "moderation", label: "Модерация", icon: "Shield" },
  { id: "categories", label: "Категории", icon: "FolderTree" },
  { id: "promos", label: "Промокоды", icon: "Ticket" },
  { id: "orders", label: "Заказы", icon: "Package" },
  { id: "reports", label: "Отчёты", icon: "BarChart3" },
  { id: "settings", label: "Настройки", icon: "Settings" },
  { id: "logs", label: "Журнал", icon: "ScrollText" },
];

const MOCK_USERS = [
  { id: 1, name: "Алексей Морозов", email: "morozov@mail.ru", role: "user", status: "active", orders: 18, balance: 24300, joined: "01.01.2026" },
  { id: 2, name: "Мария Котова", email: "kotova@yandex.ru", role: "user", status: "active", orders: 34, balance: 8900, joined: "15.02.2026" },
  { id: 3, name: "ТechStore Pro", email: "tech@techstore.ru", role: "seller", status: "active", orders: 234, balance: 145000, joined: "10.11.2025" },
  { id: 4, name: "Дмитрий Сидоров", email: "sidorov@gmail.com", role: "user", status: "blocked", orders: 2, balance: 0, joined: "25.04.2026" },
];

const PENDING_PRODUCTS = [
  { id: 101, title: "Велосипед горный 29", seller: "SportZone", category: "Спорт", price: 35000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop" },
  { id: 102, title: "Массаж спины 60 мин", seller: "МастерМассаж", category: "Услуги", price: 2500, image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=80&h=80&fit=crop" },
  { id: 103, title: "PlayStation 5 Digital", seller: "GamerShop", category: "Электроника", price: 49900, image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=80&h=80&fit=crop" },
];

const ADMIN_LOGS = [
  { id: 1, admin: "superadmin", action: "Одобрено объявление #98", time: "14 мая 14:20" },
  { id: 2, admin: "superadmin", action: "Заблокирован пользователь Дмитрий С.", time: "14 мая 13:05" },
  { id: 3, admin: "superadmin", action: "Создан промокод SUMMER25", time: "13 мая 10:30" },
  { id: 4, admin: "superadmin", action: "Изменена комиссия: товары 10% → 12%", time: "13 мая 09:15" },
  { id: 5, admin: "superadmin", action: "Одобрено объявление #97", time: "12 мая 18:44" },
  { id: 6, admin: "superadmin", action: "Добавлена категория «Антиквариат»", time: "11 мая 11:22" },
];

const KPI = [
  { label: "Выручка сегодня", value: "284 500 ₽", change: "+12%", icon: "TrendingUp", color: "from-green-400 to-emerald-500" },
  { label: "Новые пользователи", value: "143", change: "+28%", icon: "UserPlus", color: "from-blue-400 to-blue-600" },
  { label: "Активных объявлений", value: "12 847", change: "+5%", icon: "LayoutGrid", color: "from-violet-400 to-purple-600" },
  { label: "Комиссий за день", value: "28 450 ₽", change: "+12%", icon: "Banknote", color: "from-orange-400 to-amber-500" },
];

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [isAuth, setIsAuth] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState(MOCK_USERS);
  const [pending, setPending] = useState(PENDING_PRODUCTS);
  const [promos, setPromos] = useState(PROMO_CODES);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reportType, setReportType] = useState("sales");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Маркет",
    commissionGoods: "10",
    commissionServices: "8",
    email: "admin@market.ru",
    payoutDetails: "ИНН 7701234567, р/с 40702810...",
  });
  const { toast } = useToast();

  /* ── Auth ── */
  const handleAuth = () => {
    if (login === "admin" && password === "admin123") {
      setIsAuth(true);
      setAuthError("");
    } else {
      setAuthError("Неверный логин или пароль");
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
        <div className="bg-card border border-border/60 rounded-3xl p-8 w-full max-w-sm shadow-soft-lg animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-brand mx-auto flex items-center justify-center shadow-brand mb-4">
              <Icon name="Shield" size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">Панель администратора</h1>
            <p className="text-sm text-muted-foreground mt-1">Войдите для управления маркетплейсом</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Логин</label>
              <Input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="admin"
                className="rounded-xl border-border/60"
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border-border/60"
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              />
            </div>
            {authError && <p className="text-xs text-destructive">{authError}</p>}
            <Button onClick={handleAuth} className="w-full btn-gradient rounded-xl font-semibold py-5 mt-1">
              Войти в панель
            </Button>
            <p className="text-center text-xs text-muted-foreground">Логин: admin / Пароль: admin123</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4 text-muted-foreground rounded-xl"
            onClick={() => onNavigate("home")}
          >
            <Icon name="ArrowLeft" size={13} className="mr-1.5" />
            Вернуться на сайт
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-card border-r border-border/60 flex flex-col sticky top-0 h-screen overflow-y-auto scrollbar-thin">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand-sm">
              <Icon name="Shield" size={15} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">Маркет Admin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Superadministrator</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {ADMIN_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon name={item.icon} size={15} fallback="Circle" />
              {item.label}
              {item.id === "moderation" && pending.length > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full gradient-brand text-white text-[10px] font-bold flex items-center justify-center">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border/50">
          <button
            onClick={() => onNavigate("home")}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-all"
          >
            <Icon name="ExternalLink" size={14} />
            Сайт
          </button>
          <button
            onClick={() => setIsAuth(false)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-all"
          >
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto bg-background">
        <div className="p-6">
          {/* ───── DASHBOARD ───── */}
          {tab === "dashboard" && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold">Дашборд</h1>

              {/* KPI cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {KPI.map((kpi) => (
                  <div key={kpi.label} className="bg-card border border-border/60 rounded-2xl p-5 hover-lift">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3 shadow-soft`}>
                      <Icon name={kpi.icon} size={18} className="text-white" fallback="TrendingUp" />
                    </div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-black mt-0.5">{kpi.value}</p>
                    <span className="text-xs text-green-500 font-semibold">{kpi.change} к вчера</span>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue chart */}
                <div className="lg:col-span-2 bg-card border border-border/60 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Выручка</h2>
                    <div className="flex gap-1 bg-secondary rounded-xl p-1 text-xs">
                      {["День", "Неделя", "Месяц"].map((t) => (
                        <button key={t} className="px-3 py-1 rounded-lg hover:bg-card transition-all text-muted-foreground hover:text-foreground">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5 h-40">
                    {[40, 65, 50, 80, 60, 90, 75, 95, 70, 85, 100, 80, 110, 88].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-lg gradient-brand opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                          style={{ height: `${h * 0.9}%` }}
                        />
                        {i % 3 === 0 && <span className="text-[9px] text-muted-foreground">{i + 1}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top categories */}
                <div className="bg-card border border-border/60 rounded-2xl p-5">
                  <h2 className="font-semibold mb-4">Топ-5 категорий</h2>
                  <div className="space-y-3">
                    {[
                      { name: "Электроника", pct: 34, color: "from-blue-400 to-blue-600" },
                      { name: "Услуги", pct: 28, color: "from-violet-400 to-purple-600" },
                      { name: "Одежда", pct: 18, color: "from-pink-400 to-rose-500" },
                      { name: "Авто", pct: 12, color: "from-orange-400 to-amber-500" },
                      { name: "Спорт", pct: 8, color: "from-red-400 to-rose-500" },
                    ].map((cat) => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-muted-foreground">{cat.pct}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Commission */}
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <h2 className="font-semibold mb-3">Комиссии маркетплейса</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { label: "За день", value: "28 450 ₽" },
                    { label: "За неделю", value: "189 000 ₽" },
                    { label: "За месяц", value: "743 000 ₽" },
                    { label: "Средний % ", value: "10%" },
                  ].map((item) => (
                    <div key={item.label} className="bg-secondary/60 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold mt-0.5 gradient-text">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ───── USERS ───── */}
          {tab === "users" && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Пользователи</h1>
                <span className="text-sm text-muted-foreground">{users.length} всего</span>
              </div>
              <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-xs text-muted-foreground">
                      <th className="text-left p-4">Пользователь</th>
                      <th className="text-left p-4 hidden sm:table-cell">Роль</th>
                      <th className="text-left p-4 hidden md:table-cell">Кошелёк</th>
                      <th className="text-left p-4 hidden lg:table-cell">Заказов</th>
                      <th className="text-left p-4">Статус</th>
                      <th className="text-left p-4">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {user.name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "seller" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"}`}>
                            {user.role === "seller" ? "Продавец" : "Пользователь"}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell font-medium">{user.balance.toLocaleString("ru-RU")} ₽</td>
                        <td className="p-4 hidden lg:table-cell">{user.orders}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-red-100 text-red-700 dark:bg-red-900/30"}`}>
                            {user.status === "active" ? "Активен" : "Заблокирован"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: u.status === "active" ? "blocked" : "active" } : u));
                                toast({ description: `Пользователь ${user.status === "active" ? "заблокирован" : "разблокирован"}` });
                              }}
                              className={`p-1.5 rounded-lg transition-all text-xs ${user.status === "active" ? "hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 text-muted-foreground" : "hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-900/20 text-muted-foreground"}`}
                              title={user.status === "active" ? "Заблокировать" : "Разблокировать"}
                            >
                              <Icon name={user.status === "active" ? "Ban" : "CheckCircle"} size={14} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-secondary transition-all text-muted-foreground"
                              title="Просмотр"
                            >
                              <Icon name="Eye" size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ───── MODERATION ───── */}
          {tab === "moderation" && (
            <div className="animate-fade-in space-y-4">
              <h1 className="text-2xl font-bold">
                Модерация
                {pending.length > 0 && <span className="ml-2 text-sm text-muted-foreground font-normal">({pending.length} ожидают)</span>}
              </h1>
              {pending.length === 0 && (
                <div className="text-center py-16 text-muted-foreground bg-card border border-border/60 rounded-2xl">
                  <Icon name="CheckCircle2" size={48} className="mx-auto mb-3 text-green-400" />
                  <p className="font-semibold">Все объявления проверены!</p>
                </div>
              )}
              {pending.map((item) => (
                <div key={item.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover bg-secondary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.category} · {item.seller} · {item.price.toLocaleString("ru-RU")} ₽
                    </p>
                    {rejectTarget === item.id && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Причина отказа..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="h-8 text-xs rounded-xl border-border/60"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-xl text-xs"
                          onClick={() => {
                            setPending((prev) => prev.filter((p) => p.id !== item.id));
                            toast({ description: `Объявление отклонено: ${rejectReason || "без причины"}` });
                            setRejectTarget(null);
                            setRejectReason("");
                          }}
                        >
                          Подтвердить
                        </Button>
                        <Button size="sm" variant="ghost" className="rounded-xl text-xs" onClick={() => setRejectTarget(null)}>
                          Отмена
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="rounded-xl text-xs bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        setPending((prev) => prev.filter((p) => p.id !== item.id));
                        toast({ description: "Объявление одобрено!" });
                      }}
                    >
                      <Icon name="Check" size={13} className="mr-1" />
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs border-destructive/40 text-destructive hover:bg-destructive/5"
                      onClick={() => setRejectTarget(item.id)}
                    >
                      <Icon name="X" size={13} className="mr-1" />
                      Отклонить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ───── CATEGORIES ───── */}
          {tab === "categories" && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Категории</h1>
                <Button className="btn-gradient rounded-xl text-sm">
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Добавить
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shrink-0`}>
                      <Icon name={cat.icon} size={18} className="text-white" fallback="Tag" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.count.toLocaleString()} объявлений</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button className="p-2 rounded-xl hover:bg-secondary transition-all text-muted-foreground">
                        <Icon name="Pencil" size={14} />
                      </button>
                      <button className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all text-muted-foreground">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───── PROMOS ───── */}
          {tab === "promos" && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Промокоды</h1>
                <Button className="btn-gradient rounded-xl text-sm">
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Создать промокод
                </Button>
              </div>
              <div className="space-y-3">
                {promos.map((promo) => (
                  <div key={promo.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4 flex-wrap hover:border-primary/30 transition-all">
                    <div className="bg-primary/10 rounded-xl px-4 py-3 font-mono font-black text-primary text-lg tracking-widest">
                      {promo.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {promo.type === "percent" ? `−${promo.discount}%` : `−${promo.discount} ₽`}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${promo.used >= promo.limit ? "bg-red-100 text-red-700 dark:bg-red-900/30" : "bg-green-100 text-green-700 dark:bg-green-900/30"}`}>
                          {promo.used >= promo.limit ? "Исчерпан" : "Активен"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Использован: {promo.used}/{promo.limit} · До: {promo.expires}
                      </p>
                      {/* Usage bar */}
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden w-48">
                        <div
                          className="h-full gradient-brand"
                          style={{ width: `${Math.min((promo.used / promo.limit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="p-2 rounded-xl hover:bg-secondary transition-all text-muted-foreground">
                        <Icon name="Pencil" size={14} />
                      </button>
                      <button
                        className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all text-muted-foreground"
                        onClick={() => { setPromos((prev) => prev.filter((p) => p.id !== promo.id)); toast({ description: "Промокод удалён" }); }}
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───── ORDERS ───── */}
          {tab === "orders" && (
            <div className="animate-fade-in space-y-4">
              <h1 className="text-2xl font-bold">Все заказы</h1>
              <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-xs text-muted-foreground">
                      <th className="text-left p-4">ID</th>
                      <th className="text-left p-4">Товар</th>
                      <th className="text-left p-4 hidden md:table-cell">Продавец</th>
                      <th className="text-left p-4 hidden md:table-cell">Покупатель</th>
                      <th className="text-left p-4">Сумма</th>
                      <th className="text-left p-4">Статус</th>
                      <th className="text-left p-4">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map((order) => (
                      <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4 font-mono text-xs text-muted-foreground">{order.id}</td>
                        <td className="p-4 font-medium max-w-[150px] truncate">{order.product}</td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">{order.seller}</td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">{order.buyer}</td>
                        <td className="p-4 font-bold">{order.price.toLocaleString("ru-RU")} ₽</td>
                        <td className="p-4">
                          <select
                            defaultValue={order.status}
                            onChange={() => toast({ description: "Статус заказа обновлён" })}
                            className="text-xs bg-secondary border border-border/60 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary/30"
                          >
                            <option value="pending">В обработке</option>
                            <option value="in_progress">В работе</option>
                            <option value="delivered">Доставлен</option>
                            <option value="cancelled">Отменён</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button className="p-1.5 rounded-lg hover:bg-secondary transition-all text-muted-foreground">
                            <Icon name="Eye" size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ───── REPORTS ───── */}
          {tab === "reports" && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold">Отчёты</h1>

              {/* Report builder */}
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <h2 className="font-semibold mb-4">Сформировать отчёт</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Тип отчёта</label>
                    <select
                      value={reportType}
                      onChange={(e) => { setReportType(e.target.value); setReportGenerated(false); }}
                      className="w-full text-sm bg-secondary border border-border/60 rounded-xl px-3 py-2 outline-none"
                    >
                      <option value="sales">Продажи</option>
                      <option value="commission">Комиссии</option>
                      <option value="products">Популярность товаров</option>
                      <option value="delivery">Доставки</option>
                      <option value="users">Пользователи</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">С даты</label>
                    <Input type="date" defaultValue="2026-05-01" className="rounded-xl border-border/60 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">По дату</label>
                    <Input type="date" defaultValue="2026-05-14" className="rounded-xl border-border/60 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    className="btn-gradient rounded-xl font-semibold"
                    onClick={() => setReportGenerated(true)}
                  >
                    <Icon name="Play" size={14} className="mr-2" />
                    Сформировать
                  </Button>
                  {reportGenerated && (
                    <>
                      <Button variant="outline" className="rounded-xl border-border/60">
                        <Icon name="FileSpreadsheet" size={14} className="mr-2" />
                        Скачать Excel
                      </Button>
                      <Button variant="outline" className="rounded-xl border-border/60">
                        <Icon name="FileText" size={14} className="mr-2" />
                        Скачать PDF
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Report preview */}
              {reportGenerated && (
                <div className="bg-card border border-border/60 rounded-2xl p-5 animate-fade-in">
                  <h3 className="font-semibold mb-3">
                    Предпросмотр: {reportType === "sales" ? "Продажи" : reportType === "commission" ? "Комиссии" : reportType === "products" ? "Популярность" : reportType === "delivery" ? "Доставки" : "Пользователи"} (1–14 мая 2026)
                  </h3>
                  {/* Mini chart */}
                  <div className="flex items-end gap-1 h-28 mb-4">
                    {[55, 70, 45, 85, 60, 90, 75, 100, 65, 80, 95, 70, 88, 78].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm gradient-brand opacity-75 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 text-xs text-muted-foreground">
                          <th className="text-left py-2 pr-4">Дата</th>
                          <th className="text-left py-2 pr-4">{reportType === "users" ? "Новых" : "Заказов"}</th>
                          <th className="text-left py-2 pr-4">{reportType === "commission" ? "Комиссия" : "Сумма"}</th>
                          <th className="text-left py-2">Топ категория</th>
                        </tr>
                      </thead>
                      <tbody>
                        {["1 мая", "2 мая", "3 мая", "4 мая", "5 мая"].map((date, i) => (
                          <tr key={date} className="border-b border-border/30 last:border-0">
                            <td className="py-2 pr-4">{date}</td>
                            <td className="py-2 pr-4">{[23, 31, 18, 42, 27][i]}</td>
                            <td className="py-2 pr-4 font-medium">{["84 500", "112 000", "67 800", "156 300", "98 200"][i]} ₽</td>
                            <td className="py-2 text-muted-foreground">{["Электроника", "Услуги", "Одежда", "Электроника", "Авто"][i]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───── SETTINGS ───── */}
          {tab === "settings" && (
            <div className="animate-fade-in space-y-4">
              <h1 className="text-2xl font-bold">Настройки системы</h1>
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Название маркетплейса</label>
                    <Input value={settings.siteName} onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))} className="rounded-xl border-border/60" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Email для уведомлений</label>
                    <Input value={settings.email} onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))} className="rounded-xl border-border/60" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Комиссия на товары, %</label>
                    <Input value={settings.commissionGoods} onChange={(e) => setSettings((s) => ({ ...s, commissionGoods: e.target.value }))} className="rounded-xl border-border/60" type="number" min="0" max="100" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Комиссия на услуги, %</label>
                    <Input value={settings.commissionServices} onChange={(e) => setSettings((s) => ({ ...s, commissionServices: e.target.value }))} className="rounded-xl border-border/60" type="number" min="0" max="100" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">Реквизиты для выплат продавцам</label>
                    <Input value={settings.payoutDetails} onChange={(e) => setSettings((s) => ({ ...s, payoutDetails: e.target.value }))} className="rounded-xl border-border/60" />
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button className="btn-gradient rounded-xl font-semibold" onClick={() => toast({ description: "Настройки сохранены" })}>
                    <Icon name="Save" size={14} className="mr-2" />
                    Сохранить
                  </Button>
                  <Button variant="outline" className="rounded-xl border-border/60">
                    Сбросить
                  </Button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-card border border-destructive/20 rounded-2xl p-6">
                <h2 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                  <Icon name="AlertTriangle" size={16} />
                  Зона опасных действий
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Необратимые действия. Используйте с осторожностью.</p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/5">
                    Очистить кэш
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/5">
                    Техническое обслуживание
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ───── LOGS ───── */}
          {tab === "logs" && (
            <div className="animate-fade-in space-y-4">
              <h1 className="text-2xl font-bold">Журнал действий</h1>
              <div className="bg-card border border-border/60 rounded-2xl divide-y divide-border/30">
                {ADMIN_LOGS.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors">
                    <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white shrink-0">
                      <Icon name="Zap" size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-semibold text-primary">{log.admin}</span> · {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

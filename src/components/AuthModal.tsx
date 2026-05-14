import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { auth, setSession } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: { id: number; name: string; permission_level: string }) => void;
}

export default function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const reset = () => { setError(""); setEmail(""); setPassword(""); setName(""); };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await auth.login(email, password);
        setSession(res.session_id);
        onSuccess({ id: res.user_id, name: res.name, permission_level: res.permission_level });
        toast({ description: `Добро пожаловать, ${res.name}!` });
        onClose();
      } else {
        const res = await auth.register(email, password, name);
        setSession(res.session_id);
        onSuccess({ id: res.user_id, name: res.name, permission_level: "user" });
        toast({ description: "Аккаунт создан! Добро пожаловать 🎉" });
        onClose();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center shadow-brand-sm">
              <Icon name="Zap" size={18} className="text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {mode === "login" ? "Войти в Маркет" : "Создать аккаунт"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Имя</label>
              <Input
                placeholder="Как вас зовут?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-border/60"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1.5">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-border/60"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1.5">Пароль</label>
            <Input
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="rounded-xl border-border/60"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-gradient rounded-xl font-semibold py-5 mt-1"
          >
            {loading ? (
              <Icon name="Loader2" size={16} className="animate-spin mr-2" />
            ) : (
              <Icon name={mode === "login" ? "LogIn" : "UserPlus"} size={16} className="mr-2" />
            )}
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-1">
            {mode === "login" ? (
              <>
                Нет аккаунта?{" "}
                <button onClick={() => { setMode("register"); reset(); }} className="text-primary font-semibold hover:underline">
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{" "}
                <button onClick={() => { setMode("login"); reset(); }} className="text-primary font-semibold hover:underline">
                  Войти
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

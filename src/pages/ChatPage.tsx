import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { CHAT_MESSAGES } from "@/data/mockData";

const MOCK_DIALOG: Record<number, { text: string; fromMe: boolean; time: string }[]> = {
  1: [
    { text: "Здравствуйте! Интересует ваш iPhone 15 Pro Max.", fromMe: true, time: "09:15" },
    { text: "Добрый день! Да, он в наличии, в отличном состоянии.", fromMe: false, time: "09:18" },
    { text: "Какая гарантия?", fromMe: true, time: "09:20" },
    { text: "12 месяцев по закону, чек сохранён. Отправлю трек-номер как только оплатите.", fromMe: false, time: "09:21" },
    { text: "Отлично, оформляю заказ!", fromMe: true, time: "09:22" },
    { text: "Отправил трек-номер, посмотрите в личных сообщениях", fromMe: false, time: "09:35" },
  ],
  2: [
    { text: "Добрый день! Нужен логотип для кофейни.", fromMe: true, time: "Вчера" },
    { text: "Привет! Что-то в виду? Стиль, цвета предпочтительные?", fromMe: false, time: "Вчера" },
    { text: "Минималистично, тёмно-зелёный + бежевый", fromMe: true, time: "Вчера" },
    { text: "Понял! Готов первый вариант, жду ваши правки", fromMe: false, time: "1 ч назад" },
  ],
  3: [
    { text: "Добрый день, есть Nike Air Max 270 в 43 размере?", fromMe: true, time: "Сегодня" },
    { text: "Есть в наличии 42 и 43 размер", fromMe: false, time: "3 ч назад" },
  ],
};

interface ChatPageProps {
  user?: { id: number; name: string; permission_level: string } | null;
}

export default function ChatPage(_props: ChatPageProps) {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState("");
  const [dialogs, setDialogs] = useState(MOCK_DIALOG);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeData = CHAT_MESSAGES.find((c) => c.id === activeChat);
  const messages = activeChat ? dialogs[activeChat] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setDialogs((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), { text: message.trim(), fromMe: true, time }],
    }));
    setMessage("");

    // Auto reply after 1.5s
    setTimeout(() => {
      setDialogs((prev) => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), {
          text: "Спасибо за сообщение! Отвечу в течение нескольких минут.",
          fromMe: false,
          time: `${now.getHours()}:${String(now.getMinutes() + 1).padStart(2, "0")}`,
        }],
      }));
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Сообщения</h1>
      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Chat list */}
        <div className="w-72 shrink-0 bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск чатов..." className="pl-8 h-8 text-sm rounded-xl border-border/60" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {CHAT_MESSAGES.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition-all border-b border-border/30 last:border-0 ${
                  activeChat === chat.id ? "bg-primary/5" : "hover:bg-secondary"
                }`}
              >
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {chat.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{chat.partner}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{chat.product}</p>
                  <p className="text-xs mt-0.5 truncate text-foreground/70">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 rounded-full gradient-brand text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        {activeData ? (
          <div className="flex-1 bg-card border border-border/60 rounded-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm">
                {activeData.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{activeData.partner}</p>
                <p className="text-xs text-muted-foreground truncate">
                  <Icon name="Package" size={10} className="inline mr-1" />
                  {activeData.product} · {activeData.orderId}
                </p>
              </div>
              <button className="p-2 rounded-xl hover:bg-secondary transition-all text-muted-foreground">
                <Icon name="MoreVertical" size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 mesh-bg">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.fromMe ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.fromMe
                        ? "gradient-brand text-white rounded-br-sm shadow-brand-sm"
                        : "bg-background border border-border/60 rounded-bl-sm shadow-soft"
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[10px] mt-1 ${msg.fromMe ? "text-white/60 text-right" : "text-muted-foreground"}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50 flex items-center gap-2">
              <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <Icon name="Paperclip" size={18} />
              </button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Напишите сообщение..."
                className="flex-1 rounded-xl border-border/60 text-sm"
              />
              <Button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="btn-gradient rounded-xl w-10 h-10 p-0"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-card border border-border/60 rounded-2xl flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-3 opacity-20" />
              <p>Выберите чат</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
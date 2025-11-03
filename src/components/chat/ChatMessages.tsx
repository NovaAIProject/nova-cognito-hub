import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";

const ThinkingIndicator = () => {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-accent text-white">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="glass-panel rounded-2xl px-4 py-3 bg-card/50">
        <span 
          className="text-sm inline-block bg-gradient-to-r from-muted-foreground via-primary to-muted-foreground bg-clip-text text-transparent animate-[shimmer_4s_ease-in-out_infinite] bg-[length:200%_100%]"
        >
          Thinking
        </span>
      </div>
    </div>
  );
};

interface Message {
  id: string;
  role: string;
  content: string;
  model?: string;
  created_at: string;
}

interface ChatMessagesProps {
  chatId: string | null;
  isGenerating?: boolean;
}

const ChatMessages = ({ chatId, isGenerating }: ChatMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const fetchMessages = async () => {
    if (!chatId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2 font-poppins">
              Welcome to Nova AI
            </h2>
            <p className="text-muted-foreground mb-6">
              Ask me anything - I'm powered by the latest AI models
            </p>
          </div>
          
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex gap-2 justify-center">
              <button className="group glass-panel rounded-lg px-3 py-2 hover:shadow-smooth hover-scale smooth-transition border border-border/50 hover:border-primary/30 flex items-center gap-2">
                <span className="text-base">🎨</span>
                <span className="text-sm">Create image</span>
              </button>
              
              <button className="group glass-panel rounded-lg px-3 py-2 hover:shadow-smooth hover-scale smooth-transition border border-border/50 hover:border-primary/30 flex items-center gap-2">
                <span className="text-base">📝</span>
                <span className="text-sm">Summarize</span>
              </button>
              
              <button className="group glass-panel rounded-lg px-3 py-2 hover:shadow-smooth hover-scale smooth-transition border border-border/50 hover:border-primary/30 flex items-center gap-2">
                <span className="text-base">💻</span>
                <span className="text-sm">Write code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden" ref={scrollRef}>
      <ScrollArea className="h-full p-4">
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isGenerating && <ThinkingIndicator />}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;

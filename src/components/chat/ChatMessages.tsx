import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  role: string;
  content: string;
  model?: string;
  created_at: string;
}

interface ChatMessagesProps {
  chatId: string | null;
}

const ChatMessages = ({ chatId }: ChatMessagesProps) => {
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
  }, [messages]);

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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2">
              Welcome to Nova AI
            </h2>
            <p className="text-muted-foreground">
              Start a new chat to begin your conversation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;

// Missing import - will add in next file
import { Sparkles } from "lucide-react";

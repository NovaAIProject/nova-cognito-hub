import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Settings, Moon, Sun, LogOut, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";

interface Chat {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  currentChatId: string | null;
  onChatSelect: (id: string) => void;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar = ({ currentChatId, onChatSelect, userId, isOpen, onClose }: ChatSidebarProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchChats();
  }, [userId]);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Failed to load chats");
      return;
    }

    setChats(data || []);
  };

  const handleNewChat = async () => {
    const { data, error } = await supabase
      .from("chats")
      .insert([{ user_id: userId, title: "New Chat" }])
      .select()
      .single();

    if (error) {
      toast.error("Failed to create chat");
      return;
    }

    setChats([data, ...chats]);
    onChatSelect(data.id);
    toast.success("New chat created");
  };

  const handleDeleteChat = async (id: string) => {
    const { error } = await supabase.from("chats").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete chat");
      return;
    }

    setChats(chats.filter((chat) => chat.id !== id));
    if (currentChatId === id) {
      onChatSelect(chats[0]?.id || "");
    }
    toast.success("Chat deleted");
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    const { error } = await supabase
      .from("chats")
      .update({ title: newTitle })
      .eq("id", id);

    if (error) {
      toast.error("Failed to rename chat");
      return;
    }

    setChats(chats.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)));
    toast.success("Chat renamed");
  };

  const handleDuplicateChat = async (id: string) => {
    const originalChat = chats.find((chat) => chat.id === id);
    if (!originalChat) return;

    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert([{ user_id: userId, title: `${originalChat.title} (Copy)` }])
      .select()
      .single();

    if (chatError) {
      toast.error("Failed to duplicate chat");
      return;
    }

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", id);

    if (messagesError) {
      toast.error("Failed to copy messages");
      return;
    }

    if (messages && messages.length > 0) {
      const newMessages = messages.map((msg) => ({
        chat_id: newChat.id,
        role: msg.role,
        content: msg.content,
        model: msg.model,
      }));

      await supabase.from("messages").insert(newMessages);
    }

    setChats([newChat, ...chats]);
    toast.success("Chat duplicated");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const handleSelectChat = (id: string) => {
    onChatSelect(id);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-64 border-r border-border glass-panel flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-border md:hidden">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 hover-scale smooth-transition"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-2">
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={currentChatId === chat.id}
              onSelect={() => handleSelectChat(chat.id)}
              onDelete={() => handleDeleteChat(chat.id)}
              onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
              onDuplicate={() => handleDuplicateChat(chat.id)}
            />
          ))}
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 smooth-transition hover-scale"
            onClick={() => toast.info("Contact support coming soon!")}
          >
            <HelpCircle className="w-4 h-4" />
            Contact Support
            <span className="ml-auto text-xs text-muted-foreground">Soon</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 smooth-transition hover-scale"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive smooth-transition hover-scale"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;

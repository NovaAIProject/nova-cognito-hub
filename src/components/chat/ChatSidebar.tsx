import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Plus, MessageSquare, Settings, Moon, Sun, LogOut, HelpCircle, Search, Sparkles } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        border-r border-border/50 bg-background/95 backdrop-blur-xl flex flex-col
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
      `}>
        <div className={`flex flex-col h-full transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {/* Header with Logo and Title */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: "var(--gradient-primary)" }} />
                <Sparkles className="w-5 h-5 text-white relative z-10" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Nova AI</span>
            </div>
            
            <Button
              onClick={handleNewChat}
              className="w-full justify-center gap-2 h-11 rounded-xl font-medium shadow-sm hover:shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Chats Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 py-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</span>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 pb-4">
                {filteredChats.map((chat) => (
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
              </div>
            </ScrollArea>
          </div>

          <div className="p-3 border-t border-border/50 bg-muted/30 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 h-9 hover:bg-background/50 text-muted-foreground hover:text-foreground"
              onClick={() => toast.info("Contact support coming soon!")}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Support</span>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Soon</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 h-9 hover:bg-background/50 text-muted-foreground hover:text-foreground"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-sm">{darkMode ? "Light" : "Dark"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 h-9 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;

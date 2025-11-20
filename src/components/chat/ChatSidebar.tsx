import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Plus, MessageSquare, Settings, Moon, Sun, LogOut, HelpCircle, Search, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";
import SupportDialog from "./SupportDialog";
import ChangelogDialog from "./ChangelogDialog";
import ModelComparisonDialog from "./ModelComparisonDialog";

interface Chat {
  id: string;
  title: string;
  updated_at: string;
  pinned?: boolean;
}

interface ChatSidebarProps {
  currentChatId: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar = ({ currentChatId, onChatSelect, onNewChat, userId, isOpen, onClose }: ChatSidebarProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const navigate = useNavigate();

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const pinnedChats = filteredChats.filter(chat => chat.pinned);
  const unpinnedChats = filteredChats.filter(chat => !chat.pinned);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchChats();
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // Fetch username from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', data.user.id)
        .single();
      
      setUsername(profileData?.username || data.user.email?.split('@')[0] || "User");
    }
  };

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

  const handleTogglePin = async (id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;

    const { error } = await supabase
      .from("chats")
      .update({ pinned: !chat.pinned })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update pin status");
      return;
    }

    setChats(chats.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
    toast.success(chat.pinned ? "Chat unpinned" : "Chat pinned");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const handleSelectChat = (id: string) => {
    onChatSelect(id);
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
      <aside className={`
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0'}
        border-r border-border glass-panel flex flex-col
        transition-all duration-300 ease-in-out
        overflow-hidden
        fixed md:relative z-50 h-full
      `}>
        <div className="flex flex-col h-full w-64">{/* Fixed width content */}
          {/* Header with Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-[2px] bg-background rounded-[10px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
            
            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-2 bg-transparent border border-border/50 hover:bg-muted/50 hover:border-border mb-3 text-foreground"
            >
              <Plus className="w-4 h-4" />
              <span className="text-foreground">New Chat</span>
            </Button>

            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <>
              <div className="px-4 pt-4 pb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pinned</span>
              </div>
              <div className="px-2 pr-3">
                {pinnedChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentChatId === chat.id}
                    onSelect={() => handleSelectChat(chat.id)}
                    onDelete={() => handleDeleteChat(chat.id)}
                    onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
                    onDuplicate={() => handleDuplicateChat(chat.id)}
                    onTogglePin={() => handleTogglePin(chat.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Chats Label */}
          <div className="px-4 pt-4 pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {pinnedChats.length > 0 ? "All Chats" : "Chats"}
            </span>
          </div>

          <ScrollArea className="flex-1 px-2 pr-3">
            {unpinnedChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={currentChatId === chat.id}
                onSelect={() => handleSelectChat(chat.id)}
                onDelete={() => handleDeleteChat(chat.id)}
                onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
                onDuplicate={() => handleDuplicateChat(chat.id)}
                onTogglePin={() => handleTogglePin(chat.id)}
              />
            ))}
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-2">
            <ChangelogDialog />
            <ModelComparisonDialog />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-foreground/10"
              onClick={() => setShowSupportDialog(true)}
            >
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-foreground/5"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
            
            {/* Profile Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 hover:bg-foreground/5"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-semibold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-left truncate text-sm font-medium">{username}</span>
                <svg className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-xl p-2 space-y-1 animate-slide-up">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs hover:bg-muted"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="w-3 h-3 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-3 h-3 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
      
      <SupportDialog 
        open={showSupportDialog} 
        onOpenChange={setShowSupportDialog}
      />
    </>
  );
};

export default ChatSidebar;

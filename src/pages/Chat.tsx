import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import { toast } from "sonner";

const Chat = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse gradient-text text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from("chats")
        .insert([{ user_id: session.user.id, title: "New Chat" }])
        .select()
        .single();

      if (error) {
        console.error("Failed to create chat:", error);
        toast.error("Failed to create chat");
        return;
      }

      if (data) {
        setCurrentChatId(data.id);
        toast.success("New chat created");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={setCurrentChatId}
        userId={session.user.id}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0" style={{ background: "var(--gradient-mesh)" }} />
        
        <div className="relative z-10 flex flex-col h-full">
          <ChatHeader 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNewChat={handleNewChat}
          />
          
          <ChatMessages chatId={currentChatId} isGenerating={isGenerating} />
          
          <ChatInput
            chatId={currentChatId}
            onChatCreated={setCurrentChatId}
            userId={session.user.id}
            onGeneratingChange={setIsGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;

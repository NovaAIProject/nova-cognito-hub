import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Users, MessageSquare } from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  username: string;
}

interface SupportMessage {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check admin via edge function instead
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setIsAdmin(true);
      fetchData();
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Access denied");
      navigate("/chat");
    }
  };

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [usersResponse, messagesResponse] = await Promise.all([
        supabase.functions.invoke("admin-get-users", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }),
        supabase.functions.invoke("admin-get-support", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }),
      ]);

      if (usersResponse.data?.users) {
        setUsers(usersResponse.data.users);
      }
      if (messagesResponse.data?.messages) {
        setMessages(messagesResponse.data.messages);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="support">
              <MessageSquare className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Registered Users ({users.length})</h2>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="glass-panel p-4 rounded-lg border border-border/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Username</p>
                          <p className="font-medium">{user.username}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Sign In</p>
                          <p className="font-medium">
                            {user.last_sign_in_at
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : "Never"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Support Messages ({messages.length})</h2>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="glass-panel p-4 rounded-lg border border-border/50"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">From</p>
                            <p className="font-medium">{msg.email}</p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {msg.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Subject</p>
                          <p className="font-medium">{msg.subject}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Message</p>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

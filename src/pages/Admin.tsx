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

      // Check if user has admin role in user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        toast.error("Access denied - Admin role required");
        navigate("/chat");
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="hover:bg-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage users and support messages</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Support ({messages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-0">
            <Card className="border-border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
                <ScrollArea className="h-[600px] pr-4">
                  {users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user) => (
                        <Card key={user.id} className="p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{user.username || 'Unknown User'}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                                <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                                <span>Last sign in: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-0">
            <Card className="border-border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Support Messages</h2>
                <ScrollArea className="h-[600px] pr-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No support messages</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <Card key={msg.id} className="p-5 hover:bg-accent/50 transition-colors">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{msg.subject}</h3>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    msg.status === 'pending' 
                                      ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' 
                                      : 'bg-green-500/20 text-green-700 dark:text-green-300'
                                  }`}>
                                    {msg.status}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{msg.email}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm bg-muted/50 p-3 rounded-md">{msg.message}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import AuthPage from "./pages/AuthPage";
import AppShell from "./components/AppShell";
import FeedPage from "./pages/FeedPage";
import PostDetailPage from "./pages/PostDetailPage";
import RoomPage from "./pages/RoomPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import MessagesPage from "./pages/MessagesPage";
import NewMessagePage from "./pages/NewMessagePage";
import NotificationsPage from "./pages/NotificationsPage";
import SavedPostsPage from "./pages/SavedPostsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route index element={<FeedPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="messages/new" element={<NewMessagePage />} />
              <Route path="messages/:threadId" element={<MessagesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="saved" element={<SavedPostsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="user/:username" element={<ProfilePage />} />
              <Route path="post/:postId" element={<PostDetailPage />} />
              <Route path="post/:postId/room" element={<RoomPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

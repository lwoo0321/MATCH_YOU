import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SubjectProvider } from "@/contexts/SubjectContext";
import BottomNav from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Planner from "./pages/Planner";
import Stopwatch from "./pages/Stopwatch";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import SubjectSettings from "./pages/SubjectSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SubjectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/plans" element={<Planner />} />
            <Route path="/stopwatch" element={<Stopwatch />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:roomId" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings/subjects" element={<SubjectSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </SubjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

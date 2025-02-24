
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuth } from "@clerk/clerk-react";

const queryClient = new QueryClient();

// useAuth can't be used inside jsx must be used inside a function
const RootRoute = () => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <Index /> : <Home />;
};

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <Navigate to="/" replace /> : children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect><Signup /></AuthRedirect>} />
          <Route path="/planner" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

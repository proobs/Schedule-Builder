
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useAuth } from "@clerk/clerk-react";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const API_KEY = import.meta.env.API_KEY
const APP_ID = import.meta.env.APPID
const MEASUREID = import.meta.env.MEASUREID

const firebaseConfig = {
  apiKey:API_KEY,
  authDomain: "umbc447.firebaseapp.com",
  projectId: "umbc447",
  storageBucket: "umbc447.firebasestorage.app",
  messagingSenderId: "490067234847",
  appId: APP_ID,
  measurementId: MEASUREID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

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
          <Route path="/register" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/planner" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

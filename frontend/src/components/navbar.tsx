import { Button } from "../components/ui/button";
import { GraduationCap} from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-planner-accent/20 z-50">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-planner-accent" />
            <span className="text-xl font-bold text-planner-primary">UMBC</span>
          </a>
          <div className="flex gap-4">
            <Button 
              asChild 
              variant="ghost" 
              className="text-planner-primary hover:text-planner-accent"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button 
              asChild 
              className="bg-planner-primary hover:bg-planner-secondary"
            >
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </nav>
    );
  };
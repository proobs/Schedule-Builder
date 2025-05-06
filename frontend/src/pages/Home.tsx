import { Button } from "../components/ui/button";
import { GraduationCap, Quote, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/navbar";


const Footer = () => {
  return (
    <footer className="bg-planner-primary text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-planner-accent" />
              <span className="text-xl font-bold">UMBC</span>
            </div>
            <p className="text-gray-300 text-sm">
              1000 Hilltop Circle<br />
              Baltimore, MD 21250
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-2">
              <a href="mailto:info@umbc.edu" className="flex items-center gap-2 text-gray-300 hover:text-planner-accent">
                <Mail className="w-4 h-4" />
                info@umbc.edu
              </a>
              <a href="tel:+14104551000" className="flex items-center gap-2 text-gray-300 hover:text-planner-accent">
                <Phone className="w-4 h-4" />
                410-455-1000
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/login" className="block text-gray-300 hover:text-planner-accent">Sign In</Link>
              <a href="https://www.umbc.edu" className="block text-gray-300 hover:text-planner-accent" target="_blank" rel="noopener noreferrer">UMBC Website</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} UMBC Course Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-planner-lightGold to-white flex flex-col">
      <Navbar />
      <div className="container flex flex-col items-center justify-center flex-grow py-12 text-center pt-24">
        <div className="space-y-6 animate-fade-in max-w-[800px] mx-auto">
          <a href="/" className="flex items-center justify-center gap-3">
            <GraduationCap className="w-12 h-12 text-planner-accent" />
            <h1 className="text-4xl font-bold text-planner-primary">
              UMBC Course Planner
            </h1>
          </a>
          
          <p className="max-w-[600px] text-lg text-planner-secondary mx-auto">
            Plan your academic journey with our interactive 4-year course planning tool.
            Customize your path, track prerequisites, and make informed decisions about
            your education.
          </p>

          <div className="flex flex-col items-center gap-4 mt-8">
            <Button 
              asChild 
              size="lg" 
              className="text-lg w-48 bg-planner-primary hover:bg-planner-secondary text-white"
            >
              <Link to="/login">Sign In</Link>
            </Button>

          </div>

          <div className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
              <div className="space-y-2 p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-planner-accent/20">
                <h3 className="text-lg font-medium text-planner-primary">
                  Customizable Plans
                </h3>
                <p className="text-sm text-planner-secondary">
                  Modify your academic plan based on your preferences and AP credits
                </p>
              </div>
              <div className="space-y-2 p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-planner-accent/20">
                <h3 className="text-lg font-medium text-planner-primary">
                  Prerequisite Tracking
                </h3>
                <p className="text-sm text-planner-secondary">
                  Stay on track with automatic prerequisite validation
                </p>
              </div>
              <div className="space-y-2 p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-planner-accent/20">
                <h3 className="text-lg font-medium text-planner-primary">
                  Course Insights
                </h3>
                <p className="text-sm text-planner-secondary">
                  Get valuable insights about course availability and scheduling
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;

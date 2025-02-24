
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Course {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string[];
  gpa?: number;
}

interface SemesterBlockProps {
  term: string;
  year: number;
  credits: number;
  children: React.ReactNode;
  courses: Course[];
  onGPAChange: (courseCode: string, gpa: string) => void;
}

export const SemesterBlock = ({
  term,
  year,
  credits,
  children,
  courses,
}: SemesterBlockProps) => {
  const calculateSemesterGPA = () => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const weightedSum = courses.reduce((sum, course) => {
      return sum + (course.gpa || 0) * course.credits;
    }, 0);
    
    return totalCredits === 0 ? 0 : (weightedSum / totalCredits);
  };

  const semesterGPA = calculateSemesterGPA();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-planner-accent" />
          <h2 className="font-medium text-planner-primary">
            {term} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-planner-accent/10 text-planner-primary border border-planner-accent/20">
            {credits} credits
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-planner-accent/10 text-planner-primary border border-planner-accent/20">
            GPA: {semesterGPA.toFixed(2)}
          </span>
        </div>
      </div>
      <Card className="p-4 space-y-4 bg-white/50 backdrop-blur-sm border border-planner-accent/20 hover:border-planner-accent/40 transition-colors shadow-sm hover:shadow">
        {children}
      </Card>
    </div>
  );
};
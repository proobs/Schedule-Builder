import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface SemesterBlockProps {
  term: string;
  year: number;
  credits: number;
  children: React.ReactNode;
}

export const SemesterBlock = ({
  term,
  year,
  credits,
  children,
}: SemesterBlockProps) => {
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-planner-primary" />
          <h2 className="font-medium text-planner-primary">
            {term} {year}
          </h2>
        </div>
        <span className="px-3 py-1 text-sm rounded-full bg-planner-accent text-planner-primary">
          {credits} credits
        </span>
      </div>
      <Card className="p-4 space-y-4 min-h-[200px] bg-white/50 backdrop-blur-sm">
        {children}
      </Card>
    </div>
  );
};

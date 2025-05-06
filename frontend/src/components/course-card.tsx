import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Book, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CourseCardProps {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string | null;
  components?: string;
  attributes?: string[];
  consent?: string;
  courseId?: string;
  grading?: string;
  isAvailable?: boolean;
  className?: string;
  gpa?: number;
  onGPAChange?: (gpa: string) => void;
}

export const CourseCard = ({
  code,
  name,
  credits,
  prerequisites,
  components = "Lecture",
  attributes = [],
  consent = "No Special Consent Required",
  courseId = "",
  grading = "Graded",
  isAvailable = true,
  className,
  gpa = 0,
  onGPAChange,
}: CourseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGPAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent card expansion when interacting with input
    if (onGPAChange) {
      onGPAChange(e.target.value);
    }
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200",
        "bg-white/90 backdrop-blur-sm border border-gray-200",
        !isAvailable && "opacity-60",
        isExpanded && "ring-1 ring-planner-accent/20",
        className
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-4 h-4 text-planner-primary" />
          <span className="font-medium text-planner-primary">{code}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs rounded-full bg-planner-accent text-planner-primary">
            {credits} cr
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-planner-accent/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-planner-accent/60" />
          )}
        </div>
      </div>
      <h3 className="mt-2 text-sm font-medium text-planner-secondary">{name}</h3>
      
      <div className={cn(
        "grid transition-all",
        isExpanded ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <div className="space-y-3">
            <div className="pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <Label htmlFor={`gpa-${code}`} className="text-xs font-semibold text-planner-primary">
                GPA (0-4.0)
              </Label>
              <Input
                id={`gpa-${code}`}
                type="number"
                min="0"
                max="4"
                step="0.1"
                value={gpa}
                onChange={handleGPAChange}
                className="mt-1 h-8 text-sm"
                placeholder="Enter GPA"
              />
            </div>

            {courseId && (
              <div>
                <h4 className="text-xs font-semibold text-planner-primary">Course ID</h4>
                <p className="text-xs text-gray-600 mt-1">
                  {courseId}
                </p>
              </div>
            )}
            
            {prerequisites && prerequisites.length > 0 ? (
              <div>
                <h4 className="text-xs font-semibold text-planner-primary">Prerequisites</h4>
                <ul className="mt-1 text-xs text-gray-600">
                  {prerequisites}
                </ul>
              </div>
            ) : (
              <div>
                <h4 className="text-xs font-semibold text-planner-primary">Prerequisites</h4>
                <p className="text-xs text-gray-600 mt-1">
                  None
                </p>
              </div>
            )}

            {attributes && attributes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-planner-primary">Attributes</h4>
                <ul className="mt-1 text-xs text-gray-600">
                  {attributes.map((attribute, index) => (
                    <li key={`${attribute}-${index}`}>{attribute}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-planner-primary">Additional Information</h4>
              <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Department:</span>{" "}
                  {code.split(" ")[0]}
                </div>
                <div>
                  <span className="font-medium">Level:</span>{" "}
                  {code.split(" ")[1]?.[0]}00
                </div>
                <div>
                  <span className="font-medium">Components:</span>{" "}
                  {components}
                </div>
                <div>
                  <span className="font-medium">Consent:</span>{" "}
                  {consent === "No Special Consent Required" ? "Not Required" : "Required"}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Grading:</span>{" "}
                  {grading}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
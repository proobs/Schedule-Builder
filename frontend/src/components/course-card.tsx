import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Book, ChevronDown, ChevronUp, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Grade mapping object
const GRADE_TO_GPA = {
  "A": 4.0,
  "B": 3.0,
  "C": 2.0,
  "D": 1.0,
  "F": 0.0,
  "": 0.0 // Default/empty value
};

const getGradeFromGPA = (gpa) => {
  if (gpa === 0 || gpa === null || gpa === undefined) return "";
  
  const closest = Object.entries(GRADE_TO_GPA).reduce((prev, [grade, value]) => {
    if (Math.abs(value - gpa) < Math.abs(prev.value - gpa)) {
      return { grade, value };
    }
    return prev;
  }, { grade: "", value: Infinity });
  
  return closest.grade;
};

interface CourseCardProps {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string | null;
  components?: string;
  attributes?: string[] | null;
  consent?: string;
  courseId?: string;
  grading?: string;
  description?: string;
  gritview?: string;
  isAvailable?: boolean;
  className?: string;
  gpa?: number;
  onGPAChange?: (gpa: string) => void;
  onRemove?: (code: string) => void;
}

export const CourseCard = ({
  code,
  name,
  credits,
  prerequisites,
  components = "Lecture",
  attributes = null,
  consent = "No Special Consent Required",
  courseId = "",
  grading = "Graded",
  description = "",
  gritview = "",
  isAvailable = true,
  className,
  gpa = 0,
  onGPAChange,
  onRemove,
}: CourseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(getGradeFromGPA(gpa));

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    if (onGPAChange) {
      onGPAChange(GRADE_TO_GPA[grade].toString());
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking remove button
    setIsRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (onRemove) {
      onRemove(code);
    }
    setIsRemoveDialogOpen(false);
  };

  const handleGritViewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking the link
  };

  return (
    <>
      <Card
        className={cn(
          "p-4 transition-all duration-200 relative",
          "bg-white/90 backdrop-blur-sm border border-gray-200",
          !isAvailable && "opacity-60",
          isExpanded && "ring-1 ring-planner-accent/20",
          className
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
      >
        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
          onClick={handleRemoveClick}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-start justify-between pr-6">
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
                <Label htmlFor={`grade-${code}`} className="text-xs font-semibold text-planner-primary">
                  Grade
                </Label>
                <Select 
                  value={selectedGrade} 
                  onValueChange={handleGradeChange}
                >
                  <SelectTrigger id={`grade-${code}`} className="mt-1 h-8 text-sm">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {courseId && (
                <div>
                  <h4 className="text-xs font-semibold text-planner-primary">Course ID</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {courseId}
                  </p>
                </div>
              )}
              
              {prerequisites && (
                <div>
                  <h4 className="text-xs font-semibold text-planner-primary">Prerequisites</h4>
                  <p className="mt-1 text-xs text-gray-600">
                    {prerequisites}
                  </p>
                </div>
              )}

              {attributes && Array.isArray(attributes) && attributes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-planner-primary">Attributes</h4>
                  <ul className="mt-1 text-xs text-gray-600">
                    {attributes.map((attribute, index) => (
                      <li key={`${attribute}-${index}`}>{attribute}</li>
                    ))}
                  </ul>
                </div>
              )}

              {description && (
                <div>
                  <h4 className="text-xs font-semibold text-planner-primary">Description</h4>
                  <p className="mt-1 text-xs text-gray-600">
                    {description}
                  </p>
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

              {gritview && (
                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  <a 
                    href={gritview} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={handleGritViewClick}
                  >
                    <ExternalLink className="w-3 h-3" /> 
                    View on GritView
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Remove Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Course</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to remove <span className="font-medium text-planner-primary">{code}: {name}</span> from your plan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmRemove}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
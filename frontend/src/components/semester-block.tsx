import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import courseData from "../data/course_data.json";

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
  onAddCourse?: (course: any) => void;
}

export const SemesterBlock = ({
  term,
  year,
  credits,
  children,
  courses,
  onGPAChange,
  onAddCourse,
}: SemesterBlockProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [subjectLabels, setSubjectLabels] = useState([]);

  // Calculate semester GPA
  const calculateSemesterGPA = () => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const weightedSum = courses.reduce((sum, course) => {
      return sum + (course.gpa || 0) * course.credits;
    }, 0);
    
    return totalCredits === 0 ? 0 : (weightedSum / totalCredits);
  };

  const semesterGPA = calculateSemesterGPA();

  // Load subject labels when dialog opens
  const handleOpenDialog = () => {
    // Extract unique subject labels (e.g., "CMSC", "MATH")
    const courseNames = Object.keys(courseData);
    const subjects = new Set();
    courseNames.forEach(courseName => {
      const parts = courseName.split(' ');
      if (parts.length > 0) {
        subjects.add(parts[0]);
      }
    });
    
    setSubjectLabels(Array.from(subjects).sort());
    setIsAddDialogOpen(true);
  };

  // Filter courses when subject changes
  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    
    if (subject) {
      const courseNames = Object.keys(courseData);
      const filtered = courseNames.filter(course => 
        course.startsWith(subject + " ")
      );
      setFilteredCourses(filtered);
      setSelectedCourse(""); // Reset selected course when subject changes
    } else {
      setFilteredCourses([]);
    }
  };

  // Add course function
  const handleAddCourse = () => {
    if (!selectedCourse) return;
    
    try {
      // Get course details from the local JSON data
      const courseDetails = courseData[selectedCourse];
      
      if (!courseDetails) {
        console.error("Course not found:", selectedCourse);
        return;
      }
      
      // Create new course object with all the available fields
      const newCourse = {
        code: selectedCourse,
        name: courseDetails['Course Title'] || `${selectedCourse}`,
        credits: courseDetails['Credits'] || 3,
        prerequisites: courseDetails['Prerequisites'] || null,
        components: courseDetails['Components'] || "Lecture",
        attributes: courseDetails['Attributes'] || null,
        consent: courseDetails['Consent'] || "No Special Consent Required",
        courseId: courseDetails['Course ID'] || "",
        grading: courseDetails['Grading'] || "Graded",
        description: courseDetails['Description'] || "",
        gritview: courseDetails['gritview'] || "",
        gpa: 0,
        semester: `${term.toLowerCase()}${year}`,
        term,
        year
      };
      
      // Call the parent component's onAddCourse function
      if (onAddCourse) {
        onAddCourse(newCourse);
      } else {
        console.log("No onAddCourse handler provided:", newCourse);
      }
      
      // Reset selection and close dialog
      setSelectedCourse("");
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

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
        
        {/* Add Course Button */}
        <div 
          className="mt-4 border-2 border-dashed border-planner-accent/40 rounded-md p-4 flex items-center justify-center hover:bg-planner-accent/5 transition-colors cursor-pointer" 
          onClick={handleOpenDialog}
          style={{ minHeight: "80px" }}
        >
          <Button
            variant="ghost"
            className="w-full h-full py-6 text-planner-accent hover:text-planner-primary hover:bg-planner-accent/10"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Course to {term} {year}
          </Button>
        </div>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Course to {term} {year}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="courseLabel">Course Subject</Label>
              <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                <SelectTrigger id="courseLabel">
                  <SelectValue placeholder="Select Course Subject" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {subjectLabels.length > 0 ? (
                    subjectLabels.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Loading subjects...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="courseCode">Course</Label>
              <Select 
                value={selectedCourse} 
                onValueChange={setSelectedCourse}
                disabled={!selectedSubject || filteredCourses.length === 0}
              >
                <SelectTrigger id="courseCode">
                  <SelectValue placeholder={!selectedSubject ? "Select a subject first" : "Select Course"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((courseName) => (
                      <SelectItem key={courseName} value={courseName}>
                        {courseName}
                      </SelectItem>
                    ))
                  ) : selectedSubject ? (
                    <SelectItem value="no-courses" disabled>
                      No courses found for {selectedSubject}
                    </SelectItem>
                  ) : (
                    <SelectItem value="select-subject" disabled>
                      Select a subject first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCourse}
              disabled={!selectedCourse}
            >
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
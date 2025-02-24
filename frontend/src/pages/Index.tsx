import { useState } from "react";
import { CourseCard } from "@/components/course-card";
import { SemesterBlock } from "@/components/semester-block";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, Calculator, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string[];
  gpa?: number;
}

const sampleCourses: Course[] = [
  {
    code: "CMSC 201",
    name: "Computer Science I",
    credits: 4,
    prerequisites: [],
    gpa: 0,
  },
  {
    code: "MATH 151",
    name: "Calculus I",
    credits: 4,
    prerequisites: [],
    gpa: 0,
  },
  {
    code: "CMSC 202",
    name: "Computer Science II",
    credits: 4,
    prerequisites: ["CMSC 201"],
    gpa: 0,
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const calculateWeightedGPA = () => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const weightedSum = courses.reduce((sum, course) => {
      return sum + (course.gpa || 0) * course.credits;
    }, 0);
    
    return totalCredits === 0 ? 0 : (weightedSum / totalCredits);
  };

  const handleGPAChange = (courseCode: string, newGPA: string) => {
    const gpaValue = parseFloat(newGPA);
    if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4.0) return;

    setCourses(courses.map(course => 
      course.code === courseCode 
        ? { ...course, gpa: gpaValue }
        : course
    ));
  };

  const generateSemesterOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const terms = ["Winter", "Spring", "Summer", "Fall"];
    
    for (let year = currentYear; year < currentYear + 8; year++) {
      for (let term of terms) {
        options.push({
          value: `${term.toLowerCase()}${year}`,
          label: `${term} ${year}`
        });
      }
    }
    return options;
  };

  const semesterOptions = generateSemesterOptions();
  const weightedGPA = calculateWeightedGPA();
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-planner-lightGold to-white relative">
      <header className="w-full py-6 bg-white/80 backdrop-blur-sm border-b border-planner-accent/20 sticky top-0 z-50">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-planner-accent" />
            <h1 className="text-2xl font-medium text-planner-primary">
              Course Planner
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-planner-accent/60" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10 w-64 border-planner-accent/20 focus:border-planner-accent/40 focus:ring-planner-accent/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="border-planner-accent/20 text-planner-primary hover:bg-planner-accent/10 hover:text-planner-primary"
            >
              Clear Plan
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <Card className="p-4 bg-white/90 backdrop-blur-sm border-planner-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calculator className="w-5 h-5 text-planner-accent" />
              <div>
                <h2 className="text-sm font-medium text-planner-primary">Weighted GPA</h2>
                <p className="text-2xl font-semibold text-planner-accent">
                  {weightedGPA.toFixed(2)}/4.00
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Total Credits</span>
              <p className="text-lg font-medium text-planner-primary">{totalCredits}</p>
            </div>
          </div>
        </Card>
      </div>

      <main className="container py-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SemesterBlock 
              term="Fall" 
              year={2024} 
              credits={8}
              courses={courses.slice(0, 2)}
              onGPAChange={handleGPAChange}
            >
              {courses.slice(0, 2).map((course) => (
                <CourseCard 
                  key={course.code} 
                  {...course} 
                  gpa={course.gpa}
                  onGPAChange={(newGPA) => handleGPAChange(course.code, newGPA)}
                />
              ))}
            </SemesterBlock>
            <SemesterBlock 
              term="Spring" 
              year={2025} 
              credits={4}
              courses={courses.slice(2)}
              onGPAChange={handleGPAChange}
            >
              {courses.slice(2).map((course) => (
                <CourseCard 
                  key={course.code} 
                  {...course}
                  gpa={course.gpa}
                  onGPAChange={(newGPA) => handleGPAChange(course.code, newGPA)}
                />
              ))}
            </SemesterBlock>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed left-8 bottom-8 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-planner-accent text-planner-primary hover:bg-planner-accent/90"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input id="courseCode" placeholder="Enter course code" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="semester">Semester</Label>
              <Select>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {semesterOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Add Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
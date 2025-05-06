import { useState, useEffect } from "react";
import { CourseCard } from "@/components/course-card";
import { SemesterBlock } from "@/components/semester-block";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, Calculator, Plus, LogOut, Calendar1, AlertTriangle, Save, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useClerk } from '@clerk/clerk-react'
import { useUser } from "@clerk/clerk-react";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import courseData from "../data/course_data.json";
import majorData from "../data/majors.json"
import { getUserData, initializeUserIfNeeded, updateUserCourses } from "../lib/userService";

interface Course {
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
  gpa?: number;
  semester?: string;
  term?: string;
  year?: number;
}

interface SemesterInfo {
  id: string;
  term: string;
  year: number;
  courses: Course[];
}

interface TemplateInfo {
  term: string;
  year: number;
  coursesList: string[];
}

// Helper function to generate a sorting value for terms
const getTermSortValue = (term: string) => {
  const termValues = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };
  return termValues[term as keyof typeof termValues] || 0;
};

// Helper function to sort semesters chronologically
const sortSemesters = (a: SemesterInfo, b: SemesterInfo) => {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  return getTermSortValue(a.term) - getTermSortValue(b.term);
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [allCourseOptions, setAllCourseOptions] = useState<string[]>([]);
  const [subjectLabels, setSubjectLabels] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesters, setSemesters] = useState<SemesterInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userInitialized, setUserInitialized] = useState(false);
  
  // Major template related state
  const [majorTemplates, setMajorTemplates] = useState<string[]>([]);
  const [selectedMajorTemplate, setSelectedMajorTemplate] = useState("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  
  const calculateWeightedGPA = () => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const weightedSum = courses.reduce((sum, course) => {
      return sum + (course.gpa || 0) * course.credits;
    }, 0);
    
    return totalCredits === 0 ? 0 : (weightedSum / totalCredits);
  };

  // Initialize the user and load their data from Firestore
  useEffect(() => {
    const initializeUser = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Initialize user if they don't exist in Firestore
        const userData = await initializeUserIfNeeded(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        });
        
        if (userData && userData.courses && userData.courses.length > 0) {
          // User exists and has courses - load them
          setCourses(userData.courses);
          toast({
            title: "Data loaded",
            description: "Your courses have been loaded from your account.",
            variant: "default"
          });
        } else {
          // User exists but has no courses - check localStorage as fallback
          const localData = localStorage.getItem("coursesData");
          if (localData) {
            const parsedData = JSON.parse(localData);
            setCourses(parsedData);
            
            // Save local data to Firestore
            if (parsedData.length > 0) {
              await updateUserCourses(user.id, parsedData);
              toast({
                title: "Data synchronized",
                description: "Your local courses have been saved to your account.",
                variant: "default"
              });
            }
          }
        }
        
        setUserInitialized(true);
      } catch (error) {
        console.error("Error initializing user:", error);
        toast({
          title: "Error",
          description: "Failed to load your data. Using local storage instead.",
          variant: "destructive"
        });
        
        // Fallback to localStorage if Firestore fails
        const localData = localStorage.getItem("coursesData");
        if (localData) {
          setCourses(JSON.parse(localData));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeUser();
  }, [user]);

  // Load major templates from the imported JSON directly
  useEffect(() => {
    try {
      setIsLoadingTemplates(true);
      
      // Use the already imported majorData instead of fetching it again
      if (majorData) {
        setMajorTemplates(Object.keys(majorData));
      } else {
        throw new Error("Major data not found");
      }
    } catch (error) {
      console.error("Error loading major templates:", error);
      toast({
        title: "Error",
        description: "Failed to load major templates. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  // Save changes to Firestore whenever courses change
  useEffect(() => {
    const saveCourses = async () => {
      // Skip saving if initial load hasn't completed or user isn't initialized
      if (isLoading || !userInitialized || !user) return;
      
      try {
        setIsSaving(true);
        await updateUserCourses(user.id, courses);
        
        // Also save to localStorage as backup
        localStorage.setItem("coursesData", JSON.stringify(courses));
      } catch (error) {
        console.error("Error saving courses to Firestore:", error);
        toast({
          title: "Sync error",
          description: "Failed to save your changes to the cloud. Your data is saved locally.",
          variant: "destructive",
          action: <ToastAction altText="Retry">Retry</ToastAction>,
        });
      } finally {
        setIsSaving(false);
      }
    };
    
    // Only save if user is initialized and courses have changed
    if (userInitialized && !isLoading && user) {
      saveCourses();
    }
  }, [courses, user, userInitialized, isLoading]);

  // Load course options from local JSON file
  useEffect(() => {
    const loadCourseOptions = () => {
      try {
        // Extract course names from the JSON data
        const courseNames = Object.keys(courseData);
        setAllCourseOptions(courseNames);
        
        // Extract unique subject labels (e.g., "CMSC", "MATH")
        const subjects = new Set<string>();
        courseNames.forEach(courseName => {
          const parts = courseName.split(' ');
          if (parts.length > 0) {
            subjects.add(parts[0]);
          }
        });
        
        setSubjectLabels(Array.from(subjects).sort());
      } catch (error) {
        console.error("Error loading course data:", error);
      }
    };

    loadCourseOptions();
  }, []);

  // Filter courses when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const filtered = allCourseOptions.filter(course => 
        course.startsWith(selectedSubject + " ")
      );
      setFilteredCourses(filtered);
      setSelectedCourse(""); // Reset selected course when subject changes
    } else {
      setFilteredCourses([]);
    }
  }, [selectedSubject, allCourseOptions]);

  // Calculate and update semesters whenever courses change
  useEffect(() => {
    const semesterMap = new Map<string, SemesterInfo>();
    
    courses.forEach(course => {
      if (course.term && course.year) {
        const semesterId = `${course.term.toLowerCase()}${course.year}`;
        
        if (!semesterMap.has(semesterId)) {
          semesterMap.set(semesterId, {
            id: semesterId,
            term: course.term,
            year: course.year,
            courses: []
          });
        }
        
        semesterMap.get(semesterId)?.courses.push(course);
      }
    });
    
    // Convert map to array and sort chronologically
    const semesterArray = Array.from(semesterMap.values()).sort(sortSemesters);
    setSemesters(semesterArray);
  }, [courses]);

  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const filtered = courses.filter(course => 
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Create a temporary map for filtered courses by semester
      const filteredSemesterMap = new Map<string, SemesterInfo>();
      
      filtered.forEach(course => {
        if (course.term && course.year) {
          const semesterId = `${course.term.toLowerCase()}${course.year}`;
          
          if (!filteredSemesterMap.has(semesterId)) {
            filteredSemesterMap.set(semesterId, {
              id: semesterId,
              term: course.term,
              year: course.year,
              courses: []
            });
          }
          
          filteredSemesterMap.get(semesterId)?.courses.push(course);
        }
      });
      
      // Convert map to array and sort
      const filteredSemesterArray = Array.from(filteredSemesterMap.values()).sort(sortSemesters);
      setSemesters(filteredSemesterArray);
    } else {
      // If search query is empty, show all courses
      const semesterMap = new Map<string, SemesterInfo>();
      
      courses.forEach(course => {
        if (course.term && course.year) {
          const semesterId = `${course.term.toLowerCase()}${course.year}`;
          
          if (!semesterMap.has(semesterId)) {
            semesterMap.set(semesterId, {
              id: semesterId,
              term: course.term,
              year: course.year,
              courses: []
            });
          }
          
          semesterMap.get(semesterId)?.courses.push(course);
        }
      });
      
      const semesterArray = Array.from(semesterMap.values()).sort(sortSemesters);
      setSemesters(semesterArray);
    }
  }, [courses, searchQuery]);

  // Handle applying a major template
  const handleSelectMajorTemplate = (templateName: string) => {
    if (!templateName) return;
    
    try {
      setIsLoading(true);
      
      // Use the imported majorData instead of fetching it
      if (!majorData[templateName]) {
        console.error("Major template not found:", templateName);
        toast({
          title: "Error",
          description: "Template not found. Please select another template.",
          variant: "destructive"
        });
        return;
      }
      
      // Show confirmation dialog if there are existing courses
      if (courses.length > 0) {
        if (!window.confirm("Applying a template will replace your current plan. Continue?")) {
          setSelectedMajorTemplate("");
          return;
        }
      }
      
      // Get the courses for this template
      const templateCourses: TemplateInfo[] = majorData[templateName];
      
      // Clear existing courses
      let newCourses: Course[] = [];
      
      // Add each course from the template
      for (const semesterInfo of templateCourses) {
        const { term, year, coursesList } = semesterInfo;
        
        for (const courseCode of coursesList) {
          // Check if course exists in course data
          const courseDetails = (courseData as Record<string, any>)[courseCode];
          
          if (courseDetails) {
            const newCourse: Course = {
              code: courseCode,
              name: courseDetails['Course Title'] || `${courseCode}`,
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
            
            newCourses.push(newCourse);
          } else {
            // Course not found in data, log error but continue
            console.warn(`Course ${courseCode} not found in course data`);
          }
        }
      }
      
      // Update the courses state
      setCourses(newCourses);
      
      // Reset selected template
      setSelectedMajorTemplate("");
      
      toast({
        title: "Template applied",
        description: `${templateName} plan has been loaded successfully.`,
        variant: "default"
      });
      
    } catch (error) {
      console.error("Error applying major template:", error);
      toast({
        title: "Error",
        description: "Failed to apply the selected template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleClearPlan = async () => {
    setCourses([]);
    setIsClearDialogOpen(false);
    
    // Clear from localStorage
    localStorage.removeItem("coursesData");
    
    // Clear from Firestore if user is authenticated
    if (user) {
      try {
        await updateUserCourses(user.id, []);
      } catch (error) {
        console.error("Error clearing courses in Firestore:", error);
      }
    }
    
    toast({
      title: "Plan cleared",
      description: "Your course plan has been cleared.",
      variant: "default"
    });
  };

  const generateSemesterOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const terms = ["Winter", "Spring", "Summer", "Fall"];
    
    for (let year = currentYear-10; year < currentYear + 5; year++) {
      for (let term of terms) {
        options.push({
          value: `${term.toLowerCase()}${year}`,
          label: `${term} ${year}`
        });
      }
    }
    return options;
  };

  const handleAddCourse = () => {
    if (!selectedCourse || !selectedSemester) return;
    
    try {
      // Get course details from the local JSON data
      const courseDetails = (courseData as Record<string, any>)[selectedCourse];
      
      if (!courseDetails) {
        console.error("Course not found:", selectedCourse);
        return;
      }
      
      const semesterParts = selectedSemester.match(/([a-z]+)(\d+)/i);
      
      if (!semesterParts) {
        console.error("Invalid semester format:", selectedSemester);
        return;
      }
      
      const term = semesterParts[1].charAt(0).toUpperCase() + semesterParts[1].slice(1);
      const year = parseInt(semesterParts[2]);
      
      // Create new course object with all the available fields
      const newCourse: Course = {
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
        semester: selectedSemester,
        term,
        year
      };
      
      // Add course to the list
      setCourses(prevCourses => [...prevCourses, newCourse]);
      
      // Reset selection and close dialog
      setSelectedCourse("");
      setSelectedSemester("");
      setIsAddDialogOpen(false);
      
      toast({
        title: "Course added",
        description: `${selectedCourse} has been added to your plan.`,
        variant: "default"
      });
      
    } catch (error) {
      console.error("Error adding course:", error);
      
      toast({
        title: "Error",
        description: "There was a problem adding the course. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/")
  }

  const handleRemoveCourse = (courseCode: string) => {
    // Update local state
    const updatedCourses = courses.filter(course => course.code !== courseCode);
    setCourses(updatedCourses);
    
    // Show toast notification
    toast({
      title: "Course removed",
      description: `Course ${courseCode} has been removed from your plan.`,
      variant: "default"
    });
  };

  const semesterOptions = generateSemesterOptions();
  const weightedGPA = calculateWeightedGPA();
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  // Loading state while initializing user data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-planner-lightGold to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="w-12 h-12 text-planner-accent animate-pulse" />
          <h2 className="text-xl font-medium text-planner-primary">Loading your courses...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-planner-lightGold to-white relative">
      <header className="w-full py-6 bg-white/80 backdrop-blur-sm border-b border-planner-accent/20 sticky top-0 z-50">
        <div className="container flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-planner-accent" />
            <h1 className="text-2xl font-medium text-planner-primary">
              Course Planner
            </h1>
          </a>
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
            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-planner-accent/20 text-planner-primary hover:bg-planner-accent/10 hover:text-planner-primary"
                  disabled={courses.length === 0}
                >
                  Clear Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    Confirm Clear Plan
                  </DialogTitle>
                  <DialogDescription className="pt-2">
                    Are you sure you want to clear your entire course plan? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsClearDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleClearPlan}
                  >
                    Clear Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-planner-accent/20 text-planner-primary hover:bg-planner-accent/10 hover:text-planner-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-3">
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
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm text-gray-600">Total Credits</span>
                <p className="text-lg font-medium text-planner-primary">{totalCredits}</p>
              </div>
              {isSaving && (
                <div className="flex items-center text-planner-accent text-sm">
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Syncing...
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      {(semesters.length === 0) && (
        <div className="container py-2 w-1/2 mx-auto">
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-planner-accent/20">
            <div className="flex flex-col">
              <div className="flex items-center mb-3">
                <h3 className="text-lg font-medium text-planner-primary">Choose Major Template</h3>
              </div>
              <Select 
                value={selectedMajorTemplate} 
                onValueChange={(value) => {
                  setSelectedMajorTemplate(value);
                  handleSelectMajorTemplate(value);
                }}
                disabled={isLoadingTemplates}
              >
                <SelectTrigger id="majorTemplate" className="w-full">
                  <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a Major Template"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {majorTemplates.length > 0 ? (
                    majorTemplates.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      {isLoadingTemplates ? "Loading templates..." : "No templates available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
      )}

      <main className="container py-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {semesters.length > 0 ? (
              semesters.map(semester => {
                const semesterCredits = semester.courses.reduce(
                  (sum, course) => sum + course.credits, 0
                );
                
                return (
                  <SemesterBlock 
                    key={semester.id}
                    term={semester.term} 
                    year={semester.year} 
                    credits={semesterCredits}
                    courses={semester.courses}
                    onGPAChange={handleGPAChange}
                    onAddCourse={(newCourse) => {
                      // Add the new course to your state
                      setCourses(prevCourses => [...prevCourses, newCourse]);
                      
                      // Show toast notification if desired
                      toast({
                        title: "Course added",
                        description: `${newCourse.code} has been added to your plan.`,
                        variant: "default"
                      });
                    }}
                  >
                    {semester.courses.map((course) => (
                      <CourseCard 
                        key={course.code} 
                        {...course} 
                        onGPAChange={(newGPA) => handleGPAChange(course.code, newGPA)}
                        onRemove={handleRemoveCourse}
                      />
                    ))}
                  </SemesterBlock>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-planner-accent/40" />
                <h3 className="text-xl font-medium mb-2">No courses added</h3>
                <p className="mb-4">Click the + button to start building your plan or select a template above 😎</p>
              </div>
            )}
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
              <Label htmlFor="courseLabel">Course Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
            <div className="grid gap-2">
              <Label htmlFor="semester">Semester</Label>
              <Select 
                value={selectedSemester} 
                onValueChange={setSelectedSemester}
              >
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
              onClick={handleAddCourse}
              disabled={!selectedCourse || !selectedSemester}
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
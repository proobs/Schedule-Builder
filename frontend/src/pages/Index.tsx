import { useState, useEffect } from "react";
import { CourseCard } from "@/components/course-card";
import { SemesterBlock } from "@/components/semester-block";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, Calculator, Plus, LogOut, Calendar1 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useClerk } from '@clerk/clerk-react'
import { db } from "@/App";
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Course {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string[] | null;
  components?: string;
  attributes?: string[];
  consent?: string;
  courseId?: string;
  grading?: string;
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

// Helper function to generate a sorting value for terms
const getTermSortValue = (term: string) => {
  const termValues = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };
  return termValues[term] || 0;
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
  const [allCourseOptions, setAllCourseOptions] = useState<string[]>([]);
  const [subjectLabels, setSubjectLabels] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesters, setSemesters] = useState<SemesterInfo[]>([]);
  
  const calculateWeightedGPA = () => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const weightedSum = courses.reduce((sum, course) => {
      return sum + (course.gpa || 0) * course.credits;
    }, 0);
    
    return totalCredits === 0 ? 0 : (weightedSum / totalCredits);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Reference the 'courses' collection
        const coursesRef = collection(db, 'courses');

        // Fetch all documents in the collection
        const querySnapshot = await getDocs(coursesRef);

        // Map through the snapshot to get each document's ID
        const courseNames = querySnapshot.docs.map((doc) => doc.id);
        console.log("Fetched courses:", courseNames);
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
        console.error("Error fetching course names:", error);
      }
    };

    fetchCourses();
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

  const handleAddCourse = async () => {
    if (!selectedCourse || !selectedSemester) return;
    
    try {
      // Get course details from Firestore
      const courseRef = collection(db, 'courses');
      const q = query(courseRef, where('__name__', '==', selectedCourse));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error("Course not found:", selectedCourse);
        return;
      }
      
      const courseData = querySnapshot.docs[0].data();
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
        name: courseData['Course Title'] || `${selectedCourse}`,
        credits: courseData['Credits'] || 3,
        prerequisites: courseData['Prerequisites'] || [],
        components: courseData['Components'] || "Lecture",
        attributes: courseData['Attributes'] || [],
        consent: courseData['Consent'] || "No Special Consent Required",
        courseId: courseData['Course ID'] || "",
        grading: courseData['Grading'] || "Graded",
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
      
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };
  useEffect(() => {
    const savedCourses = localStorage.getItem("coursesData");
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
  }, []);

  // Save courses to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("coursesData", JSON.stringify(courses));
  }, [courses]);
  
  // since these are react comp gotta do this roundabout method
  const { signOut } = useClerk()
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate("/")
  }

  const semesterOptions = generateSemesterOptions();
  const weightedGPA = calculateWeightedGPA();
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

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
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-planner-accent/60" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10 w-64 border-planner-accent/20 focus:border-planner-accent/40 focus:ring-planner-accent/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}
            <Button 
              variant="outline" 
              className="border-planner-accent/20 text-planner-primary hover:bg-planner-accent/10 hover:text-planner-primary"
              onClick={() => setCourses([])}
            >
              Clear Plan
            </Button>
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
            <div className="text-right">
              <span className="text-sm text-gray-600">Total Credits</span>
              <p className="text-lg font-medium text-planner-primary">{totalCredits}</p>
            </div>
          </div>
        </Card>
      </div>
      {(semesters.length === 0)&& (
      <div className="container py-2 w-1/2 mx-auto">
      <Card className="p-4 bg-white/90 backdrop-blur-sm border-planner-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar1 className="w-5 h-5 text-planner-accent m-4" />
 
              <Select>
                <SelectTrigger id="majorTemplate" className="w-[500px]">
                  <SelectValue placeholder="Select a Major Template" />
                </SelectTrigger>
              </Select>
            </div>
          </div>
        </Card>
      </div>)}



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
                  >
                    {semester.courses.map((course) => (
                      <CourseCard 
                        key={course.code} 
                        {...course} 
                        onGPAChange={(newGPA) => handleGPAChange(course.code, newGPA)}
                      />
                    ))}
                  </SemesterBlock>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-planner-accent/40" />
                <h3 className="text-xl font-medium mb-2">No courses added</h3>
                <p className="mb-4">Click the + button to start building or choose a template 😎</p>
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
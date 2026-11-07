import { useMemo, useState } from "react";
import { Button } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CourseCard from "../components/CourseCard";
import CourseFilters from "../components/CourseFilters";
import EmptyCourses from "../components/EmptyCourses";
import PageHeading from "../components/PageHeading";

export default function CoursesPage({
  filteredCourses,
  availableCourses,
  category,
  setCategory,
  query,
  showNotice,
  courseProgress,
  onCourseProgress,
  onEnrollCourse,
  onRemoveCourse,
}) {
  const [view, setView] = useState("enrolled");
  const filteredAvailableCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return availableCourses.filter((course) => {
      const matchesCategory = category === "All courses" || course.category === category;
      const matchesSearch = !normalizedQuery ||
        `${course.title} ${course.instructor} ${course.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [availableCourses, category, query]);
  const displayedCourses = view === "enrolled" ? filteredCourses : filteredAvailableCourses;

  return (
    <>
      <PageHeading eyebrow="YOUR LEARNING SPACE" title="My Courses" description="View and manage all of your enrolled courses.">
        <Button className="add-course-button" variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setView("catalog")}>Explore courses</Button>
      </PageHeading>
      <div className="section-card all-courses-panel">
        <div className="course-view-tabs" role="tablist" aria-label="Course lists">
          <button role="tab" aria-selected={view === "enrolled"} className={view === "enrolled" ? "course-view-tab active" : "course-view-tab"} onClick={() => setView("enrolled")}>
            My courses ({filteredCourses.length})
          </button>
          <button role="tab" aria-selected={view === "catalog"} className={view === "catalog" ? "course-view-tab active" : "course-view-tab"} onClick={() => setView("catalog")}>
            Explore courses ({availableCourses.length})
          </button>
        </div>
        <div className="section-heading">
          <div><h2>{view === "enrolled" ? "Enrolled courses" : "Course catalog"}</h2><p>Showing {displayedCourses.length} courses</p></div>
        </div>
        <CourseFilters category={category} setCategory={setCategory} />
        <div className="all-course-grid">
          {displayedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showNotice={showNotice}
              progress={courseProgress[course.id]}
              onContinue={view === "enrolled" ? onCourseProgress : undefined}
              onRemove={view === "enrolled" ? onRemoveCourse : undefined}
              onAction={view === "catalog" ? onEnrollCourse : undefined}
              actionLabel={view === "catalog" ? "Enroll in course" : undefined}
            />
          ))}
          {displayedCourses.length === 0 && <EmptyCourses />}
        </div>
      </div>
      <footer className="page-footer"><span>© 2026 Kalvi Learning</span><span>Keep learning, one step at a time 💜</span></footer>
    </>
  );
}

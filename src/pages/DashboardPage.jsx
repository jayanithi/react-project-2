import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, TextField } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CourseCard from "../components/CourseCard";
import CourseFilters from "../components/CourseFilters";
import EmptyCourses from "../components/EmptyCourses";
import PageHeading from "../components/PageHeading";
import StatCard from "../components/StatCard";

export default function DashboardPage({
  user,
  filteredCourses,
  category,
  setCategory,
  setActivePage,
  showNotice,
  userData,
  onCourseProgress,
  onToggleAssignment,
  onAddAssignment,
}) {
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentCourse, setAssignmentCourse] = useState("");
  const [assignmentDate, setAssignmentDate] = useState("");
  const weeklyGoal = Math.max(1, userData.preferences.weeklyGoal || 15);
  const learningHours = userData.activityHours;
  const goalProgress = Math.min(100, Math.round(learningHours / weeklyGoal * 100));
  const averageProgress = userData.enrolledCourseIds.length
    ? Math.round(userData.enrolledCourseIds.reduce((total, courseId) => total + (userData.courseProgress[courseId] || 0), 0) / userData.enrolledCourseIds.length)
    : 0;

  const submitAssignment = (event) => {
    event.preventDefault();
    const title = assignmentTitle.trim();
    if (!title || !assignmentCourse || !assignmentDate) return;
    const [year, month, day] = assignmentDate.split("-").map(Number);
    onAddAssignment({
      title,
      course: assignmentCourse,
      dueDate: assignmentDate,
      date: new Date(year, month - 1, day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      color: "lavender",
    });
    setAssignmentTitle("");
    setAssignmentCourse("");
    setAssignmentDate("");
    setAssignmentDialogOpen(false);
  };

  return (
    <>
      <PageHeading eyebrow="YOUR LEARNING SPACE" title={`Welcome back, ${user.name.split(" ")[0]}! 👋`} description="Ready to learn something new today?" />
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-kicker">YOUR NEXT BIG STEP</span>
          <h2>Small steps lead<br />to big success!</h2>
          <p>You’re making great progress. Keep going on your learning journey!</p>
          <Button className="welcome-button" variant="contained" endIcon={<KeyboardArrowRightRoundedIcon />} onClick={() => setActivePage("My Courses")}>Continue learning</Button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-book"><span /><span /><span /></div>
          <div className="art-sparkle sparkle-one">✦</div>
          <div className="art-sparkle sparkle-two">✦</div>
          <div className="art-orbit" />
        </div>
        <div className="banner-decoration banner-decoration-one" />
        <div className="banner-decoration banner-decoration-two" />
      </section>

      <section className="stats-grid" aria-label="Learning statistics">
        <StatCard icon={AutoStoriesRoundedIcon} label="Enrolled courses" value={String(userData.enrolledCourseIds.length).padStart(2, "0")} detail="Your active learning list" color="purple" />
        <StatCard icon={AccessTimeRoundedIcon} label="Learning hours" value={`${learningHours}h`} detail="Hours recorded in your learning log" color="blue" />
        <StatCard icon={TrendingUpRoundedIcon} label="Average progress" value={`${averageProgress}%`} detail="Across your enrolled courses" color="green" />
        <StatCard icon={EmojiEventsRoundedIcon} label="Achievements" value={String(Object.values(userData.courseProgress).filter((progress) => progress === 100).length)} detail="Courses completed" color="orange" />
      </section>

      <section className="content-grid">
        <div className="section-card courses-panel">
          <div className="section-heading">
            <div><h2>My courses</h2><p>Pick up where you left off</p></div>
            <button className="text-link" onClick={() => setActivePage("My Courses")}>View all courses <KeyboardArrowRightRoundedIcon /></button>
          </div>
          <CourseFilters category={category} setCategory={setCategory} />
          <div className="course-list">
            {filteredCourses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                showNotice={showNotice}
                progress={userData.courseProgress[course.id]}
                onContinue={onCourseProgress}
                compact
              />
            ))}
            {filteredCourses.length === 0 && <EmptyCourses />}
          </div>
        </div>
        <div className="section-card activity-panel">
          <div className="section-heading">
            <div><h2>Learning activity</h2><p>Your progress this week</p></div>
            <span className="activity-period">This week</span>
          </div>
          <div className="activity-total"><strong>{learningHours.toFixed(1)} <span>hours</span></strong><span className="activity-change">Tracked this week</span></div>
          <div className="chart" role="img" aria-label="Weekly learning activity chart">
            {userData.weeklyActivity.map(({ day, value }) => (
              <div className="chart-column" key={day}>
                <div className="chart-track"><div className={`chart-bar ${day === "Thu" ? "chart-bar-highlight" : ""}`} style={{ height: `${value}%` }} /></div>
                <span>{day}</span>
              </div>
            ))}
          </div>
          <div className="activity-footer"><span><span className="legend-dot" /> Study activity</span><span>Target: {weeklyGoal} hours</span></div>
        </div>
      </section>

      <section className="content-grid lower-grid">
        <div className="section-card assignments-panel">
          <div className="section-heading">
            <div><h2>Upcoming assignments</h2><p>Stay on track with your deadlines</p></div>
            <button className="icon-quiet" aria-label="Add assignment" onClick={() => setAssignmentDialogOpen(true)}><AddTaskRoundedIcon /></button>
          </div>
          <div className="assignment-list">
            {userData.assignments.map((item) => (
              <div className="assignment-row" key={item.id}>
                <button
                  className={`assignment-check ${item.completed ? "assignment-check-done" : ""}`}
                  aria-label={item.completed ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
                  aria-pressed={item.completed}
                  onClick={() => onToggleAssignment(item.id)}
                >
                  {item.completed ? "✓" : ""}
                </button>
                <div className={`assignment-icon ${item.color}`}><AutoStoriesRoundedIcon /></div>
                <div className={`assignment-copy ${item.completed ? "assignment-completed" : ""}`}><strong>{item.title}</strong><span>{item.course}{item.completed ? " · Completed" : ""}</span></div>
                <span className="assignment-date"><AccessTimeRoundedIcon />{item.date}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="motivation-card">
          <div className="motivation-stars">✦ &nbsp; ✦</div>
          <div className="motivation-icon"><EmojiEventsRoundedIcon /></div>
          <span className="welcome-kicker">YOUR WEEKLY GOAL</span>
          <h2>Almost there!</h2>
          <p>{Math.max(0, weeklyGoal - learningHours).toFixed(1)} more hours to reach your weekly goal.</p>
          <LinearProgress variant="determinate" value={goalProgress} className="goal-progress" />
          <div className="goal-caption"><span>{learningHours} of {weeklyGoal} hours</span><strong>{goalProgress}%</strong></div>
          <button className="motivation-link" onClick={() => setActivePage("My Courses")}>View my courses <KeyboardArrowRightRoundedIcon /></button>
        </div>
      </section>
      <footer className="page-footer"><span>© 2026 Kalvi Learning</span><span>Here to support your learning journey 💜</span></footer>
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={submitAssignment}>
          <DialogTitle>Add an assignment</DialogTitle>
          <DialogContent className="form-dialog-content">
            <TextField autoFocus label="Assignment title" value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} required fullWidth />
            <TextField label="Course or project" value={assignmentCourse} onChange={(event) => setAssignmentCourse(event.target.value)} required fullWidth />
            <TextField label="Due date" type="date" value={assignmentDate} onChange={(event) => setAssignmentDate(event.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add assignment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

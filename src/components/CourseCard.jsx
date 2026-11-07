import { Avatar, Button, LinearProgress, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

export default function CourseCard({
  course,
  showNotice,
  compact = false,
  progress,
  onContinue,
  onRemove,
  onAction,
  actionLabel,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const courseProgress = progress ?? course.progress;
  const totalLessons = Number.parseInt(course.lessons.split("/")[1]?.trim(), 10) || 1;
  const completedLessons = Math.round(totalLessons * courseProgress / 100);

  return (
    <article className={`course-card ${compact ? "course-card-compact" : ""}`}>
      <div className={`course-cover ${course.color}`}>
        <div className="cover-orbit" />
        <div className="course-cover-icon"><AutoStoriesRoundedIcon /></div>
        <span className="course-category">{course.category}</span>
        <button className="course-more" aria-label={`More options for ${course.title}`} aria-haspopup="menu" aria-expanded={Boolean(menuAnchor)} onClick={(event) => setMenuAnchor(event.currentTarget)}>
          <MoreHorizRoundedIcon />
        </button>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem disabled={!onAction && courseProgress === 100} onClick={() => {
            setMenuAnchor(null);
            if (onAction) onAction(course.id);
            else onContinue?.(course.id);
          }}>
            {onAction ? "Enroll in course" : "Mark next lesson complete"}
          </MenuItem>
          {onRemove && <MenuItem onClick={() => { setMenuAnchor(null); onRemove(course.id); }}>Remove from My Courses</MenuItem>}
        </Menu>
      </div>
      <div className="course-info">
        <div className="course-title-line"><h3>{course.title}</h3><span className="course-progress-label">{courseProgress}%</span></div>
        <div className="instructor-line"><Avatar className="instructor-avatar">{course.initials}</Avatar><span>{course.instructor}</span></div>
        <LinearProgress variant="determinate" value={courseProgress} className={`course-progress ${course.color}`} />
        <div className="course-meta">
          <span>{completedLessons} / {totalLessons} lessons</span>
          <span><AccessTimeRoundedIcon /> {course.time}</span>
        </div>
        {!compact && <div className="next-lesson"><span>Next: {course.next}</span></div>}
        <Button
          className="course-continue"
          variant="outlined"
          endIcon={<PlayArrowRoundedIcon />}
          disabled={courseProgress === 100}
          onClick={() => {
            if (onAction) onAction(course.id);
            else if (onContinue) onContinue(course.id);
            else showNotice(`Opening ${course.title}...`);
          }}
        >
          {actionLabel || (courseProgress === 100 ? "Course completed" : "Complete next lesson")}
        </Button>
      </div>
    </article>
  );
}

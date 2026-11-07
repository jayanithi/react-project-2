import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export default function EmptyCourses() {
  return (
    <div className="empty-state">
      <SearchRoundedIcon />
      <strong>No courses found</strong>
      <span>Try another search term or category filter.</span>
    </div>
  );
}

const filters = ["All courses", "Design", "Development", "Marketing"];

export default function CourseFilters({ category, setCategory }) {
  return (
    <div className="course-filters" role="group" aria-label="Filter courses by category">
      {filters.map((filter) => (
        <button
          key={filter}
          className={`filter-chip ${category === filter ? "filter-chip-active" : ""}`}
          onClick={() => setCategory(filter)}
          aria-pressed={category === filter}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export const navigation = [
  { label: "Dashboard", iconName: "dashboard" },
  { label: "My Courses", iconName: "courses" },
  { label: "Calendar", iconName: "calendar" },
  { label: "Messages", iconName: "messages" },
];

export const courses = [
  {
    id: 1,
    title: "UI/UX Design Fundamentals",
    instructor: "Priya Krishnan",
    category: "Design",
    progress: 72,
    lessons: "18 / 25 lessons",
    time: "6h 20m left",
    color: "lavender",
    initials: "PK",
    next: "Wireframing basics",
  },
  {
    id: 2,
    title: "React JS: Beginner to Pro",
    instructor: "Arun Kumar",
    category: "Development",
    progress: 45,
    lessons: "12 / 27 lessons",
    time: "9h 10m left",
    color: "mint",
    initials: "AK",
    next: "State and props",
  },
  {
    id: 3,
    title: "Digital Marketing Mastery",
    instructor: "Meera Nair",
    category: "Marketing",
    progress: 88,
    lessons: "22 / 25 lessons",
    time: "2h 45m left",
    color: "peach",
    initials: "MN",
    next: "Final campaign project",
  },
];

export const courseCatalog = [
  ...courses,
  {
    id: 4,
    title: "Python for Data Analytics",
    instructor: "Divya Raman",
    category: "Development",
    progress: 0,
    lessons: "0 / 20 lessons",
    time: "8h 30m total",
    color: "lavender",
    initials: "DR",
    next: "Getting started with Python",
  },
  {
    id: 5,
    title: "Productivity with AI Tools",
    instructor: "Karthik Iyer",
    category: "Design",
    progress: 0,
    lessons: "0 / 16 lessons",
    time: "5h 15m total",
    color: "mint",
    initials: "KI",
    next: "Choosing the right AI tools",
  },
];

export const assignments = [
  { title: "Landing page wireframe", course: "UI/UX Design", date: "Today, 6:00 PM", color: "lavender" },
  { title: "React hooks practice", course: "React JS", date: "Tomorrow, 11:59 PM", color: "mint" },
  { title: "Campaign analysis", course: "Digital Marketing", date: "Nov 12, 5:00 PM", color: "peach" },
];

export const weeklyActivity = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 70 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 88 },
  { day: "Fri", value: 62 },
  { day: "Sat", value: 38 },
  { day: "Sun", value: 24 },
];

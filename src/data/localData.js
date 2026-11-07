import { assignments as seedAssignments, courses, weeklyActivity } from "./lmsData";

export const ACCOUNT_STORAGE_KEY = "kalvi-accounts";
export const SESSION_STORAGE_KEY = "kalvi-user";

export function readLocalJson(key, fallback) {
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function writeLocalJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function userDataKey(email) {
  return `kalvi-data:${encodeURIComponent(email.trim().toLowerCase())}`;
}

export function loadUserData(email) {
  const defaults = createDefaultUserData();
  const stored = readLocalJson(userDataKey(email), null);
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaults;

  return {
    ...defaults,
    ...stored,
    enrolledCourseIds: Array.isArray(stored.enrolledCourseIds) ? stored.enrolledCourseIds : defaults.enrolledCourseIds,
    courseProgress: { ...defaults.courseProgress, ...(stored.courseProgress || {}) },
    assignments: Array.isArray(stored.assignments) ? stored.assignments : defaults.assignments,
    events: Array.isArray(stored.events) ? stored.events : defaults.events,
    threads: Array.isArray(stored.threads) ? stored.threads : defaults.threads,
    supportRequests: Array.isArray(stored.supportRequests) ? stored.supportRequests : [],
    activityHours: Number.isFinite(stored.activityHours) ? stored.activityHours : defaults.activityHours,
    weeklyActivity: Array.isArray(stored.weeklyActivity) ? stored.weeklyActivity : defaults.weeklyActivity,
    preferences: { ...defaults.preferences, ...(stored.preferences || {}) },
  };
}

export function createDefaultUserData() {
  const today = new Date();
  const dateAfter = (offset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const defaultEvents = [
    { id: "class-design", title: "UI/UX live workshop", date: dateAfter(1), time: "09:30", detail: "Priya Krishnan · Design" },
    { id: "class-react", title: "React JS group study", date: dateAfter(2), time: "14:00", detail: "Arun Kumar · Development" },
    { id: "class-marketing", title: "Digital marketing Q&A", date: dateAfter(5), time: "17:30", detail: "Meera Nair · Marketing" },
  ];
  const defaultThreads = [
    { id: "priya", name: "Priya Krishnan", course: "UI/UX Design", initials: "PK", color: "lavender", unread: 1, messages: [{ id: "priya-1", text: "Let me know if you have any questions about the wireframe assignment.", time: "10:42 AM", sent: false }] },
    { id: "arun", name: "Arun Kumar", course: "React JS", initials: "AK", color: "mint", unread: 1, messages: [{ id: "arun-1", text: "We can cover hooks in our next class.", time: "Yesterday", sent: false }] },
    { id: "meera", name: "Meera Nair", course: "Marketing", initials: "MN", color: "peach", unread: 0, messages: [{ id: "meera-1", text: "Your campaign draft looks great!", time: "Mon", sent: false }] },
  ];

  const assignmentOffsets = [0, 1, 5];
  const dueDateLabel = (index, dueDate) => {
    if (index === 0) return "Today, 6:00 PM";
    if (index === 1) return "Tomorrow, 11:59 PM";
    const [year, month, day] = dueDate.split("-").map(Number);
    return `${new Date(year, month - 1, day).toLocaleDateString(undefined, { month: "short", day: "numeric" })}, 5:00 PM`;
  };

  return {
    enrolledCourseIds: courses.map((course) => course.id),
    courseProgress: Object.fromEntries(courses.map((course) => [course.id, course.progress])),
    assignments: seedAssignments.map((assignment, index) => {
      const dueDate = dateAfter(assignmentOffsets[index] ?? index);
      return {
        ...assignment,
        id: `assignment-${index + 1}`,
        completed: false,
        dueDate,
        date: dueDateLabel(index, dueDate),
      };
    }),
    events: defaultEvents,
    threads: defaultThreads,
    supportRequests: [],
    activityHours: 12.8,
    weeklyActivity: weeklyActivity.map((item) => ({ ...item })),
    preferences: {
      courseNotifications: true,
      assignmentReminders: true,
      weeklyGoal: 15,
    },
  };
}

async function digestPassword(password, salt) {
  if (!window.crypto?.subtle) {
    throw new Error("Secure local sign-in is unavailable in this browser. Open the app on localhost or HTTPS.");
  }
  const saltBytes = Uint8Array.from(salt.match(/.{2}/g), (pair) => Number.parseInt(pair, 16));
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const digest = await window.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 150000, hash: "SHA-256" },
    passwordKey,
    256,
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createPasswordHash(password) {
  if (!window.crypto?.getRandomValues) {
    throw new Error("Secure local sign-in is unavailable in this browser. Open the app on localhost or HTTPS.");
  }
  const salt = Array.from(window.crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return { salt, passwordHash: await digestPassword(password, salt) };
}

export function verifyPassword(password, salt) {
  return digestPassword(password, salt);
}

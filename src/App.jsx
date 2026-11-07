import { useCallback, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import AuthPage from "./pages/AuthPage";
import CalendarPage from "./pages/CalendarPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { courseCatalog } from "./data/lmsData";
import {
  ACCOUNT_STORAGE_KEY,
  createPasswordHash,
  loadUserData,
  readLocalJson,
  SESSION_STORAGE_KEY,
  userDataKey,
  verifyPassword,
  writeLocalJson,
} from "./data/localData";

function getStoredValue(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function getStoredUser() {
  try {
    const account = readLocalJson(SESSION_STORAGE_KEY, null);
    if (typeof account?.name !== "string" || typeof account?.email !== "string") return null;
    const accounts = readLocalJson(ACCOUNT_STORAGE_KEY, []);
    return Array.isArray(accounts) && accounts.some((savedAccount) => savedAccount.email === account.email) ? account : null;
  } catch (error) {
    console.error("Could not read the local Kalvi session.", error);
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [userData, setUserData] = useState(() => {
    const currentUser = getStoredUser();
    return currentUser ? loadUserData(currentUser.email) : null;
  });
  const [darkMode, setDarkMode] = useState(() => getStoredValue("kalvi-theme", "light") === "dark");
  const [activePage, setActivePage] = useState("Dashboard");
  const [category, setCategory] = useState("All courses");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#5b5bd6" },
      background: darkMode ? { default: "#11131b", paper: "#191c27" } : { default: "#f7f8fc", paper: "#ffffff" },
      text: darkMode ? { primary: "#eff0f8", secondary: "#a6a8bb" } : { primary: "#20233b", secondary: "#777b93" },
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 14 },
  }), [darkMode]);

  const enrolledCourses = useMemo(
    () => courseCatalog.filter((course) => userData?.enrolledCourseIds.includes(course.id)),
    [userData?.enrolledCourseIds],
  );
  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return enrolledCourses.filter((course) => {
      const matchesCategory = category === "All courses" || course.category === category;
      const matchesSearch = !normalizedQuery ||
        `${course.title} ${course.instructor} ${course.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [category, query, enrolledCourses]);
  const notifications = useMemo(() => {
    if (!userData) return [];
    const unreadMessages = userData.preferences.courseNotifications ? userData.threads
      .filter((thread) => thread.unread > 0)
      .map((thread) => ({
        id: `message-${thread.id}`,
        title: `New message from ${thread.name}`,
        detail: thread.course,
        page: "Messages",
      })) : [];
    const assignmentsDue = userData.preferences.assignmentReminders ? userData.assignments
      .filter((assignment) => !assignment.completed)
      .slice(0, 3)
      .map((assignment) => ({
        id: assignment.id,
        title: `Assignment: ${assignment.title}`,
        detail: `${assignment.course} · Due ${assignment.date}`,
        page: "Dashboard",
      })) : [];
    return [...unreadMessages, ...assignmentsDue];
  }, [userData]);

  useEffect(() => {
    if (!user || !userData) return;
    try {
      writeLocalJson(userDataKey(user.email), userData);
    } catch (error) {
      console.error("Could not save Kalvi data to this browser.", error);
      setNotice("Your latest changes could not be saved in this browser.");
    }
  }, [user, userData]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    try {
      window.localStorage.setItem("kalvi-theme", nextMode ? "dark" : "light");
    } catch {
      showNotice("Theme changed for this session. Browser storage is unavailable.");
    }
  };

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    setNotice("");
  };

  const authenticate = async ({ mode, name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = readLocalJson(ACCOUNT_STORAGE_KEY, []);
    if (!Array.isArray(accounts)) throw new Error("Saved account data is invalid. Clear this browser's Kalvi data and try again.");

    if (mode === "reset") {
      const accountIndex = accounts.findIndex((account) => account.email === normalizedEmail);
      if (accountIndex < 0) throw new Error("No local account was found for this email address.");
      const credential = await createPasswordHash(password);
      const updatedAccounts = accounts.map((account, index) => index === accountIndex ? { ...account, ...credential } : account);
      writeLocalJson(ACCOUNT_STORAGE_KEY, updatedAccounts);
      return { passwordReset: true };
    }

    const existingAccount = accounts.find((account) => account.email === normalizedEmail);
    let account;
    if (mode === "register") {
      if (existingAccount) throw new Error("An account with this email already exists. Sign in instead.");
      account = { name, email: normalizedEmail, ...await createPasswordHash(password) };
      writeLocalJson(ACCOUNT_STORAGE_KEY, [...accounts, account]);
    } else {
      if (!existingAccount || existingAccount.passwordHash !== await verifyPassword(password, existingAccount.salt)) {
        throw new Error("Email or password is incorrect. Check your details or create an account.");
      }
      account = existingAccount;
    }

    const sessionUser = { name: account.name, email: account.email, avatarData: account.avatarData || "" };
    const savedData = loadUserData(account.email);
    writeLocalJson(SESSION_STORAGE_KEY, sessionUser);
    setUser(sessionUser);
    setUserData(savedData);
    setActivePage("Dashboard");
    setNotice("");
    return { signedIn: true };
  };

  const signOut = () => {
    setUser(null);
    setUserData(null);
    setActivePage("Dashboard");
    setNotice("");
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      showNotice("You have signed out for this session.");
    }
  };

  const updateProfile = (profile) => {
    const updatedUser = { ...user, ...profile };
    if (typeof updatedUser.name !== "string" || !updatedUser.name.trim()) {
      showNotice("Please enter a valid name.");
      return;
    }
    try {
      const accounts = readLocalJson(ACCOUNT_STORAGE_KEY, []);
      if (!Array.isArray(accounts)) throw new Error("Saved account data is invalid.");
      writeLocalJson(ACCOUNT_STORAGE_KEY, accounts.map((account) => account.email === user.email ? { ...account, ...updatedUser } : account));
      writeLocalJson(SESSION_STORAGE_KEY, updatedUser);
    } catch (error) {
      console.error("Could not save your profile.", error);
      showNotice("Your profile could not be saved in this browser.");
      return;
    }
    setUser(updatedUser);
    showNotice("Your profile has been updated.");
  };

  const updateUserData = useCallback((updater) => {
    setUserData((currentData) => typeof updater === "function" ? updater(currentData) : updater);
  }, []);
  const updateCourseProgress = (courseId) => {
    const nextProgress = Math.min(100, (userData.courseProgress[courseId] || 0) + 5);
    updateUserData((currentData) => ({
      ...currentData,
      courseProgress: {
        ...currentData.courseProgress,
        [courseId]: nextProgress,
      },
      activityHours: Number((currentData.activityHours + 0.25).toFixed(1)),
      weeklyActivity: currentData.weeklyActivity.map((item, index) => index === (new Date().getDay() + 6) % 7
        ? { ...item, value: Math.min(100, item.value + 5) }
        : item),
    }));
    showNotice(nextProgress === 100 ? "Course completed! Great work." : "Lesson completed and your course progress was saved.");
  };
  const enrollCourse = (courseId) => {
    updateUserData((currentData) => ({
      ...currentData,
      enrolledCourseIds: currentData.enrolledCourseIds.includes(courseId) ? currentData.enrolledCourseIds : [...currentData.enrolledCourseIds, courseId],
      courseProgress: { ...currentData.courseProgress, [courseId]: 0 },
    }));
    showNotice("Course added to My Courses.");
  };
  const removeCourse = (courseId) => {
    updateUserData((currentData) => ({
      ...currentData,
      enrolledCourseIds: currentData.enrolledCourseIds.filter((id) => id !== courseId),
    }));
    showNotice("Course removed from your learning list.");
  };
  const toggleAssignment = (assignmentId) => {
    updateUserData((currentData) => ({
      ...currentData,
      assignments: currentData.assignments.map((assignment) => assignment.id === assignmentId
        ? { ...assignment, completed: !assignment.completed }
        : assignment),
    }));
  };
  const addAssignment = (assignment) => {
    updateUserData((currentData) => ({
      ...currentData,
      assignments: [...currentData.assignments, { ...assignment, id: `assignment-${Date.now()}`, completed: false }],
    }));
    showNotice("Assignment added to your list.");
  };
  const addCalendarEvent = (event) => {
    updateUserData((currentData) => ({
      ...currentData,
      events: [...currentData.events, { ...event, id: `event-${Date.now()}` }],
    }));
    showNotice("Your learning event has been added.");
  };
  const removeCalendarEvent = (eventId) => {
    updateUserData((currentData) => ({
      ...currentData,
      events: currentData.events.filter((event) => event.id !== eventId),
    }));
    showNotice("Calendar event removed.");
  };
  const sendMessage = (threadId, text) => {
    updateUserData((currentData) => ({
      ...currentData,
      threads: currentData.threads.map((thread) => thread.id === threadId
        ? { ...thread, messages: [...thread.messages, { id: `message-${Date.now()}`, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), sent: true }] }
        : thread),
    }));
    showNotice("Your message has been saved in this conversation.");
  };
  const markThreadRead = useCallback((threadId) => {
    updateUserData((currentData) => ({
      ...currentData,
      threads: currentData.threads.map((thread) => thread.id === threadId ? { ...thread, unread: 0 } : thread),
    }));
  }, [updateUserData]);
  const updatePreferences = (preferences) => {
    updateUserData((currentData) => ({ ...currentData, preferences: { ...currentData.preferences, ...preferences } }));
  };
  const addSupportRequest = (message) => {
    updateUserData((currentData) => ({
      ...currentData,
      supportRequests: [...(currentData.supportRequests || []), { id: `support-${Date.now()}`, message, createdAt: new Date().toISOString() }],
    }));
    showNotice("Support request saved in this browser demo. It was not sent to a support team.");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={`app-shell ${darkMode ? "dark-theme" : ""}`}>
        {!user ? (
          <AuthPage onAuthenticate={authenticate} darkMode={darkMode} onToggleTheme={toggleTheme} />
        ) : (
          <>
            <Sidebar
              activePage={activePage}
              sidebarOpen={sidebarOpen}
              onNavigate={navigate}
              onClose={() => setSidebarOpen(false)}
              user={user}
              onSignOut={signOut}
              unreadCount={userData.preferences.courseNotifications ? userData.threads.reduce((count, thread) => count + thread.unread, 0) : 0}
              onSupportRequest={addSupportRequest}
            />
            <main className="main-area">
              <Topbar
                activePage={activePage}
                query={query}
                onQueryChange={setQuery}
                onMenuOpen={() => setSidebarOpen(true)}
                onNavigate={navigate}
                darkMode={darkMode}
                onToggleTheme={toggleTheme}
                user={user}
                notifications={notifications}
              />
              <div className="page-content">
                {notice && <div className="notice-banner" role="status"><NotificationsActiveRoundedIcon fontSize="small" />{notice}</div>}
                {activePage === "Dashboard" && (
                  <DashboardPage
                    user={user}
                    filteredCourses={filteredCourses}
                    category={category}
                    setCategory={setCategory}
                    setActivePage={setActivePage}
                    showNotice={showNotice}
                    userData={userData}
                    onCourseProgress={updateCourseProgress}
                    onToggleAssignment={toggleAssignment}
                    onAddAssignment={addAssignment}
                  />
                )}
                {activePage === "My Courses" && (
                  <CoursesPage
                    filteredCourses={filteredCourses}
                    availableCourses={courseCatalog.filter((course) => !userData.enrolledCourseIds.includes(course.id))}
                    category={category}
                    setCategory={setCategory}
                    query={query}
                    showNotice={showNotice}
                    courseProgress={userData.courseProgress}
                    onCourseProgress={updateCourseProgress}
                    onEnrollCourse={enrollCourse}
                    onRemoveCourse={removeCourse}
                  />
                )}
                {activePage === "Calendar" && (
                  <CalendarPage events={userData.events} onAddEvent={addCalendarEvent} onRemoveEvent={removeCalendarEvent} />
                )}
                {activePage === "Messages" && (
                  <MessagesPage threads={userData.threads} onSendMessage={sendMessage} onMarkRead={markThreadRead} />
                )}
                {activePage === "Settings" && (
                  <SettingsPage
                    showNotice={showNotice}
                    darkMode={darkMode}
                    onToggleTheme={toggleTheme}
                    user={user}
                    preferences={userData.preferences}
                    onUpdatePreferences={updatePreferences}
                    onSaveProfile={updateProfile}
                    onSignOut={signOut}
                  />
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

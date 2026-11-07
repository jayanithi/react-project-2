import { useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import PageHeading from "../components/PageHeading";

const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function CalendarPage({ events, onAddEvent, onRemoveEvent }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [detail, setDetail] = useState("");

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const offset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(firstOfMonth);
    start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { date, key: dateKey(date), inMonth: date.getMonth() === visibleMonth.getMonth() };
    });
  }, [visibleMonth]);

  const selectedEvents = events.filter((event) => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  const upcomingEvents = [...events].filter((event) => event.date >= dateKey(new Date())).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const changeMonth = (difference) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + difference, 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(dateKey(nextMonth));
  };

  const submitEvent = (event) => {
    event.preventDefault();
    if (!title.trim() || !selectedDate || !time) return;
    onAddEvent({ title: title.trim(), date: selectedDate, time, detail: detail.trim() || "Personal study session" });
    setTitle("");
    setDetail("");
    setDialogOpen(false);
  };

  const formatDate = (value, options = { weekday: "short", month: "short", day: "numeric" }) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <PageHeading eyebrow="YOUR SCHEDULE" title="Learning calendar" description="Keep your classes, study sessions, and deadlines in one place.">
        <Button className="add-course-button" variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>Add event</Button>
      </PageHeading>
      <section className="section-card calendar-card">
        <div className="calendar-toolbar">
          <div>
            <span className="calendar-month">{visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
            <p>Select a date to view or add a learning event.</p>
          </div>
          <div className="calendar-toolbar-actions">
            <button aria-label="Previous month" onClick={() => changeMonth(-1)}>‹</button>
            <button aria-label="Next month" onClick={() => changeMonth(1)}>›</button>
          </div>
        </div>
        <div className="calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}
          {calendarDays.map(({ date, key, inMonth }) => {
            const isToday = key === dateKey(new Date());
            const hasEvents = events.some((event) => event.date === key);
            return (
              <button
                className={`calendar-day ${inMonth ? "" : "calendar-day-muted"} ${isToday ? "calendar-day-today" : ""} ${selectedDate === key ? "calendar-day-selected" : ""}`}
                key={key}
                aria-label={`${date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}${hasEvents ? ", has events" : ""}`}
                aria-pressed={selectedDate === key}
                onClick={() => {
                  setSelectedDate(key);
                  setSelectedEvent(null);
                  if (!inMonth) setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                }}
              >
                <span>{date.getDate()}</span>
                {hasEvents && <i />}
              </button>
            );
          })}
        </div>
      </section>
      <section className="section-card schedule-card">
        <div className="section-heading">
          <div><h2>{selectedEvents.length ? `Events for ${formatDate(selectedDate)}` : "Upcoming schedule"}</h2><p>{selectedEvents.length ? "Select an event to see its details." : "Choose a date to view events or add a new one."}</p></div>
          <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>Add event</Button>
        </div>
        {(selectedEvents.length ? selectedEvents : upcomingEvents).length === 0 && (
          <div className="empty-state"><strong>No learning events yet</strong><span>Add a class or study session to your calendar.</span></div>
        )}
        {(selectedEvents.length ? selectedEvents : upcomingEvents).map((event) => (
          <div className="schedule-row schedule-row-action" key={event.id}>
            <button className="schedule-event-button" onClick={() => setSelectedEvent(event)} aria-label={`View ${event.title}`}>
              <span className="schedule-time">{formatDate(event.date, { month: "short", day: "numeric" })} · {event.time}</span>
              <span className="schedule-dot" />
              <span className="schedule-event-copy"><strong>{event.title}</strong><span>{event.detail}</span></span>
              <KeyboardArrowRightRoundedIcon />
            </button>
            <IconButton aria-label={`Delete ${event.title}`} size="small" onClick={() => onRemoveEvent(event.id)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
          </div>
        ))}
      </section>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={submitEvent}>
          <DialogTitle>Add a learning event</DialogTitle>
          <DialogContent className="form-dialog-content">
            <TextField autoFocus label="Event title" value={title} onChange={(event) => setTitle(event.target.value)} required fullWidth />
            <TextField label="Date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Instructor or notes" value={detail} onChange={(event) => setDetail(event.target.value)} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save event</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} fullWidth maxWidth="xs">
        {selectedEvent && <>
          <DialogTitle>{selectedEvent.title}</DialogTitle>
          <DialogContent className="event-details">
            <p>{formatDate(selectedEvent.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at {selectedEvent.time}</p>
            <p>{selectedEvent.detail}</p>
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={() => { onRemoveEvent(selectedEvent.id); setSelectedEvent(null); }}>Delete event</Button>
            <Button onClick={() => setSelectedEvent(null)}>Close</Button>
          </DialogActions>
        </>}
      </Dialog>
    </>
  );
}

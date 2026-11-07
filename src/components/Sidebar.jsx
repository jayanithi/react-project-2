import { useState } from "react";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Tooltip } from "@mui/material";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { navigation } from "../data/lmsData";

const icons = {
  dashboard: DashboardRoundedIcon,
  courses: SchoolRoundedIcon,
  calendar: CalendarMonthRoundedIcon,
  messages: ChatBubbleOutlineRoundedIcon,
};

function Brand({ onClose }) {
  return (
    <div className="brand">
      <div className="brand-mark"><AutoStoriesRoundedIcon /></div>
      <span>kalvi<span className="brand-dot">.</span></span>
      <IconButton className="sidebar-close" aria-label="Close navigation" onClick={onClose}>
        <CloseRoundedIcon />
      </IconButton>
    </div>
  );
}

export default function Sidebar({ activePage, sidebarOpen, onNavigate, onClose, user, onSignOut, unreadCount = 0, onSupportRequest }) {
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const initials = user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  const submitSupportRequest = (event) => {
    event.preventDefault();
    const message = supportMessage.trim();
    if (!message) return;
    onSupportRequest(message);
    setSupportMessage("");
    setSupportOpen(false);
  };

  return (
    <>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Brand onClose={onClose} />
        <div className="workspace-label">MENU</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map(({ label, iconName }) => {
            const Icon = icons[iconName];
            return (
              <button
                className={`nav-item ${activePage === label ? "nav-item-active" : ""}`}
                key={label}
                onClick={() => onNavigate(label)}
                aria-current={activePage === label ? "page" : undefined}
              >
                <Icon fontSize="small" />
                <span>{label}</span>
                {label === "Messages" && unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </button>
            );
          })}
        </nav>
        <div className="workspace-label settings-label">PREFERENCES</div>
        <button
          className={`nav-item ${activePage === "Settings" ? "nav-item-active" : ""}`}
          onClick={() => onNavigate("Settings")}
          aria-current={activePage === "Settings" ? "page" : undefined}
        >
          <SettingsRoundedIcon fontSize="small" />
          <span>Settings</span>
        </button>
        <div className="sidebar-spacer" />
        <div className="help-card">
          <div className="help-icon"><AutoStoriesRoundedIcon /></div>
          <strong>Need a hand?</strong>
          <p>Our team is here whenever you need help.</p>
          <button onClick={() => setSupportOpen(true)}>
            Contact support <KeyboardArrowRightRoundedIcon />
          </button>
        </div>
        <div className="sidebar-profile">
          <Avatar className="profile-avatar" src={user.avatarData || undefined}>{initials}</Avatar>
          <div className="profile-copy"><strong>{user.name}</strong><span>Student account</span></div>
          <Tooltip title="Sign out">
            <IconButton aria-label="Sign out" size="small" onClick={onSignOut}><LogoutRoundedIcon /></IconButton>
          </Tooltip>
        </div>
      </aside>
      <Dialog open={supportOpen} onClose={() => setSupportOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={submitSupportRequest}>
          <DialogTitle>Contact support</DialogTitle>
          <DialogContent className="form-dialog-content">
            <p className="dialog-description">Describe what you need help with. Your request will be saved in this browser demo.</p>
            <TextField autoFocus label="How can we help?" multiline minRows={4} value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} required fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSupportOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save request</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

import { Avatar, Badge, IconButton, InputAdornment, Menu, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

export default function Topbar({
  activePage,
  query,
  onQueryChange,
  onMenuOpen,
  onNavigate,
  darkMode,
  onToggleTheme,
  user,
  notifications,
}) {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const initials = user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="topbar">
      <div className="mobile-brand">
        <IconButton aria-label="Open navigation" onClick={onMenuOpen}><MenuRoundedIcon /></IconButton>
        <span>kalvi<span className="brand-dot">.</span></span>
      </div>
      <div className="breadcrumb"><span>Pages</span><span className="breadcrumb-divider">/</span><strong>{activePage}</strong></div>
      <div className="topbar-actions">
        <TextField
          className="search-field"
          size="small"
          placeholder="Search courses..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ "aria-label": "Search courses" }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
        />
        <IconButton className="theme-toggle" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={onToggleTheme}>
          {darkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        </IconButton>
        <IconButton className="notification-button" aria-label={`Notifications${notifications.length ? `, ${notifications.length} updates` : ""}`} onClick={(event) => setNotificationAnchor(event.currentTarget)}>
          <Badge variant="dot" color="error" invisible={notifications.length === 0}><NotificationsNoneRoundedIcon /></Badge>
        </IconButton>
        <IconButton className="account-button" aria-label="Open account settings" onClick={() => onNavigate("Settings")}>
          <Avatar className="top-avatar" src={user.avatarData || undefined}>{initials}</Avatar>
        </IconButton>
      </div>
      <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={() => setNotificationAnchor(null)}>
        {notifications.length === 0
          ? <MenuItem disabled>You're all caught up.</MenuItem>
          : notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => {
                setNotificationAnchor(null);
                onNavigate(notification.page);
              }}
            >
              <span className="notification-menu-copy"><strong>{notification.title}</strong><span>{notification.detail}</span></span>
            </MenuItem>
          ))}
      </Menu>
    </header>
  );
}

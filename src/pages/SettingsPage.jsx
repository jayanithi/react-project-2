import { useRef, useState } from "react";
import { Avatar, Button, Switch, TextField } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PageHeading from "../components/PageHeading";

export default function SettingsPage({
  showNotice,
  darkMode,
  onToggleTheme,
  user,
  preferences,
  onUpdatePreferences,
  onSaveProfile,
  onSignOut,
}) {
  const [name, setName] = useState(user.name);
  const [avatarData, setAvatarData] = useState(user.avatarData || "");
  const fileInputRef = useRef(null);
  const initials = name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showNotice("Choose an image file for your profile photo.");
      event.target.value = "";
      return;
    }
    if (file.size > 512 * 1024) {
      showNotice("Choose an image smaller than 512 KB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarData(String(reader.result));
    reader.onerror = () => showNotice("The selected image could not be read.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const saveSettings = () => {
    if (!name.trim()) {
      showNotice("Please enter your name before saving.");
      return;
    }
    onSaveProfile({ name: name.trim(), avatarData });
  };

  return (
    <>
      <PageHeading eyebrow="YOUR ACCOUNT" title="Settings" description="Manage your account and notification preferences." />
      <section className="section-card settings-card">
        <div className="settings-person">
          <Avatar className="settings-avatar" src={avatarData || undefined}>{initials}</Avatar>
          <div><h2>{name || user.name}</h2><p>{user.email}</p></div>
          <div className="profile-photo-actions">
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
            <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>Choose photo</Button>
            {avatarData && <Button onClick={() => setAvatarData("")}>Remove photo</Button>}
          </div>
        </div>
        <div className="settings-form">
          <TextField label="Full name" value={name} onChange={(event) => setName(event.target.value)} required fullWidth />
          <TextField label="Email address" value={user.email} inputProps={{ readOnly: true }} fullWidth />
          <TextField
            label="Weekly learning goal (hours)"
            type="number"
            value={preferences.weeklyGoal || 15}
            onChange={(event) => onUpdatePreferences({ weeklyGoal: Math.max(1, Math.min(168, Number(event.target.value) || 1)) })}
            inputProps={{ min: 1, max: 168, step: 1 }}
            fullWidth
          />
          <div className="notification-setting">
            <div><strong>Dark mode</strong><span>Choose a darker appearance for the app.</span></div>
            <Switch checked={darkMode} onChange={onToggleTheme} inputProps={{ "aria-label": "Enable dark mode" }} />
          </div>
          <div className="notification-setting">
            <div><strong>Course notifications</strong><span>Show course updates and reminders in this app.</span></div>
            <Switch checked={preferences.courseNotifications} onChange={(event) => onUpdatePreferences({ courseNotifications: event.target.checked })} inputProps={{ "aria-label": "Enable course notifications" }} />
          </div>
          <div className="notification-setting">
            <div><strong>Assignment reminders</strong><span>Show reminders for assignments that are not complete.</span></div>
            <Switch checked={preferences.assignmentReminders} onChange={(event) => onUpdatePreferences({ assignmentReminders: event.target.checked })} inputProps={{ "aria-label": "Enable assignment reminders" }} />
          </div>
          <div className="settings-actions">
            <Button className="save-settings" variant="contained" onClick={saveSettings}>Save changes</Button>
            <Button className="settings-signout" variant="outlined" color="error" startIcon={<LogoutRoundedIcon />} onClick={onSignOut}>Sign out</Button>
          </div>
        </div>
      </section>
    </>
  );
}

import { useState } from "react";
import { Alert, Button, IconButton, InputAdornment, TextField } from "@mui/material";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

export default function AuthPage({ onAuthenticate, darkMode, onToggleTheme }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if ((isRegister || isReset) && password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setBusy(true);
    try {
      const result = await onAuthenticate({ mode, name, email, password });
      if (result?.passwordReset) {
        setMode("login");
        setSuccess("Password reset. Sign in with your new password.");
      }
    } catch (submitError) {
      setError(submitError.message || "We couldn't complete your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  const title = isRegister ? "Create your account" : isReset ? "Reset your password" : "Sign in to Kalvi";
  const subtitle = isRegister
    ? "Join your learning community and get started."
    : isReset
      ? "Create a new password for your local Kalvi account."
      : "Enter your details to continue your learning journey.";

  return (
    <main className="auth-page">
      <section className="auth-promo">
        <div className="auth-brand"><span className="brand-mark"><AutoStoriesRoundedIcon /></span><span>kalvi<span className="brand-dot">.</span></span></div>
        <div className="auth-promo-copy">
          <span className="welcome-kicker">YOUR FUTURE STARTS HERE</span>
          <h1>Learn at your pace.<br />Grow without limits.</h1>
          <p>Build skills, explore new ideas, and keep moving toward your goals.</p>
          <div className="auth-illustration" aria-hidden="true"><AutoStoriesRoundedIcon /><span>✦</span><i /><b /></div>
        </div>
        <div className="auth-promo-footer">A little progress each day adds up to big results.</div>
      </section>
      <section className="auth-form-side">
        <IconButton className="auth-theme-toggle" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={onToggleTheme}>
          {darkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        </IconButton>
        <form className="auth-form" onSubmit={handleSubmit}>
          <span className="auth-mobile-brand">kalvi<span className="brand-dot">.</span></span>
          <span className="eyebrow">{isRegister ? "START LEARNING TODAY" : isReset ? "ACCOUNT RECOVERY" : "WELCOME BACK"}</span>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>}
          {isRegister && <TextField name="name" label="Full name" autoComplete="name" required fullWidth />}
          <TextField name="email" label="Email address" type="email" autoComplete="email" required fullWidth />
          <TextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete={isRegister || isReset ? "new-password" : "current-password"}
            required
            inputProps={{ minLength: 8 }}
            helperText={isRegister || isReset ? "Use at least 8 characters." : undefined}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} edge="end">
                    {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {(isRegister || isReset) && <TextField name="confirmPassword" label="Confirm password" type={showPassword ? "text" : "password"} autoComplete="new-password" required inputProps={{ minLength: 8 }} fullWidth />}
          {!isRegister && !isReset && <button className="auth-text-button forgot-password" type="button" onClick={() => changeMode("reset")}>Forgot password?</button>}
          <Button className="auth-submit" type="submit" variant="contained" fullWidth disabled={busy}>
            {busy ? "Please wait..." : isRegister ? "Create account" : isReset ? "Reset password" : "Sign in"}
          </Button>
          <div className="auth-switch">
            {isReset ? "Remembered your password?" : isRegister ? "Already have an account?" : "New to Kalvi?"}{" "}
            <button className="auth-text-button" type="button" onClick={() => changeMode(isRegister || isReset ? "login" : "register")}>
              {isRegister || isReset ? "Sign in" : "Create an account"}
            </button>
          </div>
          <p className="auth-disclaimer">Your demo account and data are saved in this browser only.</p>
        </form>
      </section>
    </main>
  );
}

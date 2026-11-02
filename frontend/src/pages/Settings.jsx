
import { useState } from "react";
import {
  User,
  Phone,
  Bell,
  Shield,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import "../styles/Settings.css";

function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [preferences, setPreferences] = useState({
    callNotifications: true,
    emailNotifications: true,
    autoRecording: true,
    callSummary: true,
  });

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePreferenceChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Abhi settings frontend state mein hain.
    // Backend settings API connect hone par database mein save hongi.
    alert("Settings UI updated. Backend save integration pending.");
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and AI calling preferences.</p>
        </div>
        <SettingsIcon size={30} />
      </div>

      <form onSubmit={handleSave}>
        <section className="settings-section">
          <div className="settings-section-title">
            <User size={21} />
            <div>
              <h2>Profile Information</h2>
              <p>Manage your personal account details.</p>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={profile.name}
                onChange={handleProfileChange}
              />
            </div>

            <div className="settings-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={profile.email}
                onChange={handleProfileChange}
              />
            </div>

            <div className="settings-field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={profile.phone}
                onChange={handleProfileChange}
              />
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-title">
            <Phone size={21} />
            <div>
              <h2>AI Calling Preferences</h2>
              <p>Configure your calling-related preferences.</p>
            </div>
          </div>

          <div className="settings-option">
            <div>
              <h3>Automatic Call Recording</h3>
              <p>Enable recording for supported calls.</p>
            </div>
            <input
              type="checkbox"
              name="autoRecording"
              checked={preferences.autoRecording}
              onChange={handlePreferenceChange}
            />
          </div>

          <div className="settings-option">
            <div>
              <h3>Call Summary</h3>
              <p>Enable AI-generated call summaries.</p>
            </div>
            <input
              type="checkbox"
              name="callSummary"
              checked={preferences.callSummary}
              onChange={handlePreferenceChange}
            />
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-title">
            <Bell size={21} />
            <div>
              <h2>Notifications</h2>
              <p>Choose which notifications you receive.</p>
            </div>
          </div>

          <div className="settings-option">
            <div>
              <h3>Call Notifications</h3>
              <p>Receive notifications about call activity.</p>
            </div>
            <input
              type="checkbox"
              name="callNotifications"
              checked={preferences.callNotifications}
              onChange={handlePreferenceChange}
            />
          </div>

          <div className="settings-option">
            <div>
              <h3>Email Notifications</h3>
              <p>Receive updates through email.</p>
            </div>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={preferences.emailNotifications}
              onChange={handlePreferenceChange}
            />
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-title">
            <Shield size={21} />
            <div>
              <h2>Security</h2>
              <p>Account security and privacy information.</p>
            </div>
          </div>

          <p className="settings-security-text">
            Your API keys and calling provider credentials should
            always be stored securely on the backend, never in
            frontend code.
          </p>
        </section>

        <button type="submit" className="settings-save-btn">
          <Save size={18} />
          Save Settings
        </button>
      </form>
    </div>
  );
}

export default Settings;

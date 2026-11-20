import * as Tabs from "@radix-ui/react-tabs";
import { Bell, Code2, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/shared/PageHeader";
import { Avatar } from "../../components/ui/Surface";
import { api, type UserPreferences } from "../../lib/api";
import { useAuth } from "../../providers/useAuth";
import { useTheme } from "../../providers/themeContext";
import type { Theme } from "../../providers/themeTypes";

type SettingsTab = "appearance" | "editor" | "notifications";

const defaultPreferences: UserPreferences = {
  theme: "SYSTEM",
  editorFontSize: 14,
  editorTabSize: 2,
  editorLineNumbers: true,
  notifyRoomInvitations: true,
  notifyChallengeUpdates: true,
  notifyProductUpdates: false,
};

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile, signOutAll } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setUsername(user?.username ?? "");
    setBio(user?.bio ?? "");
    setAvatarUrl(user?.avatarUrl ?? "");
  }, [user]);

  useEffect(() => {
    let active = true;
    api
      .getPreferences()
      .then(({ preferences: loaded }) => {
        if (!active) return;
        setPreferences(loaded);
        if (loaded.theme !== "SYSTEM") {
          setTheme(loaded.theme.toLowerCase() as Theme);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load settings.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingPreferences(false);
      });
    return () => {
      active = false;
    };
  }, [setTheme]);

  async function savePreferences(update: Partial<UserPreferences>) {
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const result = await api.updatePreferences(update);
      setPreferences(result.preferences);
      setNotice("Preferences saved.");
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save preferences.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await updateProfile({
        displayName,
        username: username || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
      });
      setNotice("Profile saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setNotice("Password updated. Other sessions have been signed out.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update password.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOutAll() {
    setError("");
    try {
      await signOutAll();
      window.location.assign("/login");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign out other sessions.",
      );
    }
  }

  const currentPreferences = preferences ?? defaultPreferences;
  const initials =
    user?.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="settings-page page-content">
      <PageHeader
        eyebrow="MAKE IT YOURS"
        title="Settings"
        description="Manage your profile, security, and preferences."
      />
      {error && (
        <p className="form-notice" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="form-notice" role="status">
          {notice}
        </p>
      )}
      {loadingPreferences ? (
        <p aria-live="polite">Loading your settings…</p>
      ) : (
        <div className="settings-layout">
          <Tabs.Root
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as SettingsTab)}
            orientation="vertical"
            className="settings-tabs"
          >
            <Tabs.List
              className="settings-tabs__list"
              aria-label="Settings sections"
            >
              <Tabs.Trigger value="appearance">
                <Monitor size={16} /> Account
              </Tabs.Trigger>
              <Tabs.Trigger value="editor">
                <Code2 size={16} /> Editor
              </Tabs.Trigger>
              <Tabs.Trigger value="notifications">
                <Bell size={16} /> Notifications
              </Tabs.Trigger>
            </Tabs.List>

            <div className="settings-tabs__content">
              <Tabs.Content value="appearance" className="settings-tab">
                <div className="settings-section-heading">
                  <span className="settings-section-icon">
                    <UserRound size={17} />
                  </span>
                  <div>
                    <h2>Your profile</h2>
                    <p>How you show up in the room.</p>
                  </div>
                </div>
                <div className="profile-preview">
                  <Avatar initials={initials} className="avatar--large" />
                  <div>
                    <strong>{user?.displayName}</strong>
                    <p>{user?.email}</p>
                  </div>
                </div>
                <form className="auth-form" onSubmit={saveProfile}>
                  <label className="field">
                    <span className="field__label">Display name</span>
                    <input
                      className="field__input"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      minLength={2}
                      maxLength={80}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Username</span>
                    <input
                      className="field__input"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      minLength={3}
                      maxLength={32}
                      pattern="[A-Za-z0-9_]+"
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Bio</span>
                    <textarea
                      className="field__input"
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      maxLength={500}
                      rows={3}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Avatar URL</span>
                    <input
                      className="field__input"
                      type="url"
                      value={avatarUrl}
                      onChange={(event) => setAvatarUrl(event.target.value)}
                      maxLength={2048}
                    />
                  </label>
                  <p className="settings-footnote">
                    Email address: {user?.email}. Email changes are not enabled
                    until verification is implemented.
                  </p>
                  <Button type="submit" disabled={saving}>
                    Save profile
                  </Button>
                </form>

                <div className="settings-divider" />
                <div className="settings-section-heading">
                  <span className="settings-section-icon">
                    <Sun size={17} />
                  </span>
                  <div>
                    <h2>Appearance</h2>
                    <p>Choose the surface you think best on.</p>
                  </div>
                </div>
                <div className="theme-choices" role="group" aria-label="Theme">
                  {(["light", "dark"] as const).map((value: Theme) => {
                    const Icon = value === "light" ? Sun : Moon;
                    return (
                      <button
                        className={`theme-choice${theme === value ? " theme-choice--selected" : ""}`}
                        type="button"
                        key={value}
                        aria-pressed={theme === value}
                        disabled={saving}
                        onClick={async () => {
                          const saved = await savePreferences({
                            theme: value === "light" ? "LIGHT" : "DARK",
                          });
                          if (saved) setTheme(value);
                        }}
                      >
                        <span className={`theme-swatch theme-swatch--${value}`}>
                          <span />
                          <span />
                          <span />
                        </span>
                        <span className="theme-choice__copy">
                          <Icon size={15} />
                          <strong>
                            {value === "light" ? "Light" : "Dark"}
                          </strong>
                        </span>
                        <span className="theme-choice__radio" />
                      </button>
                    );
                  })}
                </div>

                <div className="settings-divider" />
                <div className="settings-section-heading">
                  <span className="settings-section-icon">
                    <UserRound size={17} />
                  </span>
                  <div>
                    <h2>Password & sessions</h2>
                    <p>Keep your account secure.</p>
                  </div>
                </div>
                <form className="auth-form" onSubmit={savePassword}>
                  <label className="field">
                    <span className="field__label">Current password</span>
                    <input
                      className="field__input"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">New password</span>
                    <input
                      className="field__input"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      minLength={12}
                      maxLength={128}
                      required
                    />
                  </label>
                  <Button type="submit" disabled={saving}>
                    Update password
                  </Button>
                </form>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleSignOutAll()}
                >
                  Sign out all other sessions
                </Button>
              </Tabs.Content>

              <Tabs.Content value="editor" className="settings-tab">
                <div className="settings-section-heading">
                  <span className="settings-section-icon">
                    <Code2 size={17} />
                  </span>
                  <div>
                    <h2>Editor preferences</h2>
                    <p>Visual defaults for your coding space.</p>
                  </div>
                </div>
                <PreferenceRow
                  title="Font size"
                  description="Code editor text size."
                  control={
                    <select
                      className="select-control"
                      value={currentPreferences.editorFontSize}
                      disabled={saving}
                      onChange={(event) =>
                        void savePreferences({
                          editorFontSize: Number(event.target.value),
                        })
                      }
                      aria-label="Font size"
                    >
                      {[12, 13, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                        <option key={size} value={size}>
                          {size} px
                        </option>
                      ))}
                    </select>
                  }
                />
                <PreferenceRow
                  title="Tab size"
                  description="Number of spaces per indentation."
                  control={
                    <select
                      className="select-control"
                      value={currentPreferences.editorTabSize}
                      disabled={saving}
                      onChange={(event) =>
                        void savePreferences({
                          editorTabSize: Number(event.target.value),
                        })
                      }
                      aria-label="Tab size"
                    >
                      {[2, 4, 8].map((size) => (
                        <option key={size} value={size}>
                          {size} spaces
                        </option>
                      ))}
                    </select>
                  }
                />
                <PreferenceRow
                  title="Line numbers"
                  description="Show line numbers in the editor."
                  control={
                    <PreferenceSwitch
                      checked={currentPreferences.editorLineNumbers}
                      label="Line numbers"
                      disabled={saving}
                      onChange={() =>
                        void savePreferences({
                          editorLineNumbers:
                            !currentPreferences.editorLineNumbers,
                        })
                      }
                    />
                  }
                />
              </Tabs.Content>

              <Tabs.Content value="notifications" className="settings-tab">
                <div className="settings-section-heading">
                  <span className="settings-section-icon">
                    <Bell size={17} />
                  </span>
                  <div>
                    <h2>Notifications</h2>
                    <p>Choose what you’d like to hear about.</p>
                  </div>
                </div>
                <PreferenceRow
                  title="Room invites"
                  description="When someone invites you to collaborate."
                  control={
                    <PreferenceSwitch
                      checked={currentPreferences.notifyRoomInvitations}
                      label="Room invites"
                      disabled={saving}
                      onChange={() =>
                        void savePreferences({
                          notifyRoomInvitations:
                            !currentPreferences.notifyRoomInvitations,
                        })
                      }
                    />
                  }
                />
                <PreferenceRow
                  title="Challenge updates"
                  description="New Bug Prediction rounds and results."
                  control={
                    <PreferenceSwitch
                      checked={currentPreferences.notifyChallengeUpdates}
                      label="Challenge updates"
                      disabled={saving}
                      onChange={() =>
                        void savePreferences({
                          notifyChallengeUpdates:
                            !currentPreferences.notifyChallengeUpdates,
                        })
                      }
                    />
                  }
                />
                <PreferenceRow
                  title="Product notes"
                  description="Occasional notes about what’s new."
                  control={
                    <PreferenceSwitch
                      checked={currentPreferences.notifyProductUpdates}
                      label="Product notes"
                      disabled={saving}
                      onChange={() =>
                        void savePreferences({
                          notifyProductUpdates:
                            !currentPreferences.notifyProductUpdates,
                        })
                      }
                    />
                  }
                />
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      )}
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="preference-row">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {control}
    </div>
  );
}

function PreferenceSwitch({
  checked,
  label,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="switch"
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
    >
      <span />
    </button>
  );
}

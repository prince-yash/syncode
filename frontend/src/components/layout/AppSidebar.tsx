import {
  Activity,
  ChevronDown,
  CircleHelp,
  Command,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar } from "../ui/Surface";
import { Brand } from "../shared/Brand";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useAuth } from "../../providers/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    setSignOutError("");
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    }
  }

  const initials =
    user?.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <Brand />
        <button className="workspace-switch" type="button" disabled>
          <span className="workspace-switch__icon">S</span>
          <span className="workspace-switch__copy">
            <strong>Personal workspace</strong>
            <small>Development preview</small>
          </span>
          <ChevronDown size={15} />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <span className="sidebar__label">Workspace</span>
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `nav-item${isActive ? " nav-item--active" : ""}`
          }
        >
          <LayoutDashboard size={17} strokeWidth={1.8} />
          <span>Overview</span>
        </NavLink>
        <button className="nav-item nav-item--disabled" type="button" disabled>
          <Activity size={17} strokeWidth={1.8} />
          <span>Activity</span>
          <span className="nav-item__soon">Soon</span>
        </button>
        <span className="sidebar__label sidebar__label--spaced">Account</span>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item${isActive ? " nav-item--active" : ""}`
          }
        >
          <Settings size={17} strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar-note">
          <span className="sidebar-note__icon">
            <Command size={15} />
          </span>
          <span>
            <strong>Built for thinking together</strong>
            <small>Collaboration, without the noise.</small>
          </span>
        </div>
        <div className="sidebar__utility">
          <button type="button" className="utility-link" disabled>
            <CircleHelp size={16} />
            <span>Help center</span>
          </button>
          <ThemeToggle />
        </div>
        {signOutError && (
          <p className="form-notice" role="alert">
            {signOutError}
          </p>
        )}
        <button
          className="user-card"
          type="button"
          onClick={() => void handleSignOut()}
        >
          <Avatar initials={initials} />
          <span className="user-card__copy">
            <strong>{user?.displayName ?? "Account"}</strong>
            <small>{user?.email ?? "Sign out"}</small>
          </span>
          <span className="status-dot" title="Sign out" />
        </button>
      </div>
    </aside>
  );
}

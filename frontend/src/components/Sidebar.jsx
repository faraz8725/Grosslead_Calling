
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserPlus,
  Megaphone,
  PhoneCall,
  Headset,
  BarChart3,
  Settings,
  LogOut,
  Bot,
  X
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

const Sidebar = ({ mobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Leads",
      path: "/leads",
      icon: Users
    },
    {
      name: "Add Lead",
      path: "/leads/add",
      icon: UserPlus
    },
    {
      name: "Campaigns",
      path: "/campaigns",
      icon: Megaphone
    },
    {
      name: "Call History",
      path: "/calls",
      icon: PhoneCall
    },
    {
      name: "Human Handoff",
      path: "/handoff",
      icon: Headset
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3
    }
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobile}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Bot size={24} />
          </div>

          <div>
            <h2>VoiceFlow AI</h2>
            <span>CALLING PLATFORM</span>
          </div>

          <button
            className="sidebar-close"
            onClick={closeMobile}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">MAIN MENU</span>

          <nav className="sidebar-nav">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">

          <NavLink
            to="/team"
            onClick={closeMobile}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Users size={19} />
            <span>Team Members</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={closeMobile}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>

            <button
              className="logout-icon"
              title="Logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;

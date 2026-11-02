
import { useState } from "react";
import { Menu, Bell, Search, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = ({ openSidebar }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="navbar">

      <div className="navbar-left">
        <button
          className="menu-button"
          onClick={openSidebar}
        >
          <Menu size={22} />
        </button>

        <div className="navbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search leads, calls..."
          />
        </div>
      </div>

      <div className="navbar-right">

        <div className="notification-wrapper">
          <button
            className="notification-button"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          >
            <Bell size={19} />
            <span className="notification-dot"></span>
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <strong>Notifications</strong>
              <p>No new notifications</p>
            </div>
          )}
        </div>

        <div className="navbar-profile">
          <div className="navbar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="navbar-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>

          <ChevronDown size={16} />
        </div>

      </div>
    </header>
  );
};

export default Navbar;


import {
  Users,
  PhoneCall,
  CheckCircle,
  PhoneMissed,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus
} from "lucide-react";
import "../styles/Placeholder.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import StatCard from "../components/StatCard";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Leads",
      value: "0",
      subtitle: "Leads added to your CRM",
      icon: Users,
      color: "#6179e8"
    },
    {
      title: "Total Calls",
      value: "0",
      subtitle: "All calling activities",
      icon: PhoneCall,
      color: "#12a981"
    },
    {
      title: "Connected Calls",
      value: "0",
      subtitle: "Successfully connected",
      icon: CheckCircle,
      color: "#299b74"
    },
    {
      title: "Missed / Failed",
      value: "0",
      subtitle: "Calls not connected",
      icon: PhoneMissed,
      color: "#e46c70"
    },
    {
      title: "Positive Leads",
      value: "0",
      subtitle: "Interested customers",
      icon: TrendingUp,
      color: "#20a57d"
    },
    {
      title: "Follow-ups",
      value: "0",
      subtitle: "Customers to contact again",
      icon: Clock,
      color: "#e49b42"
    }
  ];

  return (
    <div className="dashboard-page">

      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            OVERVIEW
          </span>

          <h1>Welcome back, {user?.name}!</h1>

          <p>
            Here's what's happening with your calling platform.
          </p>
        </div>

        <Link to="/leads/add" className="dashboard-add-button">
          <Plus size={18} />
          Add New Lead
        </Link>
      </div>

      <div className="dashboard-stats">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </div>

      <div className="dashboard-content-grid">

        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Calls</h3>
              <p>Your latest calling activities</p>
            </div>

            <Link to="/calls">
              View All <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="dashboard-empty">
            <div className="empty-icon">
              <PhoneCall size={27} />
            </div>

            <h4>No calls yet</h4>

            <p>
              Your call history will appear here once
              you start making calls.
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Lead Overview</h3>
              <p>Customer interest distribution</p>
            </div>
          </div>

          <div className="lead-overview">

            <div className="overview-item">
              <span className="overview-dot positive"></span>
              <span>Positive</span>
              <strong>0</strong>
            </div>

            <div className="overview-item">
              <span className="overview-dot negative"></span>
              <span>Negative</span>
              <strong>0</strong>
            </div>

            <div className="overview-item">
              <span className="overview-dot medium"></span>
              <span>Medium</span>
              <strong>0</strong>
            </div>

            <div className="overview-item">
              <span className="overview-dot follow"></span>
              <span>Follow-up</span>
              <strong>0</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;

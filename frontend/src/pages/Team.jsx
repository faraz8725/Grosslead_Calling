
import { useEffect, useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import "../styles/Team.css";

function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leads/team");

      const data = response.data;

      setMembers(
        Array.isArray(data)
          ? data
          : data.members || data.users || data.team || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Team members load nahi ho paye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const filteredMembers = members.filter((member) => {
    const searchText = [
      member.name,
      member.email,
      member.role,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage your office team members and their roles.</p>
        </div>

        <button
          className="team-refresh-btn"
          onClick={fetchTeam}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="team-summary">
        <div className="team-summary-card">
          <Users size={24} />
          <div>
            <span>Total Team Members</span>
            <h2>{members.length}</h2>
          </div>
        </div>

        <div className="team-summary-card">
          <UserPlus size={24} />
          <div>
            <span>Active Members</span>
            <h2>
              {
                members.filter(
                  (member) => member.isActive !== false
                ).length
              }
            </h2>
          </div>
        </div>
      </div>

      <div className="team-toolbar">
        <div className="team-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="team-table-wrapper">
        {loading ? (
          <p className="team-message">Loading team members...</p>
        ) : error ? (
          <div className="team-message team-error">
            {error}
            <button onClick={fetchTeam}>Try Again</button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="team-empty">
            <Users size={40} />
            <h3>No team members found</h3>
            <p>
              Registered office team members will appear here.
            </p>
          </div>
        ) : (
          <table className="team-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div className="team-member-name">
                      <div className="team-avatar">
                        {(member.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <strong>{member.name || "Unknown"}</strong>
                    </div>
                  </td>

                  <td>{member.email || "N/A"}</td>

                  <td>
                    <span className="team-role">
                      {member.role || "Member"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        member.isActive === false
                          ? "team-status inactive"
                          : "team-status active"
                      }
                    >
                      {member.isActive === false
                        ? "Inactive"
                        : "Active"}
                    </span>
                  </td>

                  <td>
                    {member.createdAt
                      ? new Date(
                          member.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Team;

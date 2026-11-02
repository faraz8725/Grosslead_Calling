
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Search,
  RefreshCw,
  Eye,
  Trash2,
} from "lucide-react";
import api from "../services/api";
import "../styles/Calls.css";

function Calls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/calls");
      const data = response.data;

      setCalls(
        Array.isArray(data)
          ? data
          : data.calls || data.data || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Calls load nahi ho payi. Backend API check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const deleteCall = async (id) => {
    const confirmDelete = window.confirm(
      "Kya tum is call record ko delete karna chahte ho?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/calls/${id}`);

      setCalls((previous) =>
        previous.filter((call) => call._id !== id)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Call delete nahi ho payi."
      );
    }
  };

  const filteredCalls = calls.filter((call) => {
    const name =
      call.lead?.name ||
      call.customerName ||
      "";

    const phone =
      call.lead?.phone ||
      call.phone ||
      "";

    const searchText = `${name} ${phone}`.toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const getStatusClass = (status = "") => {
    const value = status.toLowerCase();

    if (["completed", "connected", "success"].includes(value)) {
      return "call-status-success";
    }

    if (["failed", "missed", "rejected"].includes(value)) {
      return "call-status-failed";
    }

    return "call-status-pending";
  };

  return (
    <div className="calls-page">
      <div className="calls-header">
        <div>
          <h1>Call History</h1>
          <p>Monitor and manage all AI calling activities.</p>
        </div>

        <button
          className="calls-refresh-btn"
          onClick={fetchCalls}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="calls-summary">
        <div className="calls-summary-card">
          <Phone size={22} />
          <div>
            <span>Total Calls</span>
            <h2>{calls.length}</h2>
          </div>
        </div>

        <div className="calls-summary-card">
          <Phone size={22} />
          <div>
            <span>Completed Calls</span>
            <h2>
              {
                calls.filter((call) =>
                  ["completed", "connected", "success"].includes(
                    (call.status || "").toLowerCase()
                  )
                ).length
              }
            </h2>
          </div>
        </div>
      </div>

      <div className="calls-toolbar">
        <div className="calls-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search customer or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="calls-table-wrapper">
        {loading ? (
          <p className="calls-message">Loading calls...</p>
        ) : error ? (
          <div className="calls-message calls-error">
            {error}
            <button onClick={fetchCalls}>Try Again</button>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="calls-empty">
            <Phone size={38} />
            <h3>No calls found</h3>
            <p>Your call history will appear here.</p>
          </div>
        ) : (
          <table className="calls-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Interest</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCalls.map((call) => (
                <tr key={call._id}>
                  <td>
                    {call.lead?.name ||
                      call.customerName ||
                      "Unknown"}
                  </td>

                  <td>
                    {call.lead?.phone ||
                      call.phone ||
                      "N/A"}
                  </td>

                  <td>{call.duration ?? 0}s</td>

                  <td>
                    <span
                      className={`call-status ${getStatusClass(
                        call.status
                      )}`}
                    >
                      {call.status || "Unknown"}
                    </span>
                  </td>

                  <td>
                    {call.interest || call.outcome || "Unknown"}
                  </td>

                  <td>
                    {call.createdAt
                      ? new Date(call.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td>
                    <div className="calls-actions">
                      <Link
                        to={`/calls/${call._id}`}
                        title="View details"
                      >
                        <Eye size={18} />
                      </Link>

                      <button
                        type="button"
                        title="Delete call"
                        onClick={() => deleteCall(call._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

export default Calls;

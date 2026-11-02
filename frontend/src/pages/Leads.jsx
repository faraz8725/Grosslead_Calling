
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Trash2,
  Pencil,
  Phone,
  RefreshCw
} from "lucide-react";

import { Link } from "react-router-dom";
import api from "../services/api";

import "../styles/Leads.css";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const response = await api.get("/leads", {
        params: {
          search,
          status,
          page,
          limit: 20
        }
      });

      setLeads(response.data.leads);
      setTotal(response.data.total);
      setPages(response.data.pages || 1);
      setSelected([]);

    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch leads"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, status, page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === leads.length) {
      setSelected([]);
    } else {
      setSelected(leads.map((lead) => lead._id));
    }
  };

  return (
    <div className="leads-page">

      <div className="leads-heading">
        <div>
          <span className="leads-eyebrow">CUSTOMER DATABASE</span>
          <h1>Lead Management</h1>
          <p>Manage, organize and track all your customer leads.</p>
        </div>

        <div className="leads-actions">
          <Link to="/leads/add" className="lead-add-btn">
            <Plus size={17} /> Add Lead
          </Link>

          <Link to="/leads/import" className="lead-import-btn">
            <Upload size={17} /> Import Excel
          </Link>
        </div>
      </div>

      <div className="leads-summary">
        <div>
          <span>Total Leads</span>
          <strong>{total}</strong>
        </div>

        <div>
          <span>Current Page</span>
          <strong>{page} / {pages}</strong>
        </div>
      </div>

      <div className="leads-toolbar">

        <div className="leads-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="pending">Pending</option>
          <option value="calling">Calling</option>
          <option value="connected">Connected</option>
          <option value="follow-up">Follow-up</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <button
          className="refresh-btn"
          onClick={fetchLeads}
          title="Refresh"
        >
          <RefreshCw size={17} />
        </button>

      </div>

      {error && <div className="lead-error">{error}</div>}

      <div className="leads-table-container">

        <table className="leads-table">

          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    leads.length > 0 &&
                    selected.length === leads.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Source</th>
              <th>Status</th>
              <th>Interest</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-message">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-message">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id}>

                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(lead._id)}
                      onChange={() => handleSelect(lead._id)}
                    />
                  </td>

                  <td>
                    <div className="lead-customer">
                      <strong>{lead.name}</strong>
                      <span>{lead.email || lead.company || "—"}</span>
                    </div>
                  </td>

                  <td>{lead.phone}</td>

                  <td>
                    <span className="lead-source">
                      {lead.source}
                    </span>
                  </td>

                  <td>
                    <span className={`lead-status ${lead.status}`}>
                      {lead.status}
                    </span>
                  </td>

                  <td>
                    <span className={`lead-interest ${lead.interest}`}>
                      {lead.interest}
                    </span>
                  </td>

                  <td>
                    {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td>
                    <div className="lead-row-actions">
                      <Link
                        to={`/leads/${lead._id}/edit`}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>

                      <button
                        onClick={() => handleDelete(lead._id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>

                      <a
                        href={`tel:${lead.phone}`}
                        title="Manual call"
                      >
                        <Phone size={16} />
                      </a>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

      <div className="leads-pagination">
        <span>
          Showing {leads.length} of {total} leads
        </span>

        <div>
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <strong>{page}</strong>

          <button
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="selected-leads-bar">
          {selected.length} leads selected.
          <span> AI calling integration will be added in the campaign phase.</span>
        </div>
      )}

    </div>
  );
};

export default Leads;

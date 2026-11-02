
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import api from "../services/api";
import "../styles/AddLead.css";

const AddLead = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/leads", form);
      navigate("/leads");

    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to add lead"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-lead-page">

      <button
        className="back-leads"
        onClick={() => navigate("/leads")}
      >
        <ArrowLeft size={17} /> Back to Leads
      </button>

      <div className="add-lead-heading">
        <h1>Add New Lead</h1>
        <p>Enter customer details to add them to your CRM.</p>
      </div>

      <form
        className="add-lead-form"
        onSubmit={handleSubmit}
      >

        <div className="add-lead-grid">

          <div className="add-lead-field">
            <label>Customer Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div className="add-lead-field">
            <label>Phone Number *</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter 10 digit mobile number"
              required
            />
          </div>

          <div className="add-lead-field">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>

          <div className="add-lead-field">
            <label>Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </div>

        </div>

        <div className="add-lead-field">
          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Add additional information..."
            rows="5"
          />
        </div>

        {error && (
          <div className="add-lead-error">{error}</div>
        )}

        <div className="add-lead-footer">
          <button
            type="button"
            className="cancel-lead"
            onClick={() => navigate("/leads")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-lead"
            disabled={loading}
          >
            <Save size={17} />
            {loading ? "Saving..." : "Save Lead"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddLead;

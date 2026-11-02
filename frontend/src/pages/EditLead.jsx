
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import "../styles/AddLead.css";

const EditLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLead = async () => {
      try {
        const response = await api.get(`/leads/${id}`);

        const lead = response.data.lead;

        setForm({
          name: lead.name || "",
          phone: lead.phone || "",
          email: lead.email || "",
          company: lead.company || "",
          notes: lead.notes || ""
        });

      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load lead"
        );
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/leads/${id}`, form);
      navigate("/leads");
    } catch (err) {
      setError(
        err.response?.data?.message || "Update failed"
      );
    }
  };

  if (loading) return <div className="placeholder-page">Loading lead...</div>;

  return (
    <div className="add-lead-page">
      <div className="add-lead-heading">
        <h1>Edit Lead</h1>
        <p>Update customer information.</p>
      </div>

      <form className="add-lead-form" onSubmit={handleSubmit}>
        {["name", "phone", "email", "company"].map((field) => (
          <div className="add-lead-field" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>

            <input
              type={field === "email" ? "email" : "text"}
              value={form[field]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
              required={["name", "phone"].includes(field)}
            />
          </div>
        ))}

        <div className="add-lead-field">
          <label>Notes</label>
          <textarea
            rows="4"
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          />
        </div>

        {error && <div className="add-lead-error">{error}</div>}

        <div className="add-lead-footer">
          <button
            type="button"
            className="cancel-lead"
            onClick={() => navigate("/leads")}
          >
            Cancel
          </button>

          <button type="submit" className="save-lead">
            Update Lead
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLead;

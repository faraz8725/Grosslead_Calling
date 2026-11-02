
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/CallDetails.css";

function CallDetails() {
  const { id } = useParams();

  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCall = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/calls/${id}`);

        setCall(response.data.call || response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Call details load nahi ho payi."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCall();
  }, [id]);

  if (loading) {
    return (
      <div className="call-details-page">
        <p>Loading call details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="call-details-page">
        <Link to="/calls" className="back-link">
          ← Back to Calls
        </Link>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="call-details-page">
        <p>Call record nahi mila.</p>
        <Link to="/calls">Back to Calls</Link>
      </div>
    );
  }

  const lead = call.lead || {};

  return (
    <div className="call-details-page">
      <div className="call-details-header">
        <div>
          <Link to="/calls" className="back-link">
            ← Back to Calls
          </Link>
          <h1>Call Details</h1>
          <p>Complete call information and conversation history.</p>
        </div>
      </div>

      <div className="call-info-grid">
        <div className="call-info-card">
          <span>Customer</span>
          <h3>{lead.name || call.customerName || "Unknown"}</h3>
        </div>

        <div className="call-info-card">
          <span>Phone Number</span>
          <h3>{lead.phone || call.phone || "N/A"}</h3>
        </div>

        <div className="call-info-card">
          <span>Duration</span>
          <h3>{call.duration ?? 0} seconds</h3>
        </div>

        <div className="call-info-card">
          <span>Call Status</span>
          <h3>{call.status || "N/A"}</h3>
        </div>

        <div className="call-info-card">
          <span>Interest</span>
          <h3>{call.interest || call.outcome || "Unknown"}</h3>
        </div>

        <div className="call-info-card">
          <span>Human Handoff</span>
          <h3>{call.handoffRequired ? "Required" : "Not Required"}</h3>
        </div>

        <div className="call-info-card">
          <span>Resolved</span>
          <h3>{call.resolved ? "Yes" : "No"}</h3>
        </div>

        <div className="call-info-card">
          <span>Call Date</span>
          <h3>
            {call.createdAt
              ? new Date(call.createdAt).toLocaleString()
              : "N/A"}
          </h3>
        </div>
      </div>

      <section className="call-details-section">
        <h2>Call Recording</h2>

        {call.recordingUrl ? (
          <audio controls preload="metadata">
            <source src={call.recordingUrl} />
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p>Recording abhi available nahi hai.</p>
        )}
      </section>

      <section className="call-details-section">
        <h2>Conversation Transcript</h2>

        <div className="transcript-box">
          {Array.isArray(call.transcript) && call.transcript.length > 0 ? (
            call.transcript.map((message, index) => (
              <div className="transcript-message" key={message._id || index}>
                <strong>
                  {message.speaker || message.role || "Speaker"}:
                </strong>
                <p>{message.text || message.content || ""}</p>
              </div>
            ))
          ) : (
            <p>
              Transcript abhi available nahi hai.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default CallDetails;

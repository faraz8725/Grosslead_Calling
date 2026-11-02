
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Placeholder.css";

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Campaign API abhi connect nahi hui hai.
    // Backend campaign routes banne ke baad yahan data load hoga.
    setCampaigns([]);
    setLoading(false);
  }, []);

  return (
    <div className="placeholder-page">
      <div className="placeholder-header">
        <div>
          <h1>Campaigns</h1>
          <p>Manage your AI calling campaigns.</p>
        </div>

        <Link to="/leads" className="placeholder-button">
          View Leads
        </Link>
      </div>

      <div className="placeholder-content">
        {loading ? (
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <div>
            <h2>No campaigns yet</h2>
            <p>
              Your campaigns will appear here once campaign
              creation and backend integration are implemented.
            </p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign._id}>
              {campaign.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Campaigns;

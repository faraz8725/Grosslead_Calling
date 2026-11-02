
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Placeholder.css";

function Analytics() {
  const [stats, setStats] = useState({
    totalCalls: 0,
    completedCalls: 0,
    positiveCalls: 0,
    negativeCalls: 0,
    mediumCalls: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Analytics API abhi backend mein implement nahi hui hai.
    setLoading(false);
  }, []);

  const cards = [
    { title: "Total Calls", value: stats.totalCalls },
    { title: "Completed Calls", value: stats.completedCalls },
    { title: "Positive Calls", value: stats.positiveCalls },
    { title: "Negative Calls", value: stats.negativeCalls },
    { title: "Medium Calls", value: stats.mediumCalls },
  ];

  return (
    <div className="placeholder-page">
      <div className="placeholder-header">
        <div>
          <h1>Analytics</h1>
          <p>Track and analyze your AI calling performance.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <div className="analytics-grid">
          {cards.map((card) => (
            <div className="analytics-card" key={card.title}>
              <h3>{card.title}</h3>
              <h2>{card.value}</h2>
            </div>
          ))}
        </div>
      )}

      <div className="placeholder-content">
        <h2>Calling Performance</h2>
        <p>
          Detailed call reports, outcomes and performance
          charts will appear here after analytics API integration.
        </p>
      </div>
    </div>
  );
}

export default Analytics;

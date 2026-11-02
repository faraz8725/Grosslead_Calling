
import "../styles/StatCard.css";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color
}) => {
  return (
    <div className="stat-card">

      <div className="stat-card-top">
        <div>
          <p>{title}</p>
          <h2>{value}</h2>
        </div>

        <div
          className="stat-icon"
          style={{
            background: `${color}18`,
            color: color
          }}
        >
          <Icon size={22} />
        </div>
      </div>

      <div className="stat-subtitle">
        {subtitle}
      </div>

    </div>
  );
};

export default StatCard;

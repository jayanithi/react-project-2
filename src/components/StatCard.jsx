export default function StatCard({ icon: Icon, label, value, detail, color, trend }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${color}`}><Icon /></div>
        {trend && <span className="stat-trend"><span aria-hidden="true">↗</span> +6.4%</span>}
      </div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </article>
  );
}

export default function DateFilter({ value, onChange }) {
    return (
      <select
        className="border px-3 py-2 rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="quarter">Last 3 Months</option>
        <option value="year">This Year</option>
      </select>
    );
  }
  
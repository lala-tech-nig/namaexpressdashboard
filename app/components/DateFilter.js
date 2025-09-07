"use client";

export default function DateFilter({ value, onChange }) {
  return (
    <div className="inline-block">
      <select
        className="
          border border-gray-200 
          bg-white 
          text-gray-700 
          px-4 py-2 
          rounded-lg 
          shadow-sm 
          focus:outline-none 
          focus:ring-2 focus:ring-indigo-500 
          focus:border-indigo-500 
          transition 
          duration-200 
          hover:bg-gray-50
        "
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="quarter">Last 3 Months</option>
        <option value="year">This Year</option>
      </select>
    </div>
  );
}

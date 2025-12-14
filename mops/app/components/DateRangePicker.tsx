"use client";

import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export default function DateRangePicker({
  value,
  onChange,
}: DateRangePickerProps) {
  const handlePreset = (days: number | "all") => {
    const to = new Date();
    const from = days === "all" ? new Date(2000, 0, 1) : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    onChange({ from, to });
  };

  return (
    <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-green-900">
        Select Date Range
      </h3>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handlePreset(7)}
          className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
        >
          Last 7 days
        </button>
        <button
          onClick={() => handlePreset(30)}
          className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
        >
          Last 30 days
        </button>
        <button
          onClick={() => handlePreset(90)}
          className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
        >
          Last 90 days
        </button>
        <button
          onClick={() => handlePreset("all")}
          className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
        >
          All time
        </button>
      </div>

      <DayPicker
        mode="range"
        selected={value}
        onSelect={(range) => range && onChange(range)}
        numberOfMonths={2}
        className="border-t border-green-100 pt-4"
      />

      {value.from && value.to && (
        <div className="mt-4 border-t border-green-100 pt-4 text-sm text-green-700">
          <strong>Selected:</strong> {format(value.from, "MMM dd, yyyy")} -{" "}
          {format(value.to, "MMM dd, yyyy")}
        </div>
      )}
    </div>
  );
}

import { Clock } from "lucide-react";
import { formatTime } from "@/lib/time";

interface BookingTimeFormProps {
  startTime: string;
  endTime: string;
  currentTime: number;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onCurrentTimeChange: (value: number) => void;
  onCheck: () => void;
}

export default function BookingTimeForm({
  startTime,
  endTime,
  currentTime,
  onStartTimeChange,
  onEndTimeChange,
  onCurrentTimeChange,
  onCheck,
}: BookingTimeFormProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Clock className="h-4 w-4 text-slate-400" />
        Booking Time
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Start time */}
        <div>
          <label htmlFor="start-time" className="mb-1.5 block text-xs font-medium text-slate-600">
            Start Time
          </label>
          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* End time */}
        <div>
          <label htmlFor="end-time" className="mb-1.5 block text-xs font-medium text-slate-600">
            End Time
          </label>
          <input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Current time slider */}
        <div>
          <label htmlFor="current-time" className="mb-1.5 block text-xs font-medium text-slate-600">
            Current Time:{" "}
            <span className="font-semibold text-slate-800">
              {formatTime(currentTime)}
            </span>
          </label>
          <input
            id="current-time"
            type="range"
            min={0}
            max={1440}
            step={15}
            value={currentTime}
            onChange={(e) => onCurrentTimeChange(Number(e.target.value))}
            className="mt-2 w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Duration hint */}
      <p className="mt-3 text-xs text-slate-400">
        Max booking duration: 120 minutes. Times are in 24-hour format. Touching
        bookings (back-to-back) are allowed.
      </p>

      {/* Check button */}
      <button
        onClick={onCheck}
        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 sm:w-auto"
      >
        Check Availability
      </button>
    </section>
  );
}

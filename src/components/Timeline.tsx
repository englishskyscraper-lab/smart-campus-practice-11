import { useMemo } from "react";
import type { Room, Booking } from "@/types";
import { getRoomBookings } from "@/lib/bookings";
import { formatTime } from "@/lib/time";

interface TimelineProps {
  room: Room | null;
  bookings: Booking[];
  candidateStart: number | null;
  candidateEnd: number | null;
  currentTime: number;
}

const HOURS = Array.from({ length: 25 }, (_, i) => i); // 0–24

export default function Timeline({
  room,
  bookings,
  candidateStart,
  candidateEnd,
  currentTime,
}: TimelineProps) {
  const roomBookings = useMemo(
    () => (room ? getRoomBookings(bookings, room.id) : []),
    [room, bookings]
  );

  const pct = (min: number) => `${(min / 1440) * 100}%`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Daily Timeline{room ? ` — ${room.name}` : ""}
        </h3>
        <div className="hidden gap-4 text-xs text-slate-500 sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" /> Existing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Candidate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-0.5 bg-rose-500" /> Now
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-16 rounded-lg bg-slate-100">
        {/* Hour gridlines */}
        {HOURS.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: pct(h * 60) }}
          />
        ))}

        {/* Existing bookings */}
        {roomBookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-1 bottom-1 rounded-md bg-slate-400 px-1 flex items-center overflow-hidden"
            style={{ left: pct(b.start), width: pct(b.end - b.start) }}
            title={`${b.title} — ${formatTime(b.start)} to ${formatTime(b.end)}`}
          >
            <span className="truncate text-[10px] font-medium text-white hidden sm:inline">
              {b.title}
            </span>
          </div>
        ))}

        {/* Candidate interval */}
        {candidateStart !== null && candidateEnd !== null && (
          <div
            className="absolute top-1 bottom-1 rounded-md border-2 border-emerald-500 bg-emerald-400/40 flex items-center justify-center"
            style={{
              left: pct(Math.min(candidateStart, candidateEnd)),
              width: pct(Math.abs(candidateEnd - candidateStart)),
            }}
          >
            <span className="text-[10px] font-semibold text-emerald-700 hidden sm:inline">
              {formatTime(candidateStart)}–{formatTime(candidateEnd)}
            </span>
          </div>
        )}

        {/* Current time marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
          style={{ left: pct(currentTime) }}
        >
          <span className="absolute -top-0 -translate-y-full text-[10px] font-semibold text-rose-600 whitespace-nowrap">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Hour labels */}
      <div className="relative mt-1.5 h-4">
        {[0, 6, 12, 18, 24].map((h) => (
          <span
            key={h}
            className="absolute text-[10px] text-slate-400 -translate-x-1/2"
            style={{ left: pct(h * 60) }}
          >
            {formatTime(h * 60)}
          </span>
        ))}
      </div>
    </div>
  );
}

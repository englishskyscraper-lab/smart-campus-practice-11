import { DoorClosed, Users, Lock, SearchX } from "lucide-react";
import type { Room } from "@/types";

interface RoomPickerProps {
  rooms: Room[];
  selectedRoomId: string | undefined;
  onSelectRoom: (room: Room) => void;
}

export default function RoomPicker({ rooms, selectedRoomId, onSelectRoom }: RoomPickerProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <DoorClosed className="h-4 w-4 text-slate-400" />
        Select a Room
      </h2>
      {rooms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <SearchX className="mx-auto mb-2 h-6 w-6 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">
            No rooms match your selected requirements.
          </p>
          <p className="mt-1 text-xs text-slate-500">Try changing your filters.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {room.name}
                </p>
                <p className="text-xs text-slate-500">{room.building}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Users className="h-3 w-3" /> {room.capacity} seats
                </p>
              </div>
              {room.blocked && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                  <Lock className="h-3 w-3" /> Blocked
                </span>
              )}
            </button>
          );
        })}
      </div>
      )}
    </section>
  );
}

import { SlidersHorizontal } from "lucide-react";

interface RoomRequirementsProps {
  attendeeInput: string;
  selectedEquipment: string[];
  equipmentOptions: string[];
  onAttendeesChange: (value: string) => void;
  onToggleEquipment: (item: string) => void;
}

export default function RoomRequirements({
  attendeeInput,
  selectedEquipment,
  equipmentOptions,
  onAttendeesChange,
  onToggleEquipment,
}: RoomRequirementsProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        Room Requirements
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="attendees" className="mb-1.5 block text-xs font-medium text-slate-600">
            Number of Attendees
          </label>
          <input
            id="attendees"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Any"
            value={attendeeInput}
            onChange={(e) => onAttendeesChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-slate-600">
            Required Equipment
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {equipmentOptions.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedEquipment.includes(item)}
                  onChange={() => onToggleEquipment(item)}
                  className="h-4 w-4 cursor-pointer accent-blue-600"
                />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}

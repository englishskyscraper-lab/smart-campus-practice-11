import { Building2 } from "lucide-react";
import { ALL_EQUIPMENT } from "@/data/rooms";
import { bookings } from "@/data/bookings";
import Timeline from "@/components/Timeline";
import RoomRequirements from "@/features/rooms/RoomRequirements";
import RoomPicker from "@/features/rooms/RoomPicker";
import { useAvailabilityCheck } from "@/features/availability/useAvailabilityCheck";
import BookingTimeForm from "@/features/availability/BookingTimeForm";
import ResultBanner from "@/features/availability/ResultBanner";

function App() {
  const {
    attendeeInput,
    selectedEquipment,
    filteredRooms,
    selectedRoom,
    startTime,
    endTime,
    startMin,
    endMin,
    currentTime,
    result,
    updateAttendees,
    toggleEquipment,
    selectRoom,
    updateStartTime,
    updateEndTime,
    updateCurrentTime,
    runCheck,
  } = useAvailabilityCheck();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                Smart Campus Room Availability
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Check whether a room is free for your desired time slot.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        {/* Requirements */}
        <RoomRequirements
          attendeeInput={attendeeInput}
          selectedEquipment={selectedEquipment}
          equipmentOptions={ALL_EQUIPMENT}
          onAttendeesChange={updateAttendees}
          onToggleEquipment={toggleEquipment}
        />

        {/* Room selection */}
        <RoomPicker
          rooms={filteredRooms}
          selectedRoomId={selectedRoom?.id}
          onSelectRoom={selectRoom}
        />

        {/* Time inputs */}
        <BookingTimeForm
          startTime={startTime}
          endTime={endTime}
          currentTime={currentTime}
          onStartTimeChange={updateStartTime}
          onEndTimeChange={updateEndTime}
          onCurrentTimeChange={updateCurrentTime}
          onCheck={runCheck}
        />

        {/* Timeline */}
        {selectedRoom && (
          <Timeline
            room={selectedRoom}
            bookings={bookings}
            candidateStart={Number.isNaN(startMin) ? null : startMin}
            candidateEnd={Number.isNaN(endMin) ? null : endMin}
            currentTime={currentTime}
          />
        )}

        {/* Result */}
        {result && <ResultBanner result={result} />}
      </main>
    </div>
  );
}

export default App;

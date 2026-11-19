import { describe, expect, test } from "vitest";
import { rooms } from "@/data/rooms";
import { bookings } from "@/data/bookings";
import { DEFAULT_CURRENT_TIME } from "@/data/config";
import { checkAvailability } from "@/lib/availability";
import { getRoomBookings } from "@/lib/bookings";
import { filterByCapacity, filterByEquipment } from "@/lib/roomFilters";
import { parseTime } from "@/lib/time";

function searchRooms(attendeeInput: string, equipment: string[]) {
  const requiredCapacity = attendeeInput === "" ? 0 : Number(attendeeInput);
  return filterByEquipment(filterByCapacity(rooms, requiredCapacity), equipment);
}

function checkRoom(roomId: string, startTime: string, endTime: string) {
  const room = rooms.find((r) => r.id === roomId)!;
  return checkAvailability({
    room,
    start: parseTime(startTime),
    end: parseTime(endTime),
    currentTime: DEFAULT_CURRENT_TIME,
    existingBookings: getRoomBookings(bookings, room.id),
  });
}

describe("availability user flow (integration)", () => {
  test("I01 — 20 attendees with Whiteboard lists Room A-101, B-204 and D-105; B-204 at 11:00–12:00 is available", () => {
    const filtered = searchRooms("20", ["Whiteboard"]);
    expect(filtered.map((r) => r.name)).toEqual(["Room A-101", "Room B-204", "Room D-105"]);

    const result = checkRoom("r2", "11:00", "12:00");
    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  test("I02 — Room A-101 at 12:00–13:00 is unavailable with a time overlap naming the Physics Lab booking", () => {
    const filtered = searchRooms("20", ["Whiteboard"]);
    expect(filtered.some((r) => r.id === "r1")).toBe(true);

    const result = checkRoom("r1", "12:00", "13:00");
    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("time-overlap");
    expect(result.reason).toContain("Physics Lab");
  });

  test("I03 — 10 attendees with Computers lists blocked Lab C-310, and checking it is unavailable as room-blocked", () => {
    const filtered = searchRooms("10", ["Computers"]);
    expect(filtered.map((r) => r.name)).toEqual(["Room A-101", "Lab C-310", "Room D-105"]);

    const result = checkRoom("r3", "11:00", "12:00");
    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("room-blocked");
  });

  test("I05 — an empty attendee field with no equipment filters returns all rooms", () => {
    expect(searchRooms("", [])).toEqual(rooms);
  });

  test("I04 — 50 attendees with Laboratory Equipment matches no room, leaving nothing to select", () => {
    expect(searchRooms("50", ["Laboratory Equipment"])).toEqual([]);
  });
});

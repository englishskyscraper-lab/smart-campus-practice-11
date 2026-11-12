import { describe, expect, test } from "vitest";
import { checkAvailability } from "./availability";
import type { Room, Booking } from "@/types";
import { rooms } from "@/data/rooms";
import { bookings } from "@/data/bookings";

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "room-1",
    name: "Room 101",
    building: "Main Building",
    capacity: 20,
    blocked: false,
    equipment: [],
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    roomId: "room-1",
    start: 600,
    end: 660,
    title: "Existing booking",
    bookedBy: "Student",
    ...overrides,
  };
}

describe("checkAvailability", () => {
  // T01: Touching the end of an existing booking at its start is allowed.
  test("T01 — 660–720 is available (touches existing 600–660 at its end)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 660,
      end: 720,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  // T02: Start time equal to current time is not "after" current time.
  test("T02 — 540–570 is unavailable when start equals current time", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 540,
      end: 570,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("start-in-past");
  });

  // T03: Zero-duration interval.
  test("T03 — 720–720 is unavailable (zero-duration interval)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 720,
      end: 720,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("invalid-interval");
  });

  // T04: End before start.
  test("T04 — 750–720 is unavailable (end before start)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 750,
      end: 720,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("invalid-interval");
  });

  // T05: End exceeds daily limit.
  test("T05 — 1380–1441 is unavailable (end exceeds 1440)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 1380,
      end: 1441,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("invalid-interval");
  });

  // T06: Exactly 120 minutes is allowed.
  test("T06 — 720–840 is available (duration exactly 120 minutes)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 720,
      end: 840,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  // T07: 121 minutes exceeds the limit.
  test("T07 — 720–841 is unavailable (duration 121 minutes)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 720,
      end: 841,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("too-long");
  });

  // T08: Touching the start of an existing booking at its end is allowed.
  test("T08 — 570–600 is available (touches existing 600–660 at its start)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 570,
      end: 600,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  // T09: Partial overlap.
  test("T09 — 630–690 is unavailable (partial overlap with 600–660)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 630,
      end: 690,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("time-overlap");
  });

  // T10: Requested interval fully contains the existing booking.
  test("T10 — 570–690 is unavailable (contains existing 600–660)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 570,
      end: 690,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("time-overlap");
  });

  // T11: Requested interval is inside the existing booking.
  test("T11 — 615–645 is unavailable (inside existing 600–660)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 615,
      end: 645,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("time-overlap");
  });

  // T12: Exact same interval as the existing booking.
  test("T12 — 600–660 is unavailable (exact same interval as existing)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 600,
      end: 660,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("time-overlap");
  });

  // T13: Room is blocked.
  test("T13 — 660–720 is unavailable when room is blocked", () => {
    const room = makeRoom({ blocked: true });
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 660,
      end: 720,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("room-blocked");
  });

  // T14: No existing bookings at all.
  test("T14 — 630–690 is available when there are no existing bookings", () => {
    const room = makeRoom();
    const existingBookings: Booking[] = [];

    const result = checkAvailability({
      room,
      start: 630,
      end: 690,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  // T15: Available, and existingBookings is not mutated.
  test("T15 — 720–840 is available and existingBookings is unchanged after the call", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];
    const snapshot = JSON.parse(JSON.stringify(existingBookings));

    const result = checkAvailability({
      room,
      start: 720,
      end: 840,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
    expect(existingBookings).toEqual(snapshot);
  });

  // T16: Existing booking belongs to a different room.
  test("T16 — 630–690 on room-1 is available when the 600–660 booking belongs to room-2", () => {
    const room = makeRoom({ id: "room-1" });
    const existingBookings = [
      makeBooking({ id: "booking-2", roomId: "room-2", start: 600, end: 660 }),
    ];

    const result = checkAvailability({
      room,
      start: 630,
      end: 690,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  // T17: End is exactly 1440 and duration is exactly 120.
  test("T17 — 1320–1440 is available (end exactly 1440, duration exactly 120)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 1320,
      end: 1440,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  // T18: Negative start time is invalid.
  // Covers AC1 (start must be within 00:00–24:00). Without this test, removing
  // the `start < 0` guard in the implementation goes undetected.
  test("T18 — -30 to 30 is unavailable (negative start time)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: -30,
      end: 30,
      currentTime: -60,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("invalid-interval");
  });

  // T19: Start exactly 0 is valid (boundary for the start >= 0 check).
  // Covers AC1. A mutation changing `start < 0` to `start <= 0` would
  // incorrectly reject start=0; this test catches that.
  test("T19 — 0 to 60 is available when currentTime is before 0 (start at midnight boundary)", () => {
    const room = makeRoom();
    const existingBookings: Booking[] = [];

    const result = checkAvailability({
      room,
      start: 0,
      end: 60,
      currentTime: -1,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  // T20: Start exactly one minute after current time is valid.
  // Covers AC1 (start must be *after* current time). T02 covers the equality
  // boundary (start == currentTime → unavailable); this covers the off-by-one
  // boundary (start == currentTime + 1 → available).
  test("T20 — 541 to 600 is available (start is exactly 1 minute after current time)", () => {
    const room = makeRoom();
    const existingBookings = [makeBooking({ start: 600, end: 660 })];

    const result = checkAvailability({
      room,
      start: 541,
      end: 600,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("available");
    expect(result.reasonCategory).toBe("ok");
  });

  // T21: Overlap with the *second* of two bookings.
  // Covers AC4. All other overlap tests use a single booking, so a mutation
  // that only checks the first element of existingBookings would escape.
  // This test places a non-overlapping booking first and an overlapping
  // booking second.
  test("T21 — 830–870 is unavailable (overlaps the second of two bookings)", () => {
    const room = makeRoom();
    const existingBookings = [
      makeBooking({ id: "b-first", start: 600, end: 660 }),
      makeBooking({ id: "b-second", start: 840, end: 900, title: "Later booking" }),
    ];

    const result = checkAvailability({
      room,
      start: 830,
      end: 870,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("time-overlap");
  });

  // T22: Overlap with the *first* of two bookings.
  // Covers AC4. Companion to T21 — this catches a mutation that only checks
  // the *last* element of existingBookings. The overlapping booking is first
  // and a non-overlapping booking is second.
  test("T22 — 630–690 is unavailable (overlaps the first of two bookings)", () => {
    const room = makeRoom();
    const existingBookings = [
      makeBooking({ id: "b-first", start: 600, end: 660, title: "Early booking" }),
      makeBooking({ id: "b-second", start: 840, end: 900 }),
    ];

    const result = checkAvailability({
      room,
      start: 630,
      end: 690,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("time-overlap");
  });

  // T23: Start strictly before current time is rejected.
  // Covers AC1 (past requests). T02 covers the equal boundary; this covers a start well in the past.
  test("T23 — 500–560 is unavailable when current time is 540 (start in the past)", () => {
    const room = makeRoom();
    const existingBookings: Booking[] = [];

    const result = checkAvailability({
      room,
      start: 500,
      end: 560,
      currentTime: 540,
      existingBookings,
    });

    expect(result.decision).toBe("unavailable");
    expect(result.reasonCategory).toBe("start-in-past");
  });

  // T24: Sample app fixtures drive the expected results and are not mutated.
  // Covers AC3 (blocked room r3), AC4 (touching r1 at 600 is allowed), AC5–AC6 (no mutation).
  test("T24 — sample fixtures: 600–660 touching r1's 540–600 is allowed, blocked r3 is rejected, and fixtures are unchanged", () => {
    const snapshotRooms = JSON.parse(JSON.stringify(rooms));
    const snapshotBookings = JSON.parse(JSON.stringify(bookings));
    const room1 = rooms.find((r) => r.id === "r1")!;
    const blockedRoom = rooms.find((r) => r.id === "r3")!;

    const touching = checkAvailability({
      room: room1,
      start: 600,
      end: 660,
      currentTime: 540,
      existingBookings: bookings,
    });
    expect(touching.decision).toBe("available");
    expect(touching.reasonCategory).toBe("ok");

    const blocked = checkAvailability({
      room: blockedRoom,
      start: 600,
      end: 660,
      currentTime: 540,
      existingBookings: bookings,
    });
    expect(blocked.decision).toBe("unavailable");
    expect(blocked.reasonCategory).toBe("room-blocked");

    expect(rooms).toEqual(snapshotRooms);
    expect(bookings).toEqual(snapshotBookings);
  });
});

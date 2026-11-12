import { describe, expect, test } from "vitest";
import { getRoomBookings } from "./bookings";
import type { Booking } from "@/types";

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

describe("getRoomBookings", () => {
  test("returns only bookings whose roomId matches", () => {
    const bookings = [
      makeBooking({ id: "b1", roomId: "room-1" }),
      makeBooking({ id: "b2", roomId: "room-2" }),
      makeBooking({ id: "b3", roomId: "room-1" }),
    ];

    const result = getRoomBookings(bookings, "room-1");

    expect(result.map((b) => b.id)).toEqual(["b1", "b3"]);
  });

  test("returns an empty array when no booking matches the room", () => {
    const bookings = [makeBooking({ roomId: "room-2" })];

    expect(getRoomBookings(bookings, "room-1")).toEqual([]);
  });

  test("returns an empty array when the bookings list is empty", () => {
    expect(getRoomBookings([], "room-1")).toEqual([]);
  });

  test("returns every booking when all belong to the room", () => {
    const bookings = [
      makeBooking({ id: "b1" }),
      makeBooking({ id: "b2", start: 720, end: 780 }),
    ];

    const result = getRoomBookings(bookings, "room-1");

    expect(result).toEqual(bookings);
  });

  test("preserves the original order of matching bookings", () => {
    const bookings = [
      makeBooking({ id: "late", roomId: "room-1", start: 900, end: 960 }),
      makeBooking({ id: "other", roomId: "room-2", start: 600, end: 660 }),
      makeBooking({ id: "early", roomId: "room-1", start: 480, end: 540 }),
    ];

    const result = getRoomBookings(bookings, "room-1");

    expect(result.map((b) => b.id)).toEqual(["late", "early"]);
  });

  test("does not mutate the original bookings array", () => {
    const bookings = [
      makeBooking({ id: "b1", roomId: "room-2" }),
      makeBooking({ id: "b2", roomId: "room-1" }),
    ];
    const snapshot = JSON.parse(JSON.stringify(bookings));

    getRoomBookings(bookings, "room-1");

    expect(bookings).toEqual(snapshot);
    expect(bookings).toHaveLength(2);
  });

  test("returns a new array instance rather than the input array", () => {
    const bookings = [makeBooking({ roomId: "room-1" })];

    const result = getRoomBookings(bookings, "room-1");

    expect(result).not.toBe(bookings);
  });

  test("does not match when roomId differs only by case", () => {
    const bookings = [makeBooking({ roomId: "Room-1" })];

    expect(getRoomBookings(bookings, "room-1")).toEqual([]);
  });
});

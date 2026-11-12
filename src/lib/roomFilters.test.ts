import { describe, expect, test } from "vitest";
import { filterByCapacity, filterByEquipment } from "./roomFilters";
import type { Room } from "@/types";

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

const rooms: Room[] = [
  makeRoom({ id: "small", capacity: 10, equipment: ["Whiteboard"] }),
  makeRoom({ id: "medium", capacity: 25, equipment: ["Projector", "Whiteboard"] }),
  makeRoom({ id: "large", capacity: 60, equipment: ["Projector", "Computers", "Whiteboard"] }),
];

describe("filterByCapacity", () => {
  test("includes a room whose capacity exactly matches the requirement", () => {
    const result = filterByCapacity(rooms, 25);
    expect(result.map((r) => r.id)).toEqual(["medium", "large"]);
  });

  test("includes rooms with greater capacity than the requirement", () => {
    const result = filterByCapacity(rooms, 30);
    expect(result.map((r) => r.id)).toEqual(["large"]);
  });

  test("returns an empty list when no room has enough capacity", () => {
    const result = filterByCapacity(rooms, 100);
    expect(result).toEqual([]);
  });

  test("returns an empty list when the room list is empty", () => {
    expect(filterByCapacity([], 10)).toEqual([]);
  });

  test("returns an empty list for a NaN or infinite requirement", () => {
    expect(filterByCapacity(rooms, NaN)).toEqual([]);
    expect(filterByCapacity(rooms, Infinity)).toEqual([]);
  });

  test("treats a negative requirement as zero, so every room qualifies", () => {
    const result = filterByCapacity(rooms, -5);
    expect(result.map((r) => r.id)).toEqual(["small", "medium", "large"]);
  });
});

describe("filterByEquipment", () => {
  test("returns all rooms when no equipment is selected", () => {
    const result = filterByEquipment(rooms, []);
    expect(result.map((r) => r.id)).toEqual(["small", "medium", "large"]);
  });

  test("returns rooms containing all required equipment", () => {
    const result = filterByEquipment(rooms, ["Projector", "Whiteboard"]);
    expect(result.map((r) => r.id)).toEqual(["medium", "large"]);
  });

  test("excludes a room that is missing one required equipment item", () => {
    const result = filterByEquipment(rooms, ["Projector", "Computers"]);
    expect(result.map((r) => r.id)).toEqual(["large"]);
  });

  test("matches equipment case-insensitively", () => {
    const result = filterByEquipment(rooms, ["projector", "WHITEBOARD"]);
    expect(result.map((r) => r.id)).toEqual(["medium", "large"]);
  });
});

describe("room filter inputs", () => {
  test("leaves the original room array and its rooms unchanged", () => {
    const snapshot = JSON.parse(JSON.stringify(rooms));

    filterByCapacity(rooms, 20);
    filterByEquipment(rooms, ["Projector"]);

    expect(rooms).toEqual(snapshot);
  });

  test("applies capacity and equipment filters together", () => {
    const capacityMatches = filterByCapacity(rooms, 25);
    const result = filterByEquipment(capacityMatches, ["Computers"]);
    expect(result.map((r) => r.id)).toEqual(["large"]);
  });
});

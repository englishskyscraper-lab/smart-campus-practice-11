import type { Room } from "@/types";

export function filterByCapacity(
  rooms: readonly Room[],
  requiredCapacity: number
): Room[] {
  if (!Number.isFinite(requiredCapacity)) return [];
  const minimum = Math.max(0, requiredCapacity);
  return rooms.filter((room) => room.capacity >= minimum);
}

export function filterByEquipment(
  rooms: readonly Room[],
  requiredEquipment: readonly string[]
): Room[] {
  const required = requiredEquipment.map((item) => item.toLowerCase());
  if (required.length === 0) return [...rooms];

  return rooms.filter((room) => {
    const available = new Set(room.equipment.map((item) => item.toLowerCase()));
    return required.every((item) => available.has(item));
  });
}

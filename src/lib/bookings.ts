import type { Booking } from "@/types";

export function getRoomBookings(bookings: readonly Booking[], roomId: string): Booking[] {
  return bookings.filter((booking) => booking.roomId === roomId);
}

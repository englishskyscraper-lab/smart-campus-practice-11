import type { Booking } from "@/types";

export const bookings: Booking[] = [
  { id: "b1", roomId: "r1", start: 540, end: 600, title: "Calculus I", bookedBy: "Prof. Chen" },
  { id: "b2", roomId: "r1", start: 720, end: 780, title: "Physics Lab", bookedBy: "Prof. Patel" },
  { id: "b3", roomId: "r2", start: 600, end: 660, title: "Chemistry 101", bookedBy: "Prof. Lee" },
  { id: "b4", roomId: "r2", start: 900, end: 960, title: "Study Group", bookedBy: "Student Council" },
  { id: "b5", roomId: "r4", start: 480, end: 540, title: "Morning Lecture", bookedBy: "Prof. Garcia" },
  { id: "b6", roomId: "r4", start: 840, end: 900, title: "Seminar", bookedBy: "Prof. Kim" },
];

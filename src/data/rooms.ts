import type { Room } from "@/types";

export const rooms: Room[] = [
  { id: "r1", name: "Room A-101", building: "Engineering Block", capacity: 40, blocked: false, equipment: ["Projector", "Whiteboard", "Computers"] },
  { id: "r2", name: "Room B-204", building: "Science Block", capacity: 25, blocked: false, equipment: ["Projector", "Whiteboard"] },
  { id: "r3", name: "Lab C-310", building: "Tech Wing", capacity: 15, blocked: true, equipment: ["Computers", "Projector", "Laboratory Equipment"] },
  { id: "r4", name: "Room D-105", building: "Humanities Block", capacity: 60, blocked: false, equipment: ["Whiteboard", "Computers", "Video Conferencing"] },
];

export const ALL_EQUIPMENT = Array.from(new Set(rooms.flatMap((room) => room.equipment))).sort();

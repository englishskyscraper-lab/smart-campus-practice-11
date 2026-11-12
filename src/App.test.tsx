// @vitest-environment jsdom
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import App from "@/App";

afterEach(cleanup);

function setTime(label: number, value: string) {
  const inputs = document.querySelectorAll<HTMLInputElement>('input[type="time"]');
  fireEvent.change(inputs[label], { target: { value } });
}

describe("App availability UI", () => {
  test("U01 — filtering by 20 attendees and Whiteboard, then choosing Room B-204, shows it available for 11:00–12:00", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Number of Attendees"), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Whiteboard" }));
    fireEvent.click(screen.getByRole("button", { name: /Room B-204/ }));
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));

    const banner = screen.getByText("Available").closest("section")!;
    expect(within(banner).getByText(/Room is available from 11:00 to 12:00/)).toBeTruthy();
  });

  test("U02 — a blocked room shows an Unavailable result with the Room Blocked reason", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Number of Attendees"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Computers" }));
    fireEvent.click(screen.getByRole("button", { name: /Lab C-310/ }));
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));

    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(screen.getByText("Room Blocked")).toBeTruthy();
  });

  test("U03 — switching the selected room after a check updates the displayed result", () => {
    render(<App />);

    setTime(0, "12:00");
    setTime(1, "13:00");
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    fireEvent.click(screen.getByRole("button", { name: /Room A-101/ }));
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(screen.getByText("Time Overlap")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Room B-204/ }));
    expect(screen.getByText("Available")).toBeTruthy();
    expect(screen.queryByText("Unavailable")).toBeNull();
  });

  test("U04 — changing a requirement clears the previous result until the user checks again", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    expect(screen.getByText("Available")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Number of Attendees"), { target: { value: "50" } });
    expect(screen.queryByText("Available")).toBeNull();
    expect(screen.queryByText("Unavailable")).toBeNull();
  });
});

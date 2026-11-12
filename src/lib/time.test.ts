import { describe, expect, test } from "vitest";
import { formatTime, parseTime } from "./time";

describe("formatTime", () => {
  test("formats midnight as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  test("formats a typical afternoon-style value", () => {
    expect(formatTime(630)).toBe("10:30");
  });

  test("pads single-digit hours and minutes", () => {
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(65)).toBe("01:05");
  });

  test("formats the last whole minute of the day", () => {
    expect(formatTime(1439)).toBe("23:59");
  });

  test("wraps 1440 (end of day) to 00:00", () => {
    expect(formatTime(1440)).toBe("00:00");
  });

  test("wraps minutes beyond one day back into the 24-hour cycle", () => {
    expect(formatTime(1441)).toBe("00:01");
    expect(formatTime(1440 + 630)).toBe("10:30");
  });

  test("formats the hour 59 boundary before the next hour", () => {
    expect(formatTime(119)).toBe("01:59");
  });

  test("does not round fractional minutes", () => {
    expect(formatTime(90.5)).toBe("01:30.5");
  });

  test("returns NaN text for NaN input", () => {
    expect(formatTime(NaN)).toBe("NaN:NaN");
  });

  test("returns a sign-prefixed string for negative input", () => {
    expect(formatTime(-30)).toBe("-1:-30");
  });
});

describe("parseTime", () => {
  test("parses midnight as 0", () => {
    expect(parseTime("00:00")).toBe(0);
  });

  test("parses a typical value", () => {
    expect(parseTime("10:30")).toBe(630);
  });

  test("parses the last valid minute of the day", () => {
    expect(parseTime("23:59")).toBe(1439);
  });

  test("accepts a single-digit hour", () => {
    expect(parseTime("9:05")).toBe(545);
  });

  test("accepts a zero-padded single-digit hour", () => {
    expect(parseTime("09:05")).toBe(545);
  });

  test("rejects hour 24 even though formatTime(1440) is 00:00", () => {
    expect(parseTime("24:00")).toBeNaN();
  });

  test("rejects minutes of 60", () => {
    expect(parseTime("23:60")).toBeNaN();
  });

  test("rejects a single-digit minute value", () => {
    expect(parseTime("12:5")).toBeNaN();
  });

  test("rejects a three-digit hour", () => {
    expect(parseTime("100:00")).toBeNaN();
  });

  test("rejects a negative hour", () => {
    expect(parseTime("-1:00")).toBeNaN();
  });

  test("rejects an empty string", () => {
    expect(parseTime("")).toBeNaN();
  });

  test("rejects leading or trailing whitespace", () => {
    expect(parseTime(" 10:30")).toBeNaN();
    expect(parseTime("10:30 ")).toBeNaN();
  });

  test("rejects a separator other than a colon", () => {
    expect(parseTime("10-30")).toBeNaN();
  });

  test("rejects values with extra segments", () => {
    expect(parseTime("1:2:3")).toBeNaN();
  });

  test("rejects non-numeric text", () => {
    expect(parseTime("ab:cd")).toBeNaN();
  });
});

describe("formatTime and parseTime together", () => {
  test("parseTime reverses formatTime for every whole minute of the day", () => {
    for (let minutes = 0; minutes < 1440; minutes++) {
      expect(parseTime(formatTime(minutes))).toBe(minutes);
    }
  });
});

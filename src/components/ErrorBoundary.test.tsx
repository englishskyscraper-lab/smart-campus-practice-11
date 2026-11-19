// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ErrorBoundary from "@/components/ErrorBoundary";

afterEach(cleanup);

function ThrowingChild(): never {
  throw new Error("test crash");
}

describe("ErrorBoundary", () => {
  test("renders the fallback UI with a Reload button when a child throws", () => {
    // React logs the caught error to the console; silence it for the test run.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Reload" })
    ).toBeTruthy();

    consoleError.mockRestore();
  });

  test("renders its children unchanged when no error occurs", () => {
    render(
      <ErrorBoundary>
        <p>normal content</p>
      </ErrorBoundary>
    );

    expect(screen.getByText("normal content")).toBeTruthy();
  });
});

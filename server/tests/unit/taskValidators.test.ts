import { validateTaskInput } from "../../src/validators/taskValidators";

describe("validateTaskInput (create, partial = false)", () => {
  it("accepts a fully valid payload", () => {
    const result = validateTaskInput({
      title: "Write report",
      dateTime: "2026-01-15T09:00:00.000Z",
      deadline: "2026-01-15T17:00:00.000Z",
      priority: "HIGH",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects a missing title", () => {
    const result = validateTaskInput({
      dateTime: "2026-01-15T09:00:00.000Z",
      deadline: "2026-01-15T17:00:00.000Z",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /title/i.test(e))).toBe(true);
  });

  it("rejects a deadline before the task's dateTime", () => {
    const result = validateTaskInput({
      title: "Task",
      dateTime: "2026-01-15T17:00:00.000Z",
      deadline: "2026-01-15T09:00:00.000Z",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /deadline/i.test(e))).toBe(true);
  });

  it("rejects an invalid date string", () => {
    const result = validateTaskInput({
      title: "Task",
      dateTime: "not-a-date",
      deadline: "2026-01-15T09:00:00.000Z",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects an invalid priority value", () => {
    const result = validateTaskInput({
      title: "Task",
      dateTime: "2026-01-15T09:00:00.000Z",
      deadline: "2026-01-15T17:00:00.000Z",
      priority: "URGENT",
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateTaskInput (partial update, partial = true)", () => {
  it("accepts updating only the status", () => {
    const result = validateTaskInput({ status: "COMPLETED" }, true);
    expect(result.valid).toBe(true);
  });

  it("still validates deadline-vs-dateTime when both are supplied together", () => {
    const result = validateTaskInput(
      { dateTime: "2026-01-15T17:00:00.000Z", deadline: "2026-01-15T09:00:00.000Z" },
      true
    );
    expect(result.valid).toBe(false);
  });

  it("does not require title on a partial update", () => {
    const result = validateTaskInput({ priority: "LOW" }, true);
    expect(result.valid).toBe(true);
  });
});

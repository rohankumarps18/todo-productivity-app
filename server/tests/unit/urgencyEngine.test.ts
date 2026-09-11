import { calculateTaskUrgency, sortTasksByUrgency, type UrgencyInput } from "../../src/services/urgencyEngine";

const NOW = new Date("2026-01-15T12:00:00.000Z");

function hoursFromNow(hours: number): Date {
  return new Date(NOW.getTime() + hours * 60 * 60 * 1000);
}

describe("calculateTaskUrgency", () => {
  it("labels a completed task as LOW URGENCY regardless of deadline", () => {
    const result = calculateTaskUrgency(
      { priority: "HIGH", deadline: hoursFromNow(-100), status: "COMPLETED" },
      NOW
    );
    expect(result.label).toBe("LOW URGENCY");
    expect(result.score).toBe(0);
  });

  it("labels a task past its deadline as OVERDUE with the highest scores", () => {
    const result = calculateTaskUrgency({ priority: "LOW", deadline: hoursFromNow(-2), status: "PENDING" }, NOW);
    expect(result.label).toBe("OVERDUE");
    expect(result.reason).toMatch(/passed/i);
  });

  it("labels a HIGH priority task due in a few hours as CRITICAL", () => {
    const result = calculateTaskUrgency({ priority: "HIGH", deadline: hoursFromNow(2), status: "PENDING" }, NOW);
    expect(result.label).toBe("CRITICAL");
  });

  it("labels a LOW priority task due far in the future as LOW URGENCY", () => {
    const result = calculateTaskUrgency({ priority: "LOW", deadline: hoursFromNow(24 * 10), status: "PENDING" }, NOW);
    expect(result.label).toBe("LOW URGENCY");
  });

  it("labels a task due within 24h (but not critical) as DUE SOON", () => {
    const result = calculateTaskUrgency({ priority: "MEDIUM", deadline: hoursFromNow(10), status: "PENDING" }, NOW);
    expect(result.label).toBe("DUE SOON");
  });

  it("labels a task a couple of days out as ON TRACK", () => {
    const result = calculateTaskUrgency({ priority: "MEDIUM", deadline: hoursFromNow(48), status: "PENDING" }, NOW);
    expect(result.label).toBe("ON TRACK");
  });

  it("is deterministic: identical inputs always produce identical output", () => {
    const input: UrgencyInput = { priority: "MEDIUM", deadline: hoursFromNow(5), status: "PENDING" };
    const first = calculateTaskUrgency(input, NOW);
    const second = calculateTaskUrgency(input, NOW);
    expect(second).toEqual(first);
  });

  it("gives a medium-priority task due very soon a higher score than a high-priority task due next week", () => {
    const soonMedium = calculateTaskUrgency({ priority: "MEDIUM", deadline: hoursFromNow(0.5), status: "PENDING" }, NOW);
    const farHigh = calculateTaskUrgency({ priority: "HIGH", deadline: hoursFromNow(24 * 7), status: "PENDING" }, NOW);
    expect(soonMedium.score).toBeGreaterThan(farHigh.score);
  });
});

describe("sortTasksByUrgency", () => {
  function task(id: string, priority: UrgencyInput["priority"], deadlineHours: number, status: UrgencyInput["status"] = "PENDING", createdAtHoursAgo = 0) {
    return {
      id,
      priority,
      deadline: hoursFromNow(deadlineHours),
      status,
      createdAt: hoursFromNow(-createdAtHoursAgo),
    };
  }

  it("places overdue tasks before all active tasks", () => {
    const tasks = [task("a", "LOW", 100), task("b", "HIGH", -1)];
    const sorted = sortTasksByUrgency(tasks, NOW);
    expect(sorted[0].id).toBe("b");
  });

  it("always sorts completed tasks after every active task", () => {
    const tasks = [task("completed-critical", "HIGH", -50, "COMPLETED"), task("active-low", "LOW", 200)];
    const sorted = sortTasksByUrgency(tasks, NOW);
    expect(sorted.map((t) => t.id)).toEqual(["active-low", "completed-critical"]);
  });

  it("breaks ties deterministically by createdAt ascending", () => {
    const tasks = [
      task("newer", "MEDIUM", 50, "PENDING", 1),
      task("older", "MEDIUM", 50, "PENDING", 5),
    ];
    const sorted = sortTasksByUrgency(tasks, NOW);
    expect(sorted.map((t) => t.id)).toEqual(["older", "newer"]);
  });

  it("does not mutate the input array", () => {
    const tasks = [task("a", "LOW", 100), task("b", "HIGH", -1)];
    const copy = [...tasks];
    sortTasksByUrgency(tasks, NOW);
    expect(tasks).toEqual(copy);
  });
});

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Human "time remaining" string, e.g. "45m left", "2h 10m left",
 * "3d left", or "1h 20m overdue". Deliberately never says "0" - anything
 * under a minute reads as "due now".
 */
export function formatTimeRemaining(deadlineIso: string, now: Date = new Date()): string {
  const deadline = new Date(deadlineIso);
  const diffMs = deadline.getTime() - now.getTime();
  const overdue = diffMs < 0;
  const abs = Math.abs(diffMs);

  const minutes = Math.floor(abs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let core: string;
  if (minutes < 1) {
    core = "due now";
    return core;
  } else if (days >= 1) {
    core = `${days}d${hours % 24 > 0 ? ` ${hours % 24}h` : ""}`;
  } else if (hours >= 1) {
    core = `${hours}h${minutes % 60 > 0 ? ` ${minutes % 60}m` : ""}`;
  } else {
    core = `${minutes}m`;
  }

  return overdue ? `${core} overdue` : `${core} left`;
}

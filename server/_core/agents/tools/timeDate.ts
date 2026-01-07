/**
 * Time & Date Tool
 * Provides current temporal information to agents.
 */

export interface DateTimeInfo {
  iso: string;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;
}

/**
 * Get the current date and time.
 */
export async function getCurrentDateTime(): Promise<DateTimeInfo> {
  const now = new Date();
  return {
    iso: now.toISOString(),
    date: now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    timestamp: now.getTime(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/**
 * Get the current date.
 */
export async function getCurrentDate(): Promise<string> {
  const now = new Date();
  return now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Get the current time.
 */
export async function getCurrentTime(): Promise<string> {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

/**
 * Get the current Unix timestamp.
 */
export async function getTimestamp(): Promise<number> {
  return Date.now();
}

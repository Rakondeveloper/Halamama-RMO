/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SLA Configuration Module                                                     ║
 * ║                                                                              ║
 * ║  Centralized, configurable SLA parameters for the MIS Benchmarks engine.     ║
 * ║  Operations staff can modify benchmarks here without touching UI code.        ║
 * ║                                                                              ║
 * ║  Supports:                                                                    ║
 * ║    • Per-SLA-type benchmark targets                                           ║
 * ║    • Operational hour windows                                                 ║
 * ║    • Overnight freeze periods (general & picking-specific)                    ║
 * ║    • Dispatch windows (morning & second shift)                                ║
 * ║    • Future: warehouse-specific overrides, holiday calendars                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type SlaType = "picking" | "packing" | "delivery";

/** A time-of-day expressed as hours and minutes (24h format). */
export interface TimeOfDay {
  hour: number;   // 0–23
  minute: number; // 0–59
}

/** A window defined by a start and end time-of-day. */
export interface TimeWindow {
  start: TimeOfDay;
  end: TimeOfDay;
}

/** Complete SLA configuration for one warehouse or the global default. */
export interface SlaConfig {
  /** SLA benchmark targets in minutes per type. */
  benchmarks: Record<SlaType, number>;

  /** Warehouse operational hours. */
  operationalHours: {
    /** When active operations (picking/packing) begin. Default: 06:00. */
    start: TimeOfDay;
    /** When active operations conclude (next day if < start). Default: 01:00. */
    end: TimeOfDay;
  };

  /** General business freeze window — no SLA tracking during this period. */
  businessFreeze: TimeWindow;

  /**
   * Picking-specific freeze window.
   * Picking tasks left untouched during this window do not accrue SLA time.
   * Typically wider than the general freeze (starts at midnight).
   */
  pickingFreeze: TimeWindow;

  /** Dispatch windows for driver departures. */
  dispatch: {
    /** Morning dispatch start time. Default: 09:00. */
    morningStart: TimeOfDay;
    /** Second-shift dispatch window. Default: 13:00–16:00. */
    secondShift: TimeWindow;
  };
}

// ─── Default Configuration ───────────────────────────────────────────────────

export const DEFAULT_SLA_CONFIG: SlaConfig = {
  benchmarks: {
    picking: 10,    // 10 minutes
    packing: 10,    // 10 minutes
    delivery: 210,  // 3.5 hours (210 minutes)
  },

  operationalHours: {
    start: { hour: 6, minute: 0 },   // 06:00 AM
    end: { hour: 1, minute: 0 },     // 01:00 AM (next day)
  },

  businessFreeze: {
    start: { hour: 1, minute: 0 },   // 01:00 AM
    end: { hour: 6, minute: 0 },     // 06:00 AM
  },

  pickingFreeze: {
    start: { hour: 0, minute: 0 },   // 12:00 AM (midnight)
    end: { hour: 6, minute: 0 },     // 06:00 AM
  },

  dispatch: {
    morningStart: { hour: 9, minute: 0 },  // 09:00 AM
    secondShift: {
      start: { hour: 13, minute: 0 },      // 01:00 PM
      end: { hour: 16, minute: 0 },         // 04:00 PM
    },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a TimeOfDay to total minutes from midnight. */
export function timeOfDayToMinutes(t: TimeOfDay): number {
  return t.hour * 60 + t.minute;
}

/** Get the benchmark target (in minutes) for a given SLA type. */
export function getBenchmarkMinutes(
  slaType: SlaType,
  config: SlaConfig = DEFAULT_SLA_CONFIG,
): number {
  return config.benchmarks[slaType];
}

/** Format a duration in minutes to a human-readable string. */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0 min";
  if (minutes < 60) return `${Math.round(minutes * 10) / 10} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Format a duration in minutes to a compact string (e.g., "7m", "2h 15m"). */
export function formatDurationCompact(minutes: number): string {
  if (minutes < 0) return "0m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

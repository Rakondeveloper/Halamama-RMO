/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Business Time Engine                                                         ║
 * ║                                                                              ║
 * ║  Calculates elapsed BUSINESS time between two timestamps, excluding:         ║
 * ║    • General freeze window  (01:00 AM → 06:00 AM)                            ║
 * ║    • Picking freeze window  (12:00 AM → 06:00 AM)                            ║
 * ║    • Any non-operational hours                                                ║
 * ║                                                                              ║
 * ║  Supports multi-day orders and cross-midnight calculations.                  ║
 * ║  This is the SINGLE SOURCE OF TRUTH for all MIS duration KPIs.               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  type SlaConfig,
  type SlaType,
  type TimeOfDay,
  DEFAULT_SLA_CONFIG,
  timeOfDayToMinutes,
} from "./sla-config";
import type { BusinessDurationResult, TimeSpan } from "./mis-types";

// ─── Core Engine ─────────────────────────────────────────────────────────────

/**
 * Calculate business-hours-adjusted elapsed time between two timestamps.
 *
 * This is the primary API of the Business Time Engine.
 *
 * @param startTime  - When the SLA clock started
 * @param endTime    - When the SLA clock stopped
 * @param slaType    - Type of SLA (affects which freeze windows apply)
 * @param config     - SLA configuration (defaults to global config)
 * @returns          - Duration breakdown with active/frozen spans
 */
export function calculateBusinessDuration(
  startTime: Date,
  endTime: Date,
  slaType: SlaType,
  config: SlaConfig = DEFAULT_SLA_CONFIG,
): BusinessDurationResult {
  // Edge cases
  if (endTime <= startTime) {
    return {
      rawDurationMinutes: 0,
      businessDurationMinutes: 0,
      frozenMinutes: 0,
      spans: [],
    };
  }

  const rawMs = endTime.getTime() - startTime.getTime();
  const rawDurationMinutes = rawMs / (1000 * 60);

  // Walk through the time range minute-by-minute in 1-minute increments
  // For efficiency, we detect freeze boundaries and skip ahead
  const spans: TimeSpan[] = [];
  let businessMinutes = 0;
  let frozenMinutes = 0;

  let cursor = new Date(startTime);
  let currentSpanStart = new Date(cursor);
  let currentSpanType = isTimeFrozen(cursor, slaType, config) ? "frozen" as const : "active" as const;
  let currentSpanReason = currentSpanType === "frozen"
    ? getFreezeReason(cursor, slaType, config)
    : undefined;

  while (cursor < endTime) {
    // Determine the next boundary (freeze start/end or the end time)
    const nextBoundary = getNextFreezeTransition(cursor, endTime, slaType, config);
    const segmentEnd = nextBoundary < endTime ? nextBoundary : new Date(endTime);
    const segmentMinutes = (segmentEnd.getTime() - cursor.getTime()) / (1000 * 60);

    if (currentSpanType === "active") {
      businessMinutes += segmentMinutes;
    } else {
      frozenMinutes += segmentMinutes;
    }

    // Check if the type changes at the boundary
    const nextType = segmentEnd < endTime
      ? (isTimeFrozen(segmentEnd, slaType, config) ? "frozen" as const : "active" as const)
      : currentSpanType;

    if (nextType !== currentSpanType || segmentEnd >= endTime) {
      // Close current span
      spans.push({
        start: new Date(currentSpanStart),
        end: new Date(segmentEnd),
        type: currentSpanType,
        reason: currentSpanReason,
      });

      if (segmentEnd < endTime) {
        currentSpanStart = new Date(segmentEnd);
        currentSpanType = nextType;
        currentSpanReason = nextType === "frozen"
          ? getFreezeReason(segmentEnd, slaType, config)
          : undefined;
      }
    }

    cursor = segmentEnd;

    // Safety: prevent infinite loops
    if (cursor.getTime() === startTime.getTime() && segmentMinutes === 0) break;
  }

  return {
    rawDurationMinutes: Math.round(rawDurationMinutes * 100) / 100,
    businessDurationMinutes: Math.round(businessMinutes * 100) / 100,
    frozenMinutes: Math.round(frozenMinutes * 100) / 100,
    spans,
  };
}

// ─── Freeze Detection ────────────────────────────────────────────────────────

/**
 * Check if a specific moment in time falls within a frozen window.
 */
function isTimeFrozen(
  time: Date,
  slaType: SlaType,
  config: SlaConfig,
): boolean {
  const minuteOfDay = time.getHours() * 60 + time.getMinutes();

  // General business freeze: 01:00 → 06:00
  const freezeStart = timeOfDayToMinutes(config.businessFreeze.start);
  const freezeEnd = timeOfDayToMinutes(config.businessFreeze.end);

  if (isInTimeRange(minuteOfDay, freezeStart, freezeEnd)) {
    return true;
  }

  // Picking-specific freeze: 00:00 → 06:00 (wider window)
  if (slaType === "picking") {
    const pickFreezeStart = timeOfDayToMinutes(config.pickingFreeze.start);
    const pickFreezeEnd = timeOfDayToMinutes(config.pickingFreeze.end);
    if (isInTimeRange(minuteOfDay, pickFreezeStart, pickFreezeEnd)) {
      return true;
    }
  }

  return false;
}

/**
 * Get a human-readable reason for why a moment is frozen.
 */
function getFreezeReason(
  time: Date,
  slaType: SlaType,
  config: SlaConfig,
): string {
  const minuteOfDay = time.getHours() * 60 + time.getMinutes();

  if (slaType === "picking") {
    const pickFreezeStart = timeOfDayToMinutes(config.pickingFreeze.start);
    const pickFreezeEnd = timeOfDayToMinutes(config.pickingFreeze.end);
    if (isInTimeRange(minuteOfDay, pickFreezeStart, pickFreezeEnd)) {
      return "Picking freeze (00:00–06:00)";
    }
  }

  const freezeStart = timeOfDayToMinutes(config.businessFreeze.start);
  const freezeEnd = timeOfDayToMinutes(config.businessFreeze.end);
  if (isInTimeRange(minuteOfDay, freezeStart, freezeEnd)) {
    return "Business freeze (01:00–06:00)";
  }

  return "Unknown freeze";
}

/**
 * Check if a minute-of-day falls within a range.
 * Handles ranges that do NOT cross midnight (e.g. 01:00 → 06:00).
 * For ranges crossing midnight (e.g. 22:00 → 06:00), treat as two segments.
 */
function isInTimeRange(
  minuteOfDay: number,
  rangeStart: number,
  rangeEnd: number,
): boolean {
  if (rangeStart <= rangeEnd) {
    // Normal range (e.g. 60 → 360 = 01:00 → 06:00)
    return minuteOfDay >= rangeStart && minuteOfDay < rangeEnd;
  } else {
    // Cross-midnight range (e.g. 1320 → 360 = 22:00 → 06:00)
    return minuteOfDay >= rangeStart || minuteOfDay < rangeEnd;
  }
}

// ─── Boundary Detection ─────────────────────────────────────────────────────

/**
 * Find the next freeze transition (start or end of a frozen period)
 * between `cursor` and `limit`.
 *
 * Returns `limit` if no transition occurs in the range.
 */
function getNextFreezeTransition(
  cursor: Date,
  limit: Date,
  slaType: SlaType,
  config: SlaConfig,
): Date {
  const currentlyFrozen = isTimeFrozen(cursor, slaType, config);

  // Collect all potential transition times (freeze boundaries) for this day and the next
  const transitions: Date[] = [];

  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    const baseDate = new Date(cursor);
    baseDate.setDate(baseDate.getDate() + dayOffset);

    // General freeze boundaries
    transitions.push(
      makeDateTime(baseDate, config.businessFreeze.start),
      makeDateTime(baseDate, config.businessFreeze.end),
    );

    // Picking freeze boundaries (if applicable)
    if (slaType === "picking") {
      transitions.push(
        makeDateTime(baseDate, config.pickingFreeze.start),
        makeDateTime(baseDate, config.pickingFreeze.end),
      );
    }
  }

  // Sort transitions and find the first one after cursor
  // where the frozen state actually changes
  transitions.sort((a, b) => a.getTime() - b.getTime());

  for (const t of transitions) {
    if (t.getTime() <= cursor.getTime()) continue;
    if (t.getTime() > limit.getTime()) break;

    // Check if the state changes at this boundary
    const afterFrozen = isTimeFrozen(t, slaType, config);
    if (afterFrozen !== currentlyFrozen) {
      return t;
    }
  }

  return limit;
}

/**
 * Create a Date with a specific time-of-day on a given base date.
 */
function makeDateTime(baseDate: Date, timeOfDay: TimeOfDay): Date {
  const d = new Date(baseDate);
  d.setHours(timeOfDay.hour, timeOfDay.minute, 0, 0);
  return d;
}

// ─── Utility Exports ─────────────────────────────────────────────────────────

/**
 * Parse an order's date + time strings into a Date object.
 * Handles formats like "Jun 27" + "10:55" and "2026-06-27" + "10:55".
 */
export function parseOrderDateTime(dateStr: string, timeStr: string): Date {
  // Try ISO date first (e.g., "2026-06-27")
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(Number(year), Number(month) - 1, Number(day), hours, minutes, 0, 0);
  }

  // Try short format (e.g., "Jun 27")
  const shortMatch = dateStr.match(/^([A-Za-z]+)\s+(\d+)$/);
  if (shortMatch) {
    const [, monthName, day] = shortMatch;
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const monthIndex = months[monthName] ?? 0;
    const year = new Date().getFullYear();
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(year, monthIndex, Number(day), hours, minutes, 0, 0);
  }

  // Fallback: try Date constructor
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Add minutes to a date + time pair and return a new Date.
 */
export function addMinutesToDateTime(
  dateStr: string,
  timeStr: string,
  minutes: number,
): Date {
  const base = parseOrderDateTime(dateStr, timeStr);
  return new Date(base.getTime() + minutes * 60 * 1000);
}

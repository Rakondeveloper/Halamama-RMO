/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SLA Evaluation Engine                                                        ║
 * ║                                                                              ║
 * ║  Converts raw timestamp pairs into benchmark pass/fail evaluations.          ║
 * ║  Uses the Business Time Engine for freeze-aware duration calculations.        ║
 * ║                                                                              ║
 * ║  Every order receives:                                                        ║
 * ║    • Actual Duration (wall-clock)                                             ║
 * ║    • Business Duration (freeze-adjusted)                                      ║
 * ║    • Benchmark Target                                                         ║
 * ║    • SLA Status (PASS / FAIL)                                                 ║
 * ║    • Delay Minutes                                                            ║
 * ║    • Overshoot Factor (e.g. 7.94x)                                            ║
 * ║    • Overshoot Percent (e.g. 694%)                                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { calculateBusinessDuration } from "./business-time";
import {
  type SlaConfig,
  type SlaType,
  DEFAULT_SLA_CONFIG,
  getBenchmarkMinutes,
} from "./sla-config";
import type { SlaEvaluation, SlaSummary } from "./mis-types";

// ─── Single Order Evaluation ─────────────────────────────────────────────────

/**
 * Evaluate a single order's SLA performance for a given SLA type.
 *
 * @param startTime     When the SLA clock started
 * @param endTime       When the SLA clock stopped
 * @param slaType       Which SLA to evaluate against
 * @param config        SLA configuration
 * @returns             Complete SLA evaluation result
 */
export function evaluateSla(
  startTime: Date,
  endTime: Date,
  slaType: SlaType,
  config: SlaConfig = DEFAULT_SLA_CONFIG,
): SlaEvaluation {
  const duration = calculateBusinessDuration(startTime, endTime, slaType, config);
  const benchmarkMinutes = getBenchmarkMinutes(slaType, config);
  const businessMinutes = duration.businessDurationMinutes;

  const passed = businessMinutes <= benchmarkMinutes;
  const delayMinutes = passed ? 0 : Math.round((businessMinutes - benchmarkMinutes) * 100) / 100;
  const overshootFactor = benchmarkMinutes > 0
    ? Math.round((businessMinutes / benchmarkMinutes) * 100) / 100
    : 0;
  const overshootPercent = benchmarkMinutes > 0
    ? Math.round(((businessMinutes - benchmarkMinutes) / benchmarkMinutes) * 10000) / 100
    : 0;

  return {
    actualDurationMinutes: duration.rawDurationMinutes,
    businessDurationMinutes: businessMinutes,
    benchmarkMinutes,
    status: passed ? "PASS" : "FAIL",
    delayMinutes,
    overshootFactor,
    overshootPercent: Math.max(0, overshootPercent),
    startTime,
    endTime,
  };
}

// ─── Aggregate Summary ───────────────────────────────────────────────────────

/**
 * Aggregate multiple SLA evaluations into a summary.
 *
 * @param evaluations   Array of individual SLA evaluations
 * @param slaType       The SLA type being summarized
 * @param config        SLA configuration
 * @param prevPeriodMetPercent  Optional: met% from previous period (for trend)
 * @returns             Aggregated summary
 */
export function summarizeSla(
  evaluations: SlaEvaluation[],
  slaType: SlaType,
  config: SlaConfig = DEFAULT_SLA_CONFIG,
  prevPeriodMetPercent?: number,
): SlaSummary {
  const total = evaluations.length;

  if (total === 0) {
    return {
      totalOrders: 0,
      metCount: 0,
      missedCount: 0,
      metPercent: 0,
      avgDurationMinutes: 0,
      benchmarkMinutes: getBenchmarkMinutes(slaType, config),
      trendPercent: null,
    };
  }

  const metCount = evaluations.filter((e) => e.status === "PASS").length;
  const missedCount = total - metCount;
  const metPercent = Math.round((metCount / total) * 1000) / 10; // one decimal place
  const avgDuration =
    Math.round(
      (evaluations.reduce((sum, e) => sum + e.businessDurationMinutes, 0) / total) * 10,
    ) / 10;

  const trendPercent =
    prevPeriodMetPercent != null
      ? Math.round((metPercent - prevPeriodMetPercent) * 10) / 10
      : null;

  return {
    totalOrders: total,
    metCount,
    missedCount,
    metPercent,
    avgDurationMinutes: avgDuration,
    benchmarkMinutes: getBenchmarkMinutes(slaType, config),
    trendPercent,
  };
}

/**
 * Format an overshoot factor for display (e.g. 7.94 → "7.9x").
 */
export function formatOvershoot(factor: number): string {
  if (factor <= 1) return "—";
  return `${factor.toFixed(1)}x`;
}

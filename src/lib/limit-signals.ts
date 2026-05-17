import type { MetricLine, PluginDisplayState } from "@/lib/plugin-types"

export type LimitStatus = "safe" | "watch" | "near-limit" | "capped"

export type LimitStatusInfo = {
  status: LimitStatus
  label: string
  toneClass: string
}

export type LimitSignal = LimitStatusInfo & {
  providerId: string
  providerName: string
  metricLabel: string
  used: number
  limit: number
  fraction: number
}

function isProgressLine(line: MetricLine): line is Extract<MetricLine, { type: "progress" }> {
  return line.type === "progress"
}

export function getLimitStatusFromFraction(fraction: number): LimitStatusInfo | null {
  if (!Number.isFinite(fraction)) return null

  if (fraction >= 1) {
    return {
      status: "capped",
      label: "Capped",
      toneClass: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
    }
  }

  if (fraction >= 0.9) {
    return {
      status: "near-limit",
      label: "Near Limit",
      toneClass: "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    }
  }

  if (fraction >= 0.7) {
    return {
      status: "watch",
      label: "Watch",
      toneClass: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    }
  }

  return {
    status: "safe",
    label: "Safe",
    toneClass: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400",
  }
}

export function getLimitStatus(used: number, limit: number): LimitStatusInfo | null {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) {
    return null
  }

  return getLimitStatusFromFraction(Math.max(0, used / limit))
}

export function collectLimitSignals(plugins: PluginDisplayState[]): LimitSignal[] {
  return plugins
    .filter((plugin) => !plugin.loading && !plugin.error)
    .flatMap((plugin) => {
      const lines = plugin.data?.lines ?? []
      return lines.filter(isProgressLine).flatMap((line) => {
        if (!Number.isFinite(line.used) || !Number.isFinite(line.limit) || line.limit <= 0) {
          return []
        }

        const fraction = Math.max(0, line.used / line.limit)
        const status = getLimitStatusFromFraction(fraction)
        if (!status) return []

        return [{
          ...status,
          providerId: plugin.meta.id,
          providerName: plugin.meta.name,
          metricLabel: line.label,
          used: line.used,
          limit: line.limit,
          fraction,
        }]
      })
    })
}

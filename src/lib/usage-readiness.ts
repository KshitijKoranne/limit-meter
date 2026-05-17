import type { MetricLine, PluginDisplayState } from "@/lib/plugin-types"

export type UsageReadinessLevel = "clear" | "watch" | "tight" | "blocked" | "waiting"

export type UsageReadiness = {
  level: UsageReadinessLevel
  answer: string
  detail: string
  toneClass: string
}

function isProgressLine(line: MetricLine): line is Extract<MetricLine, { type: "progress" }> {
  return line.type === "progress"
}

export function getUsageReadiness(plugins: PluginDisplayState[]): UsageReadiness {
  const progressLines = plugins
    .filter((plugin) => !plugin.loading && !plugin.error)
    .flatMap((plugin) => plugin.data?.lines ?? [])
    .filter(isProgressLine)
    .filter((line) => Number.isFinite(line.used) && Number.isFinite(line.limit) && line.limit > 0)

  if (progressLines.length === 0) {
    return {
      level: "waiting",
      answer: "Waiting",
      detail: "No live limits yet",
      toneClass: "border-border bg-muted/50 text-muted-foreground",
    }
  }

  const counts = progressLines.reduce(
    (acc, line) => {
      const fraction = Math.max(0, line.used / line.limit)
      if (fraction >= 1) acc.blocked += 1
      else if (fraction >= 0.9) acc.tight += 1
      else if (fraction >= 0.7) acc.watch += 1
      else acc.clear += 1
      return acc
    },
    { clear: 0, watch: 0, tight: 0, blocked: 0 }
  )

  if (counts.blocked > 0) {
    return {
      level: "blocked",
      answer: "Blocked",
      detail: `${counts.blocked} limit${counts.blocked === 1 ? "" : "s"} capped`,
      toneClass: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    }
  }

  if (counts.tight > 0) {
    return {
      level: "tight",
      answer: "Tight",
      detail: `${counts.tight} limit${counts.tight === 1 ? "" : "s"} near cap`,
      toneClass: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    }
  }

  if (counts.watch > 0) {
    return {
      level: "watch",
      answer: "Watch",
      detail: `${counts.watch} limit${counts.watch === 1 ? "" : "s"} warming up`,
      toneClass: "border-yellow-500/30 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300",
    }
  }

  return {
    level: "clear",
    answer: "Clear",
    detail: `${counts.clear} limit${counts.clear === 1 ? "" : "s"} healthy`,
    toneClass: "border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-300",
  }
}

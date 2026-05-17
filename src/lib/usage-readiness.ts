import type { PluginDisplayState } from "@/lib/plugin-types"
import { collectLimitSignals, type LimitSignal } from "@/lib/limit-signals"

export type UsageReadinessLevel = "clear" | "watch" | "tight" | "blocked" | "waiting"

export type UsageReadiness = {
  level: UsageReadinessLevel
  answer: string
  detail: string
  advice: string
  toneClass: string
}

function sortByFractionAsc(a: LimitSignal, b: LimitSignal) {
  return a.fraction - b.fraction
}

function sortByFractionDesc(a: LimitSignal, b: LimitSignal) {
  return b.fraction - a.fraction
}

function bestHeadroom(signals: LimitSignal[]): LimitSignal | null {
  return [...signals].sort(sortByFractionAsc)[0] ?? null
}

function mostConstrained(signals: LimitSignal[]): LimitSignal | null {
  return [...signals].sort(sortByFractionDesc)[0] ?? null
}

export function getUsageReadiness(plugins: PluginDisplayState[]): UsageReadiness {
  const signals = collectLimitSignals(plugins)

  if (signals.length === 0) {
    return {
      level: "waiting",
      answer: "Waiting",
      detail: "No live limits yet",
      advice: "Refresh providers to get a usable recommendation",
      toneClass: "border-border bg-muted/50 text-muted-foreground",
    }
  }

  const counts = signals.reduce(
    (acc, signal) => {
      if (signal.status === "capped") acc.blocked += 1
      else if (signal.status === "near-limit") acc.tight += 1
      else if (signal.status === "watch") acc.watch += 1
      else acc.clear += 1
      return acc
    },
    { clear: 0, watch: 0, tight: 0, blocked: 0 }
  )
  const best = bestHeadroom(signals)
  const worst = mostConstrained(signals)

  if (counts.blocked > 0) {
    return {
      level: "blocked",
      answer: "Blocked",
      detail: `${counts.blocked} limit${counts.blocked === 1 ? "" : "s"} capped`,
      advice: worst ? `Avoid ${worst.providerName} ${worst.metricLabel} for now` : "Switch providers or wait for reset",
      toneClass: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    }
  }

  if (counts.tight > 0) {
    return {
      level: "tight",
      answer: "Tight",
      detail: `${counts.tight} limit${counts.tight === 1 ? "" : "s"} near cap`,
      advice: best ? `Best headroom: ${best.providerName}` : "Use the provider with the most remaining room",
      toneClass: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    }
  }

  if (counts.watch > 0) {
    return {
      level: "watch",
      answer: "Watch",
      detail: `${counts.watch} limit${counts.watch === 1 ? "" : "s"} warming up`,
      advice: worst ? `Monitor ${worst.providerName} ${worst.metricLabel}` : "Keep going, but watch usage",
      toneClass: "border-yellow-500/30 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300",
    }
  }

  return {
    level: "clear",
    answer: "Clear",
    detail: `${counts.clear} limit${counts.clear === 1 ? "" : "s"} healthy`,
    advice: best ? `Best headroom: ${best.providerName}` : "You have room to keep coding",
    toneClass: "border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-300",
  }
}

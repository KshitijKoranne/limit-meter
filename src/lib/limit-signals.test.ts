import { describe, expect, it } from "vitest"

import type { PluginDisplayState } from "@/lib/plugin-types"
import { collectLimitSignals } from "@/lib/limit-signals"

function plugin(name: string, used: number, limit = 100): PluginDisplayState {
  return {
    meta: { id: name.toLowerCase(), name, iconUrl: "icon", lines: [], primaryCandidates: [] },
    data: {
      providerId: name.toLowerCase(),
      displayName: name,
      iconUrl: "icon",
      lines: [{ type: "progress", label: "Session", used, limit, format: { kind: "percent" } }],
    },
    loading: false,
    error: null,
    lastManualRefreshAt: null,
  }
}

describe("limit-signals", () => {
  it("collects normalized provider limit signals", () => {
    const signals = collectLimitSignals([plugin("Claude", 42)])
    expect(signals).toMatchObject([
      {
        providerName: "Claude",
        metricLabel: "Session",
        fraction: 0.42,
        status: "safe",
      },
    ])
  })

  it("skips unavailable providers and invalid limits", () => {
    const loading = { ...plugin("Loading", 10), loading: true }
    const invalid = plugin("Invalid", 10, 0)
    expect(collectLimitSignals([loading, invalid])).toEqual([])
  })
})

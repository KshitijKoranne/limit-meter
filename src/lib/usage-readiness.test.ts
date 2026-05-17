import { describe, expect, it } from "vitest"

import type { PluginDisplayState } from "@/lib/plugin-types"
import { getUsageReadiness } from "@/lib/usage-readiness"

function plugin(used: number, limit = 100, name = "Provider"): PluginDisplayState {
  return {
    meta: { id: String(used), name, iconUrl: "icon", lines: [], primaryCandidates: [] },
    data: {
      providerId: String(used),
      displayName: name,
      iconUrl: "icon",
      lines: [{ type: "progress", label: "Usage", used, limit, format: { kind: "percent" } }],
    },
    loading: false,
    error: null,
    lastManualRefreshAt: null,
  }
}

describe("usage-readiness", () => {
  it("waits when no live progress lines exist", () => {
    expect(getUsageReadiness([]).level).toBe("waiting")
  })

  it("returns clear for healthy limits", () => {
    expect(getUsageReadiness([plugin(20), plugin(40)]).answer).toBe("Clear")
  })

  it("recommends the provider with the best headroom", () => {
    expect(getUsageReadiness([plugin(50, 100, "Cursor"), plugin(10, 100, "Claude")]).advice).toBe("Best headroom: Claude")
  })

  it("escalates to watch, tight, and blocked", () => {
    expect(getUsageReadiness([plugin(70)]).level).toBe("watch")
    expect(getUsageReadiness([plugin(90)]).level).toBe("tight")
    expect(getUsageReadiness([plugin(100)]).level).toBe("blocked")
  })

  it("uses the worst provider state", () => {
    expect(getUsageReadiness([plugin(10), plugin(75), plugin(95)]).answer).toBe("Tight")
  })

  it("warns which capped metric to avoid", () => {
    expect(getUsageReadiness([plugin(100, 100, "Codex")]).advice).toBe("Avoid Codex Usage for now")
  })
})

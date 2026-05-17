import { describe, expect, it } from "vitest"

import { getLimitStatus } from "@/lib/limit-status"

describe("limit-status", () => {
  it("returns null for invalid limits", () => {
    expect(getLimitStatus(10, 0)).toBeNull()
    expect(getLimitStatus(Number.NaN, 100)).toBeNull()
    expect(getLimitStatus(10, Number.NaN)).toBeNull()
  })

  it("classifies usage bands", () => {
    expect(getLimitStatus(20, 100)?.status).toBe("safe")
    expect(getLimitStatus(70, 100)?.status).toBe("watch")
    expect(getLimitStatus(90, 100)?.status).toBe("near-limit")
    expect(getLimitStatus(100, 100)?.status).toBe("capped")
    expect(getLimitStatus(120, 100)?.status).toBe("capped")
  })

  it("exposes user-facing labels", () => {
    expect(getLimitStatus(20, 100)?.label).toBe("Safe")
    expect(getLimitStatus(70, 100)?.label).toBe("Watch")
    expect(getLimitStatus(90, 100)?.label).toBe("Near Limit")
    expect(getLimitStatus(100, 100)?.label).toBe("Capped")
  })
})

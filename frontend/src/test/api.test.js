import { describe, it, expect, vi } from "vitest";
import { request, ApiError } from "../api";

describe("API client", () => {
  it("sends bearer token and idempotency key only as headers", async () => {
    const mock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ data: { id: 1 } }),
      });
    vi.stubGlobal("fetch", mock);
    await request("/demo", {
      method: "POST",
      token: "test-token",
      idempotencyKey: "test-key",
      data: { prompt: "hello" },
    });
    const [url, options] = mock.mock.calls[0];
    expect(url).toBe("/api/v1/demo");
    expect(options.headers.Authorization).toBe("Bearer test-token");
    expect(options.headers["Idempotency-Key"]).toBe("test-key");
    expect(options.body).toBe('{"prompt":"hello"}');
  });
  it("keeps field validation errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 422,
          json: async () => ({ errors: { email: ["Hibás e-mail."] } }),
        }),
    );
    await expect(request("/register")).rejects.toMatchObject({
      status: 422,
      fields: { email: ["Hibás e-mail."] },
    });
  });
  it("does not expose raw server error details", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => ({ message: "secret SQL details" }),
        }),
    );
    await expect(request("/inquiries")).rejects.toMatchObject({
      message: "Átmeneti hiba történt. Próbáld újra később.",
    });
  });
  it("handles empty logout responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 204 }),
    );
    expect(await request("/logout")).toBeNull();
  });
  it("turns network and malformed responses into usable errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
    await expect(request("/demo")).rejects.toBeInstanceOf(ApiError);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, json: async () => null }),
    );
    await expect(request("/demo")).rejects.toMatchObject({ status: 502 });
  });
});

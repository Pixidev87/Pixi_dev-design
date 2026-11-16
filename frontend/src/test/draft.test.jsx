import { it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { loadInquiryDraft, saveInquiryDraft } from "../inquiryDraft";
function mount() {
  return render(
    <MemoryRouter initialEntries={["/ajanlat"]}>
      <App />
    </MemoryRouter>,
  );
}
async function fill(user) {
  await user.type(screen.getByLabelText("Név"), "Teszt Elek");
  await user.type(screen.getByLabelText("E-mail-cím"), "test@example.com");
  await user.type(
    screen.getByLabelText("Miben segíthetünk?"),
    "Egy új weboldalt szeretnék.",
  );
}
it("restores a draft after a page remount and lets the user clear it", async () => {
  mount();
  const user = userEvent.setup();
  await fill(user);
  cleanup();
  mount();
  expect(screen.getByLabelText("Név")).toHaveValue("Teszt Elek");
  expect(screen.getByLabelText("Miben segíthetünk?")).toHaveValue(
    "Egy új weboldalt szeretnék.",
  );
  await user.click(screen.getByRole("button", { name: "Űrlap ürítése" }));
  expect(loadInquiryDraft()).toBeNull();
  expect(screen.getByLabelText("Név")).toHaveValue("");
});
it("preserves the idempotency key across a lost response and page remount", async () => {
  let attempts = 0;
  const mock = vi.fn(async () => {
    if (++attempts === 1) throw new TypeError("lost connection");
    return { ok: true, status: 200, json: async () => ({ data: { id: 42 } }) };
  });
  vi.stubGlobal("fetch", mock);
  mount();
  const user = userEvent.setup();
  await fill(user);
  await user.click(
    screen.getByRole("button", { name: "Elküldöm az ötletem ↗" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Nem sikerült kapcsolódni",
  );
  const key = mock.mock.calls[0][1].headers["Idempotency-Key"];
  cleanup();
  mount();
  await user.click(
    screen.getByRole("button", { name: "Elküldöm az ötletem ↗" }),
  );
  await screen.findByRole("heading", { name: "Innen folytatjuk." });
  expect(mock.mock.calls[1][1].headers["Idempotency-Key"]).toBe(key);
  expect(loadInquiryDraft()).toBeNull();
});
it("uses a new key when the inquiry changes after a failure", async () => {
  const mock = vi.fn().mockRejectedValue(new TypeError("offline"));
  vi.stubGlobal("fetch", mock);
  mount();
  const user = userEvent.setup();
  await fill(user);
  await user.click(
    screen.getByRole("button", { name: "Elküldöm az ötletem ↗" }),
  );
  await screen.findByRole("alert");
  await user.type(screen.getByLabelText("Miben segíthetünk?"), " Módosítás.");
  await user.click(
    screen.getByRole("button", { name: "Elküldöm az ötletem ↗" }),
  );
  expect(mock.mock.calls[0][1].headers["Idempotency-Key"]).not.toBe(
    mock.mock.calls[1][1].headers["Idempotency-Key"],
  );
});
it("expires old drafts and tolerates corrupt or unavailable storage", () => {
  saveInquiryDraft(
    { name: "Test", email: "test@example.com", description: "Draft" },
    null,
    null,
  );
  const now = Date.now();
  vi.spyOn(Date, "now").mockReturnValue(now + 61 * 60 * 1000);
  expect(loadInquiryDraft()).toBeNull();
  sessionStorage.setItem("pixi:inquiry-draft:v1", "broken JSON");
  expect(loadInquiryDraft()).toBeNull();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  expect(() => saveInquiryDraft({ name: "Test" }, null, null)).not.toThrow();
});

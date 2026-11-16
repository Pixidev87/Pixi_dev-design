import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
vi.mock("../settings", () => ({ demoAvailable: false }));
it("prevents demo calls while the live service is deliberately disabled", async () => {
  const mock = vi.fn(async (url) => ({
    ok: true,
    status: 200,
    json: async () =>
      url.endsWith("/login")
        ? { data: { token: "test-token" } }
        : {
            data: {
              id: 1,
              email: "a@example.com",
              name: "Teszt",
              demo_uses_left: 5,
            },
          },
  }));
  vi.stubGlobal("fetch", mock);
  render(
    <MemoryRouter initialEntries={["/belepes"]}>
      <App />
    </MemoryRouter>,
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("E-mail-cím"), "a@example.com");
  await user.type(screen.getByLabelText("Jelszó"), "Pixi-password-123");
  await user.click(screen.getByRole("button", { name: "Belépek ↗" }));
  expect(
    await screen.findByRole("button", { name: "Mutasd az irányt ↗" }),
  ).toBeDisabled();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "A demó jelenleg még nem elérhető.",
  );
  expect(mock.mock.calls.some(([url]) => url.endsWith("/demo"))).toBe(false);
});

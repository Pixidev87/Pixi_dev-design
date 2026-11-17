import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BrochureApp from "../BrochureApp";
function setup(path = "/") {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(
    <MemoryRouter initialEntries={[path]}>
      <BrochureApp />
    </MemoryRouter>,
  );
  return { user: userEvent.setup(), fetch };
}
it("shows both projects without account, demo or inquiry entry points", async () => {
  const { user, fetch } = setup();
  expect(
    screen.getByRole("link", { name: "Nézd meg a munkáinkat" }),
  ).toHaveAttribute("href", "/portfolio");
  for (const link of screen.getAllByRole("link"))
    expect(link.getAttribute("href")).not.toMatch(
      /^\/(belepes|regisztracio|megerosites|demo|ajanlat)(\/|$)/,
    );
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("link", {
      name: /School Management — iskolai adminisztráció/,
    }),
  );
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "School Management",
  );
  expect(
    screen.queryByRole("link", { name: "Beszéljünk róla ↗" }),
  ).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});
it.each([
  "/belepes",
  "/regisztracio",
  "/megerosites/1/hash",
  "/demo",
  "/ajanlat",
  "/api/v1/status",
])("never exposes forms or calls an API at %s", (path) => {
  const { fetch } = setup(path);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Keressünk másik irányt.",
  );
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});
it("closes the mobile menu with Escape and restores focus", async () => {
  const { user } = setup();
  const menu = screen.getByRole("button", { name: "Menü" });
  await user.click(menu);
  expect(menu).toHaveAttribute("aria-expanded", "true");
  screen.getByRole("link", { name: "Munkáink" }).focus();
  await user.keyboard("{Escape}");
  expect(menu).toHaveAttribute("aria-expanded", "false");
  expect(menu).toHaveFocus();
});

import { it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { projects, categories } from "../data/portfolio";
function setup(path = "/portfolio") {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return { user: userEvent.setup(), fetch };
}
it("makes the portfolio available on the homepage and in navigation", () => {
  setup("/");
  expect(screen.getByRole("link", { name: "Munkáink" })).toHaveAttribute(
    "href",
    "/portfolio",
  );
  expect(
    screen.getByRole("group", { name: "Portfólió szűrése" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Pixi — a saját digitális műhelyünk/ }),
  ).toHaveAttribute("href", "/portfolio/pixi-weboldal");
});
it("filters with pressed states and recovers from an empty category", async () => {
  const { user, fetch } = setup();
  const filters = screen.getByRole("group", { name: "Portfólió szűrése" });
  await user.click(
    within(filters).getByRole("button", { name: "AI és automatizáció" }),
  );
  expect(
    within(filters).getByRole("button", { name: "AI és automatizáció" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("status")).toHaveTextContent("0 bemutatott projekt");
  expect(
    screen.queryByRole("link", { name: /Pixi — a saját digitális műhelyünk/ }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Összes munka mutatása" }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("2 bemutatott projekt");
  expect(fetch).not.toHaveBeenCalled();
});
it("keeps the real project under web and design categories", async () => {
  const { user } = setup();
  const filters = screen.getByRole("group", { name: "Portfólió szűrése" });
  for (const [name, count] of [
    ["Webfejlesztés", 2],
    ["Design és UX/UI", 1],
  ]) {
    await user.click(within(filters).getByRole("button", { name }));
    expect(screen.getByRole("status")).toHaveTextContent(
      `${count} bemutatott projekt`,
    );
  }
});
it("opens the case study and shows verified results and explicit limitations", async () => {
  const { user } = setup();
  await user.click(
    screen.getByRole("link", { name: /Pixi — a saját digitális műhelyünk/ }),
  );
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Pixi — a saját digitális műhelyünk",
  );
  expect(
    screen.getByRole("heading", { name: "A kihívás" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "A megoldás" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "A kézzelfogható eredmény" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/nem ügyfélmunka/)).toHaveTextContent(
    "Az élő Claude-próba halasztva van",
  );
  expect(
    screen.getByRole("link", { name: "Beszéljünk róla ↗" }),
  ).toHaveAttribute("href", "/ajanlat");
  expect(document.title).toBe("Pixi — a saját digitális műhelyünk — Pixi");
});
it("supports direct case-study URLs", () => {
  setup("/portfolio/pixi-weboldal");
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Pixi — a saját digitális műhelyünk",
  );
  expect(
    screen.getByAltText("A Pixi főoldala 390 pixeles mobilnézetben."),
  ).toHaveAttribute("src", "/images/pixi-web-mobile.jpg");
});
it("shows a usable not-found page for unknown cases", () => {
  const { fetch } = setup("/portfolio/missing");
  expect(
    screen.getByRole("heading", { name: "Ez a munka nem található." }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Vissza a munkákhoz ↗" }),
  ).toHaveAttribute("href", "/portfolio");
  expect(fetch).not.toHaveBeenCalled();
});
it("keeps case data consistent as more projects are added", () => {
  expect(new Set(projects.map((project) => project.slug)).size).toBe(
    projects.length,
  );
  for (const project of projects) {
    expect(project.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(
      project.categories.every((id) =>
        categories.some((category) => category.id === id),
      ),
    ).toBe(true);
    for (const field of ["problem", "solution", "result", "limits", "coverAlt"])
      expect(project[field].trim().length).toBeGreaterThan(0);
  }
});

it("shows School Management beside Pixi with its own source and scope", () => {
  setup();
  expect(screen.getByRole("status")).toHaveTextContent("2 bemutatott projekt");
  expect(
    screen.getByRole("link", {
      name: /School Management — iskolai adminisztráció/,
    }),
  ).toHaveAttribute("href", "/portfolio/school-management");
});
it("renders School Management without Pixi-specific mobile or test claims", () => {
  setup("/portfolio/school-management");
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "School Management",
  );
  expect(
    screen.getByRole("link", { name: "GitHub repository ↗" }),
  ).toHaveAttribute("href", "https://github.com/Pixidev87/school_management");
  expect(
    screen.getByText(/A projektet most nem telepítettük és nem futtattuk/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/AI-val szerkesztett bemutatókollázs/),
  ).toBeInTheDocument();
  expect(screen.queryByText(/19 frontendteszt/)).not.toBeInTheDocument();
  expect(
    screen.queryByAltText("A Pixi főoldala 390 pixeles mobilnézetben."),
  ).not.toBeInTheDocument();
});

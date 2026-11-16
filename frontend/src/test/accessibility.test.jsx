import { it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axe from "axe-core";
import App from "../App";
const pages = [
  "/",
  "/portfolio",
  "/portfolio/pixi-weboldal",
  "/portfolio/school-management",
  "/belepes",
  "/regisztracio",
  "/demo",
  "/ajanlat",
  "/megerosites/7/" + "a".repeat(40),
];
it.each(pages)("has no automated WCAG A/AA violations on %s", async (page) => {
  document.documentElement.lang = "hu";
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(
    <MemoryRouter initialEntries={[page]}>
      <App />
    </MemoryRouter>,
  );
  const results = await axe.run(document.body, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
    },
    rules: { "color-contrast": { enabled: false } },
  });
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      elements: nodes.map((node) => node.target),
    })),
  ).toEqual([]);
});

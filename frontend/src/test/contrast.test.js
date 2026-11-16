import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const css = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
function color(name) {
  return css
    .split("--" + name + ":")[1]
    .trim()
    .slice(0, 7);
}
function luminance(hex) {
  const values = hex
    .slice(1)
    .match(/../g)
    .map((part) => parseInt(part, 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
it.each([
  ["ink", "paper"],
  ["muted", "paper"],
  ["muted", "paper-deep"],
  ["petrol", "paper"],
  ["paper", "petrol"],
  ["ink", "mustard"],
  ["mustard", "ink"],
  ["mustard-readable", "petrol"],
])(
  "keeps normal text contrast at least 4.5:1 for %s on %s",
  (foreground, background) => {
    expect(
      contrast(color(foreground), color(background)),
    ).toBeGreaterThanOrEqual(4.5);
  },
);
it("keeps the input boundary distinguishable from the form surface", () => {
  expect(css).toContain("border: 1px solid #81796c");
  expect(contrast("#81796c", "#fffdf8")).toBeGreaterThanOrEqual(3);
});

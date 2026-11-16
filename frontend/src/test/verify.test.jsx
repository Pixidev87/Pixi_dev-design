import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
const hash = "a".repeat(40);
const query = `?expires=9999999999&signature=${"b".repeat(64)}`;
function setup(path, status = 200) {
  const mock = vi
    .fn()
    .mockResolvedValue({
      ok: status < 400,
      status,
      json: async () => ({ message: "ok" }),
    });
  vi.stubGlobal("fetch", mock);
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return { mock, user: userEvent.setup() };
}
it("verifies using the original signed API path without a bearer token", async () => {
  const { mock, user } = setup(`/megerosites/7/${hash}${query}`);
  expect(mock).not.toHaveBeenCalled();
  await user.click(
    screen.getByRole("button", { name: "Megerősítem az e-mail-címem" }),
  );
  expect(
    await screen.findByRole("heading", { name: "Köszönjük, megerősítve." }),
  ).toBeInTheDocument();
  expect(mock.mock.calls[0][0]).toBe(`/api/v1/email/verify/7/${hash}${query}`);
  expect(mock.mock.calls[0][1].headers.Authorization).toBeUndefined();
});
it("explains rejected or expired verification links", async () => {
  const { user } = setup(`/megerosites/7/${hash}${query}`, 403);
  await user.click(
    screen.getByRole("button", { name: "Megerősítem az e-mail-címem" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "lejárt vagy érvénytelen",
  );
});
it("does not call the API for incomplete links", () => {
  const { mock } = setup(`/megerosites/7/${hash}`);
  expect(screen.getByRole("alert")).toHaveTextContent(
    "hiányos vagy érvénytelen",
  );
  expect(
    screen.queryByRole("button", { name: "Megerősítem az e-mail-címem" }),
  ).not.toBeInTheDocument();
  expect(mock).not.toHaveBeenCalled();
});

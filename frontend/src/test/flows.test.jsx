import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
vi.mock("../settings", () => ({ demoAvailable: true }));

const profile = {
  id: 7,
  name: "Teszt Elek",
  email: "elek@example.com",
  email_verified_at: "2026-11-16",
  demo_uses_left: 5,
};
function response(data, status = 200) {
  return { ok: status < 400, status, json: async () => data };
}
function setup(path = "/belepes", handler = () => response({})) {
  const mock = vi.fn(async (url, options) => handler(url, options));
  vi.stubGlobal("fetch", mock);
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return { user: userEvent.setup(), mock };
}
async function login(user) {
  await user.type(screen.getByLabelText("E-mail-cím"), "elek@example.com");
  await user.type(screen.getByLabelText("Jelszó"), "Pixi-password-123");
  await user.click(screen.getByRole("button", { name: "Belépek ↗" }));
}
function loggedInHandler(url) {
  if (url.endsWith("/login"))
    return response({ data: { token: "test-token" } });
  if (url.endsWith("/me")) return response({ data: profile });
  return response({});
}
describe("visitor flows", () => {
  it("renders the homepage without invented claims or fake phone links", () => {
    setup("/");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Egyedi web.",
    );
    expect(
      screen.getByText(/Szemléltető példa, nem ügyfélreferencia/),
    ).toBeInTheDocument();
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(document.body).not.toHaveTextContent("-40%");
  });
  it("requires login before showing the demo form", () => {
    const { mock } = setup("/demo");
    expect(
      screen.getByRole("link", { name: "Regisztrálok ↗" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(mock).not.toHaveBeenCalled();
  });
  it("sends an anonymous inquiry and shows its confirmation", async () => {
    const { user, mock } = setup("/ajanlat", () =>
      response({ data: { id: 42 } }, 201),
    );
    await user.type(screen.getByLabelText("Név"), "Teszt Elek");
    await user.type(screen.getByLabelText("E-mail-cím"), "elek@example.com");
    await user.type(
      screen.getByLabelText("Miben segíthetünk?"),
      "Egy új oldalt szeretnék.",
    );
    await user.click(
      screen.getByRole("button", { name: "Elküldöm az ötletem ↗" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Innen folytatjuk." }),
    ).toBeInTheDocument();
    expect(JSON.parse(mock.mock.calls[0][1].body)).toEqual({
      name: "Teszt Elek",
      email: "elek@example.com",
      description: "Egy új oldalt szeretnék.",
    });
    expect(mock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
  it("keeps an inquiry draft when the server rejects a field", async () => {
    const { user } = setup("/ajanlat", () =>
      response({ errors: { email: ["Az e-mail-cím hibás."] } }, 422),
    );
    await user.type(screen.getByLabelText("Név"), "Teszt");
    await user.type(screen.getByLabelText("E-mail-cím"), "a@example.com");
    await user.type(
      screen.getByLabelText("Miben segíthetünk?"),
      "Megőrzött szöveg.",
    );
    await user.click(
      screen.getByRole("button", { name: "Elküldöm az ötletem ↗" }),
    );
    expect(await screen.findByText("Az e-mail-cím hibás.")).toBeInTheDocument();
    expect(screen.getByLabelText("Miben segíthetünk?")).toHaveValue(
      "Megőrzött szöveg.",
    );
  });
  it("rejects mismatched passwords before registering", async () => {
    const { user, mock } = setup("/regisztracio");
    await user.type(screen.getByLabelText("Név"), "Teszt");
    await user.type(screen.getByLabelText("E-mail-cím"), "a@example.com");
    await user.type(screen.getByLabelText("Jelszó"), "Pixi-password-123");
    await user.type(
      screen.getByLabelText("Jelszó még egyszer"),
      "Other-password-123",
    );
    await user.click(
      screen.getByRole("button", { name: "Létrehozom a fiókomat ↗" }),
    );
    expect(
      await screen.findByText("A két jelszó nem egyezik."),
    ).toBeInTheDocument();
    expect(mock).not.toHaveBeenCalled();
  });
  it("registers and gates an unverified user, with resend and recheck", async () => {
    let verified = false;
    const { user, mock } = setup("/regisztracio", (url) => {
      if (url.endsWith("/register")) return response({ data: profile }, 201);
      if (url.endsWith("/login"))
        return response({ data: { token: "test-token" } });
      if (url.endsWith("/me"))
        return verified ? response({ data: profile }) : response({}, 403);
      return response({ message: "Queued" });
    });
    await user.type(screen.getByLabelText("Név"), "Teszt");
    await user.type(screen.getByLabelText("E-mail-cím"), "elek@example.com");
    await user.type(screen.getByLabelText("Jelszó"), "Pixi-password-123");
    await user.type(
      screen.getByLabelText("Jelszó még egyszer"),
      "Pixi-password-123",
    );
    await user.click(
      screen.getByRole("button", { name: "Létrehozom a fiókomat ↗" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Még egy lépés." }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Levél újraküldése" }));
    expect(
      await screen.findByText(/Elindítottuk a megerősítő levél újraküldését/),
    ).toBeInTheDocument();
    expect(
      mock.mock.calls.some(([url]) =>
        url.endsWith("/email/verification-notification"),
      ),
    ).toBe(true);
    verified = true;
    await user.click(
      screen.getByRole("button", { name: "Megerősítettem, ellenőrzés" }),
    );
    expect(
      await screen.findByLabelText("Mi veszi el most a legtöbb idődet?"),
    ).toBeInTheDocument();
  });
  it("uses the same idempotency key after a retry and prefills an inquiry", async () => {
    let calls = 0;
    const { user, mock } = setup("/belepes", (url) => {
      if (url.endsWith("/demo")) {
        if (++calls === 1) return response({}, 503);
        return response(
          {
            data: {
              id: 9,
              result: {
                summary: "Sok telefon.",
                recommendation: "Online foglalás.",
              },
            },
            meta: { demo_uses_left: 4 },
          },
          201,
        );
      }
      if (url.endsWith("/inquiries")) return response({ data: { id: 3 } }, 201);
      return loggedInHandler(url);
    });
    await login(user);
    const prompt = await screen.findByLabelText(
      "Mi veszi el most a legtöbb idődet?",
    );
    await user.type(prompt, "Sok telefonos egyeztetésem van.");
    await user.click(
      screen.getByRole("button", { name: "Mutasd az irányt ↗" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A kereted nem csökkent",
    );
    await user.click(screen.getByRole("button", { name: "Újrapróbálom ↗" }));
    expect(await screen.findByText("Online foglalás.")).toBeInTheDocument();
    const requests = mock.mock.calls.filter(([url]) => url.endsWith("/demo"));
    expect(requests[0][1].headers["Idempotency-Key"]).toBe(
      requests[1][1].headers["Idempotency-Key"],
    );
    await user.click(
      screen.getByRole("button", { name: "Ajánlatot kérek ezzel ↗" }),
    );
    expect(screen.getByLabelText("Név")).toHaveValue("Teszt Elek");
    expect(screen.getByLabelText("Miben segíthetünk?")).toHaveValue(
      "Sok telefon.\n\nOnline foglalás.",
    );
    await user.click(
      screen.getByRole("button", { name: "Elküldöm az ötletem ↗" }),
    );
    await screen.findByRole("heading", { name: "Innen folytatjuk." });
    expect(
      JSON.parse(
        mock.mock.calls.find(([url]) => url.endsWith("/inquiries"))[1].body,
      ).demo_session_id,
    ).toBe(9);
  });
  it("disables the demo when no uses remain", async () => {
    const { user } = setup("/belepes", (url) =>
      url.endsWith("/me")
        ? response({ data: { ...profile, demo_uses_left: 0 } })
        : loggedInHandler(url),
    );
    await login(user);
    expect(
      await screen.findByRole("button", { name: "Mutasd az irányt ↗" }),
    ).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Elfogyott az 5 demóhasználatod",
    );
  });
  it("logs out and discards the in-memory token", async () => {
    const { user, mock } = setup("/belepes", (url) =>
      url.endsWith("/logout")
        ? { ok: true, status: 204 }
        : loggedInHandler(url),
    );
    await login(user);
    await screen.findByLabelText("Mi veszi el most a legtöbb idődet?");
    await user.click(screen.getByRole("button", { name: "Kilépés" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Sikeresen kijelentkeztél.",
    );
    expect(
      mock.mock.calls.find(([url]) => url.endsWith("/logout"))[1].headers
        .Authorization,
    ).toBe("Bearer test-token");
    expect(screen.getByRole("link", { name: "Belépés" })).toBeInTheDocument();
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(0);
  });
  it("does not submit twice while an inquiry is pending", async () => {
    let resolve;
    const pending = new Promise((done) => {
      resolve = done;
    });
    const { user, mock } = setup("/ajanlat", () => pending);
    await user.type(screen.getByLabelText("Név"), "Teszt");
    await user.type(screen.getByLabelText("E-mail-cím"), "a@example.com");
    await user.type(screen.getByLabelText("Miben segíthetünk?"), "Egy ötlet.");
    await user.dblClick(
      screen.getByRole("button", { name: "Elküldöm az ötletem ↗" }),
    );
    expect(mock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Küldés folyamatban…" }),
    ).toBeDisabled();
    resolve(response({ data: { id: 1 } }, 201));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Innen folytatjuk." }),
      ).toBeInTheDocument(),
    );
  });
});

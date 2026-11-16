import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { demoAvailable } from "../settings";
import { Feedback, Field } from "../components/Forms";

function Verification() {
  const { session, refresh, api } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  async function act(resend) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage("");
    try {
      if (resend) {
        await api("/email/verification-notification", { method: "POST" });
        setMessage("Elindítottuk a megerősítő levél újraküldését.");
      } else {
        const verified = await refresh();
        if (!verified)
          setMessage(
            "A címed még nincs megerősítve. Nyisd meg a levélben kapott linket, majd térj vissza ide.",
          );
      }
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="form-panel verification">
      <span className="panel-symbol" aria-hidden="true">
        ✉
      </span>
      <h2>Még egy lépés.</h2>
      <p>
        A demóhoz meg kell erősítened az e-mail-címedet. Nyisd meg a levélben
        kapott linket, majd térj vissza erre az oldalra.
      </p>
      <p className="small-note">
        Címzett: {session.email}. Ha nem látod a levelet, nézd meg a levélszemét
        mappát is.
      </p>
      <Feedback error={error} />
      <Feedback success>{message}</Feedback>
      <div className="button-row">
        <button
          className="button dark"
          disabled={busy}
          onClick={() => act(false)}
        >
          {busy ? "Ellenőrzés…" : "Megerősítettem, ellenőrzés"}
        </button>
        <button
          className="button outline"
          disabled={busy}
          onClick={() => act(true)}
        >
          Levél újraküldése
        </button>
      </div>
    </div>
  );
}
export default function DemoPage() {
  const { session, api, updateRemaining } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(null);
  const navigate = useNavigate();
  const remaining = session.user?.demo_uses_left ?? 0;
  async function analyze(event) {
    event.preventDefault();
    if (busy || remaining < 1 || !demoAvailable) return;
    const text = prompt.trim();
    if (!pending.current || pending.current.prompt !== text)
      pending.current = { prompt: text, key: crypto.randomUUID() };
    setBusy(true);
    setError(null);
    try {
      const response = await api("/demo", {
        method: "POST",
        data: { prompt: text },
        idempotencyKey: pending.current.key,
      });
      setResult(response.data);
      updateRemaining(response.meta.demo_uses_left);
    } catch (error) {
      if (error.status === 503)
        error.message =
          "A demó most nem érhető el. A kereted nem csökkent. Addig is kérhetsz személyre szabott ajánlatot.";
      setError(error);
      if (error.code === "demo_quota_exhausted") updateRemaining(0);
    } finally {
      setBusy(false);
    }
  }
  function toInquiry() {
    navigate("/ajanlat", {
      state: {
        demoSessionId: result.id,
        description: `${result.result.summary}\n\n${result.result.recommendation}`,
        ownerId: session.user.id,
      },
    });
  }
  return (
    <section className="section page-section">
      <div className="container">
        <div className="page-heading">
          <p className="eyebrow">PIXI / AI-DEMÓ</p>
          <h1>
            Mi lenne, ha
            <br />
            <span className="petrol">egyszerűbb lenne?</span>
          </h1>
          <p>
            Írd le az üzleti problémádat. Rövid összefoglalóval és egy
            lehetséges megoldási iránnyal segítünk elindulni.
          </p>
        </div>
        {!session.token ? (
          <div className="form-panel demo-guest">
            <span className="panel-symbol" aria-hidden="true">
              ↗
            </span>
            <h2>Az első lépés a tiéd.</h2>
            <p>
              A demóhoz regisztráció és megerősített e-mail-cím szükséges. A
              fiókodhoz összesen 5 használat tartozik.
            </p>
            {!demoAvailable && (
              <p className="small-note">
                Az AI-demó jelenleg még nem elérhető; addig is bármikor kérhetsz
                ajánlatot.
              </p>
            )}
            <div className="button-row">
              <Link className="button dark" to="/regisztracio">
                Regisztrálok ↗
              </Link>
              <Link className="button outline" to="/belepes">
                Már van fiókom
              </Link>
            </div>
          </div>
        ) : !session.user ? (
          <Verification />
        ) : (
          <div className="demo-grid">
            <div className="form-panel">
              <div className="quota">
                <span>HÁTRALÉVŐ LEHETŐSÉGEK</span>
                <strong>
                  {remaining}
                  <small>/ 5</small>
                </strong>
              </div>
              <Feedback error={error} />
              {!demoAvailable && (
                <Feedback>
                  A demó jelenleg még nem elérhető. A kereted változatlan marad.{" "}
                  <Link to="/ajanlat">Kérj személyre szabott ajánlatot →</Link>
                </Feedback>
              )}
              {remaining === 0 && (
                <Feedback>
                  Elfogyott az 5 demóhasználatod. Az ötletedet folytathatjuk egy
                  személyre szabott ajánlattal.{" "}
                  <Link to="/ajanlat">Ajánlatot kérek →</Link>
                </Feedback>
              )}
              <form onSubmit={analyze} aria-busy={busy}>
                <Field
                  label="Mi veszi el most a legtöbb idődet?"
                  name="prompt"
                  multiline
                  rows={7}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  required
                  minLength={10}
                  maxLength={3000}
                  disabled={busy}
                  hint="10–3000 karakter. Például: sok telefon érkezik az időpontok egyeztetése miatt."
                  error={error?.fields?.prompt}
                />
                <div className="field-bottom">
                  <span>{prompt.length} / 3000</span>
                  <span>Egy sikeres elemzés: 1 használat</span>
                </div>
                <button
                  className="button dark full"
                  disabled={
                    busy ||
                    !demoAvailable ||
                    remaining === 0 ||
                    Boolean(result && pending.current?.prompt === prompt.trim())
                  }
                >
                  {busy
                    ? "Gondolkodunk az ötleteden…"
                    : error
                      ? "Újrapróbálom ↗"
                      : "Mutasd az irányt ↗"}
                </button>
              </form>
              <p className="small-note">
                Ne írj be jelszót, bizalmas ügyféladatot vagy más érzékeny
                információt.
              </p>
            </div>
            <div
              className={`result-panel ${result ? "has-result" : ""}`}
              aria-live="polite"
            >
              {result ? (
                <>
                  <p className="eyebrow">EGY LEHETSÉGES IRÁNY</p>
                  <h2>Innen indulhatunk.</h2>
                  <h3>Röviden a helyzeted</h3>
                  <p>{result.result.summary}</p>
                  <h3>A javaslatunk</h3>
                  <p className="pre-line">{result.result.recommendation}</p>
                  <button className="button primary" onClick={toInquiry}>
                    Ajánlatot kérek ezzel ↗
                  </button>
                  <p className="small-note">
                    AI által készített kiindulási pont. A részleteket közösen
                    pontosítjuk.
                  </p>
                </>
              ) : (
                <>
                  <span className="result-star" aria-hidden="true">
                    ✳
                  </span>
                  <h2>
                    Az ötletednek
                    <br />
                    itt lesz iránya.
                  </h2>
                  <p>
                    Az összefoglaló és a megoldási javaslat itt jelenik majd
                    meg. Egy kattintással továbbviheted az ajánlatkéréshez.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { request } from "../api";
import { Feedback } from "../components/Forms";

export default function VerifyPage() {
  const { user, hash } = useParams();
  const { search } = useLocation();
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState(null);
  const query = new URLSearchParams(search);
  const valid =
    /^\d+$/.test(user) &&
    /^[a-f0-9]{40}$/.test(hash) &&
    /^\d+$/.test(query.get("expires") || "") &&
    /^[a-f0-9]{64}$/.test(query.get("signature") || "");
  async function verify() {
    if (busy || complete || !valid) return;
    setBusy(true);
    setError(null);
    try {
      await request(`/email/verify/${user}/${hash}${search}`);
      setComplete(true);
    } catch (error) {
      setError(
        error.status === 403
          ? {
              message:
                "Ez a megerősítő link lejárt vagy érvénytelen. Belépés után kérhetsz új levelet a demóoldalon.",
            }
          : error,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section page-section">
      <div className="container">
        <div className="form-panel verification">
          <p className="eyebrow">PIXI / E-MAIL-MEGERŐSÍTÉS</p>
          <span className="panel-symbol" aria-hidden="true">
            {complete ? "✓" : "✉"}
          </span>
          <h1>
            {complete ? "Köszönjük, megerősítve." : "Ez tényleg te vagy?"}
          </h1>
          {complete ? (
            <p role="status">
              Az e-mail-címed megerősítése sikeres. Visszatérhetsz a megnyitott
              demóoldalra, vagy jelentkezz be itt.
            </p>
          ) : (
            <>
              <p>
                Erősítsd meg az e-mail-címedet, hogy hozzáférj a saját
                demófelületedhez.
              </p>
              <Feedback error={error} />
              {!valid && (
                <Feedback>
                  A megerősítő link hiányos vagy érvénytelen. Belépés után kérj
                  új levelet a demóoldalon.
                </Feedback>
              )}
            </>
          )}
          <div className="button-row">
            {!complete && valid && (
              <button className="button dark" disabled={busy} onClick={verify}>
                {busy ? "Megerősítés…" : "Megerősítem az e-mail-címem"}
              </button>
            )}
            <Link
              className={`button ${complete ? "dark" : "outline"}`}
              to="/demo"
            >
              Vissza a demóhoz ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

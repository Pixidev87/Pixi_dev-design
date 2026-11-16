import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import {
  clearInquiryDraft,
  loadInquiryDraft,
  saveInquiryDraft,
} from "../inquiryDraft";
import { Feedback, Field } from "../components/Forms";

export default function InquiryPage() {
  const { state } = useLocation();
  const { session, api } = useAuth();
  const [draft] = useState(loadInquiryDraft);
  const [form, setForm] = useState(() =>
    state?.description
      ? {
          name: session.user?.name || "",
          email: session.user?.email || "",
          description: state.description,
        }
      : draft?.form || {
          name: session.user?.name || "",
          email: session.user?.email || "",
          description: "",
        },
  );
  const [metadata, setMetadata] = useState(
    state?.demoSessionId ? state : draft?.metadata || null,
  );
  const pending = useRef(state?.description ? null : draft?.pending || null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);
  const attached =
    metadata?.demoSessionId && metadata.ownerId === session.user?.id;
  useEffect(() => {
    if (saved) clearInquiryDraft();
    else saveInquiryDraft(form, pending.current, metadata);
  }, [form, metadata, saved]);
  function change(field) {
    return (event) =>
      setForm((value) => ({ ...value, [field]: event.target.value }));
  }
  function reset() {
    clearInquiryDraft();
    pending.current = null;
    setMetadata(null);
    setForm({ name: "", email: "", description: "" });
    setError(null);
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || saved) return;
    const data = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()]),
    );
    if (attached) data.demo_session_id = metadata.demoSessionId;
    const payload = JSON.stringify(data);
    if (!pending.current || pending.current.payload !== payload)
      pending.current = { key: crypto.randomUUID(), payload };
    saveInquiryDraft(form, pending.current, metadata);
    setBusy(true);
    setError(null);
    try {
      const response = await api("/inquiries", {
        method: "POST",
        data,
        idempotencyKey: pending.current.key,
      });
      setSaved(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section page-section">
      <div className="container auth-grid">
        <div className="page-intro">
          <p className="eyebrow">PIXI / AJÁNLATKÉRÉS</p>
          <h1>
            Mesélj róla.
            <br />
            <span className="petrol">Rakjuk össze.</span>
          </h1>
          <p>
            Nem kell kész tervvel érkezned. Néhány mondat az ötletedről elég
            ahhoz, hogy elkezdjük a beszélgetést.
          </p>
          <div className="intro-note">
            <strong>Mi történik ezután?</strong>
            <span>
              Rögzítjük a kérésedet, visszaigazolást küldünk, és felvesszük
              veled a kapcsolatot.
            </span>
          </div>
          <Link className="text-link" to="/">
            Vissza a főoldalra ↗
          </Link>
        </div>
        <div className="form-panel">
          {saved ? (
            <div className="thank-you" role="status">
              <span className="panel-symbol" aria-hidden="true">
                ✓
              </span>
              <p className="eyebrow">ÜZENET RÖGZÍTVE / #{saved.id}</p>
              <h2>Innen folytatjuk.</h2>
              <p>
                Köszönjük, hogy megosztottad velünk az ötletedet! A
                visszaigazoló levél küldését elindítottuk.
              </p>
              <p className="small-note">
                Ha nem találod a levelet, nézd meg a levélszemét mappát is.
              </p>
              <Link className="button dark" to="/">
                Vissza a főoldalra ↗
              </Link>
            </div>
          ) : (
            <>
              <p className="eyebrow">NÉHÁNY SZÓ AZ ÖTLETEDRŐL</p>
              <h2>Ajánlatkérés</h2>
              <Feedback error={error} />
              {attached && (
                <Feedback success>
                  A demó eredményét áthoztuk. A szöveget nyugodtan
                  kiegészítheted.
                </Feedback>
              )}
              <form onSubmit={submit} aria-busy={busy}>
                <Field
                  label="Név"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={change("name")}
                  disabled={busy}
                  error={error?.fields?.name}
                />
                <Field
                  label="E-mail-cím"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={change("email")}
                  disabled={busy}
                  error={error?.fields?.email}
                />
                <Field
                  label="Miben segíthetünk?"
                  name="description"
                  multiline
                  rows={7}
                  required
                  maxLength={5000}
                  value={form.description}
                  onChange={change("description")}
                  disabled={busy}
                  error={error?.fields?.description}
                />
                <p className="small-note">
                  A megadott elérhetőségen az ajánlatkéréseddel kapcsolatban
                  keresünk. Ne küldj jelszót vagy bizalmas adatot.
                </p>
                <button className="button dark full" disabled={busy}>
                  {busy ? "Küldés folyamatban…" : "Elküldöm az ötletem ↗"}
                </button>
                <button
                  type="button"
                  className="draft-reset"
                  disabled={busy}
                  onClick={reset}
                >
                  Űrlap ürítése
                </button>
                <p className="small-note">
                  A piszkozatot ezen a böngészőlapon ideiglenesen, legfeljebb
                  egy óráig őrizzük meg. Sikeres küldéskor vagy kijelentkezéskor
                  töröljük.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

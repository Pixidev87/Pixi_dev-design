import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { request } from "../api";
import { Feedback, Field } from "../components/Forms";

export default function AuthPage({ register = false }) {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  if (session.token) return <Navigate to="/demo" replace />;
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setError(null);
    setBusy(true);
    try {
      if (register) {
        if (data.password !== data.password_confirmation) {
          setError({
            message: "A két jelszó nem egyezik.",
            fields: { password_confirmation: ["Írd be ugyanazt a jelszót."] },
          });
          return;
        }
        await request("/register", { method: "POST", data });
        setCreated(true);
      }
      await signIn(data.email, data.password);
      navigate("/demo");
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
          <p className="eyebrow">
            PIXI / {register ? "ÚJ LEHETŐSÉGEK" : "JÓ ÚJRA ITT"}
          </p>
          <h1>
            {register ? (
              <>
                Egy ötlet.
                <br />
                <span className="petrol">Öt új irány.</span>
              </>
            ) : (
              <>
                Folytassuk
                <br />
                <span className="petrol">az ötletedet.</span>
              </>
            )}
          </h1>
          <p>
            {register
              ? "Hozd létre a fiókodat, erősítsd meg az e-mail-címedet, és máris hozzáférsz a saját demófelületedhez."
              : "Lépj be, és nézd meg, merre indulhat a következő digitális megoldásod."}
          </p>
          <div className="intro-note">
            <strong>Összesen 5 demóhasználat.</strong>
            <span>A keret nem napi, és belépéskor nem indul újra.</span>
          </div>
        </div>
        <div className="form-panel">
          <p className="eyebrow">
            {register ? "01 / FIÓK LÉTREHOZÁSA" : "01 / BELÉPÉS"}
          </p>
          <h2>{register ? "Regisztráció" : "Bejelentkezés"}</h2>
          <Feedback error={error} />
          {created && (
            <Feedback success>
              A fiókod elkészült, a megerősítő levél küldését elindítottuk. Ha a
              belépés nem sikerült, lépj be külön.
            </Feedback>
          )}
          <form onSubmit={submit} aria-busy={busy}>
            {register && (
              <Field
                label="Név"
                name="name"
                autoComplete="name"
                required
                maxLength={150}
                error={error?.fields?.name}
              />
            )}
            <Field
              label="E-mail-cím"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              error={error?.fields?.email}
            />
            <Field
              label="Jelszó"
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              required
              minLength={register ? 12 : undefined}
              hint={
                register
                  ? "Legalább 12 karakter. Legfeljebb 72 bájt, ékezetes karakterekkel kevesebb lehet."
                  : undefined
              }
              error={error?.fields?.password}
            />
            {register && (
              <Field
                label="Jelszó még egyszer"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                error={error?.fields?.password_confirmation}
              />
            )}
            <button
              className="button dark full"
              disabled={busy || (created && register)}
              type="submit"
            >
              {busy
                ? "Egy pillanat…"
                : register
                  ? "Létrehozom a fiókomat ↗"
                  : "Belépek ↗"}
            </button>
          </form>
          <p className="form-switch">
            {register ? "Már van fiókod?" : "Még nincs fiókod?"}{" "}
            <Link to={register ? "/belepes" : "/regisztracio"}>
              {register ? "Jelentkezz be" : "Regisztrálj"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

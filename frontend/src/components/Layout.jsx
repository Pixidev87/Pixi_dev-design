import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { projects } from "../data/portfolio";
import { useAuth } from "../auth";

export default function Layout() {
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMenu(false);
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else {
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus({ preventScroll: true });
    }
    const titles = {
      "/": "Web, AI és design",
      "/demo": "AI-demó",
      "/portfolio": "Munkáink",
      "/ajanlat": "Ajánlatkérés",
      "/belepes": "Bejelentkezés",
      "/regisztracio": "Regisztráció",
    };
    const project = projects.find(
      (item) => location.pathname === `/portfolio/${item.slug}`,
    );
    document.title = `${project?.title || titles[location.pathname] || (location.pathname.startsWith("/megerosites/") ? "E-mail-megerősítés" : "Oldal nem található")} — Pixi`;
  }, [location.pathname, location.hash]);
  async function exit() {
    setBusy(true);
    try {
      await logout();
      setNotice("Sikeresen kijelentkeztél.");
    } catch {
      setNotice(
        "Ezen a felületen kijelentkeztél. A szerveroldali munkamenet lezárását kapcsolat hiányában nem tudtuk megerősíteni.",
      );
    } finally {
      setBusy(false);
      navigate("/");
    }
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Ugrás a tartalomra
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/" aria-label="Pixi főoldal">
            pixi<span className="brand-dot">.</span>
            <small>web &amp; webdesign</small>
          </Link>
          <button
            className="menu-toggle"
            aria-expanded={menu}
            aria-controls="navigation"
            onClick={() => setMenu(!menu)}
            onKeyDown={(event) => event.key === "Escape" && setMenu(false)}
          >
            Menü <span aria-hidden="true">{menu ? "−" : "+"}</span>
          </button>
          <nav
            id="navigation"
            className={menu ? "is-open" : ""}
            aria-label="Fő navigáció"
          >
            <Link to="/#szolgaltatasok">Szolgáltatások</Link>
            <NavLink to="/portfolio">Munkáink</NavLink>
            <NavLink to="/demo">AI-demó</NavLink>
            <NavLink to="/ajanlat">
              Ajánlatkérés <span aria-hidden="true">↗</span>
            </NavLink>
            {session.token ? (
              <button className="nav-action" disabled={busy} onClick={exit}>
                {busy ? "Kilépés…" : "Kilépés"}
              </button>
            ) : (
              <NavLink className="nav-action" to="/belepes">
                Belépés
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      {notice && (
        <div className="site-notice" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Értesítés bezárása">
            ×
          </button>
        </div>
      )}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer>
        <div className="container footer-inner">
          <Link to="/" className="footer-brand">
            pixi<span>.</span>
          </Link>
          <p>Jó ötletekből működő megoldások.</p>
          <span>© 2026 Pixi web &amp; webdesign</span>
        </div>
      </footer>
    </>
  );
}

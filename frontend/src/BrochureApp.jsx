import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Portfolio from "./components/Portfolio";
import CaseStudy from "./pages/CaseStudy";

function BrochureLayout() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMenu(false);
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else {
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus({ preventScroll: true });
    }
    if (!location.pathname.startsWith("/portfolio/"))
      document.title = `${location.pathname === "/" ? "Web, AI és design" : location.pathname === "/portfolio" ? "Munkáink" : "Oldal nem található"} — Pixi`;
  }, [location.pathname, location.hash]);
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
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setMenu(false);
                document.querySelector(".menu-toggle")?.focus();
              }
            }}
          >
            <Link to="/#szolgaltatasok">Szolgáltatások</Link>
            <NavLink to="/portfolio">Munkáink</NavLink>
            <Link to="/#kapcsolat">Kapcsolat ↗</Link>
          </nav>
        </div>
      </header>
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
export default function BrochureApp() {
  return (
    <Routes>
      <Route element={<BrochureLayout />}>
        <Route index element={<Home brochure />} />
        <Route path="portfolio" element={<Portfolio standalone />} />
        <Route path="portfolio/:slug" element={<CaseStudy brochure />} />
        <Route
          path="*"
          element={
            <section className="section">
              <div className="container">
                <p className="eyebrow">404 / EZ AZ OLDAL NINCS ITT</p>
                <h1>Keressünk másik irányt.</h1>
                <Link className="button dark" to="/">
                  Vissza a főoldalra ↗
                </Link>
              </div>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}

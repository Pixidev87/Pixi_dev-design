import { Link } from "react-router-dom";
import Portfolio from "../components/Portfolio";
import { demoAvailable } from "../settings";

const services = [
  [
    "01",
    "Webfejlesztés",
    "Az ötleted mögé rendszert építünk.",
    "Egyedi weboldal, React felület és Laravel háttérrendszer. Együtt tervezve, a működésedhez igazítva.",
    "Weboldal / alkalmazás / API",
  ],
  [
    "02",
    "AI és automatizáció",
    "Kevesebb ismétlés. Több alkotás.",
    "Összekötjük a munkafolyamataidat. Az időpontegyeztetéstől az ügyfélkommunikációig megkeressük, mit érdemes egyszerűsíteni.",
    "AI-megoldás / integráció / folyamat",
  ],
  [
    "03",
    "Design és UX/UI",
    "Legyen érthető. És emlékezetes.",
    "Arculat és digitális felület, ahol a karakteres megjelenés és az átgondolt felhasználói élmény egymást erősíti.",
    "Arculat / felület / felhasználói élmény",
  ],
];
const phone = import.meta.env.VITE_CONTACT_PHONE || "";
const phoneNumber = phone.replace(/[^+\d]/g, "");
const booking = import.meta.env.VITE_BOOKING_URL || "";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow light">
              <span className="tiny-line" /> DIGITÁLIS MŰHELY · PIXI
            </p>
            <h1>
              Egyedi web.
              <br />
              <span className="highlight">Okos megoldás.</span>
              <br />
              Karakteres design.
            </h1>
            <p className="hero-lead">
              Fejlesztés, AI és design egy kézből. Összekötjük azt, ami szép,
              azzal, ami működik.
            </p>
            <div className="button-row">
              <Link className="button primary" to="/ajanlat">
                Beszéljünk az ötletedről <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link light-link" to="/demo">
                Kipróbálom az AI-demót <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Digitális felületek és arculat szemléltető kompozíciója"
            role="img"
          >
            <div className="art-label">
              ÖTLETTŐL A MEGVALÓSÍTÁSIG <span>↗</span>
            </div>
            <div className="browser-art">
              <div className="browser-bar">
                <i />
                <i />
                <i />
                <span>egyedi megoldások</span>
              </div>
              <div className="browser-content">
                <div className="mini-caption">A KÖVETKEZŐ LÉPÉSED</div>
                <strong>
                  Legyen
                  <br />
                  belőle<span> valami.</span>
                </strong>
                <div className="mini-button">INDULJUNK EL ↗</div>
                <div className="orbit" />
              </div>
            </div>
            <div className="type-card">
              <span>DESIGN / FEJLESZTÉS</span>
              <strong>
                Aa<span>↗</span>
              </strong>
              <small>Karakter, minden részletben.</small>
            </div>
            <div className="flow-card">
              <span className="flow-dot" />
              ötlet <b>→</b> rendszer <b>→</b> élmény
            </div>
            <span className="art-corner">PIXI STUDIO / 2026</span>
          </div>
        </div>
        <div className="container hero-bottom">
          <span>WEBFEJLESZTÉS</span>
          <span>AI &amp; AUTOMATIZÁCIÓ</span>
          <span>DESIGN &amp; UX/UI</span>
          <span className="scroll-hint">GÖRGESS TOVÁBB ↓</span>
        </div>
      </section>
      <section className="section" id="szolgaltatasok">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / AMIBEN SEGÍTÜNK</p>
              <h2>
                Három terület.
                <br />
                <span className="petrol">Egy közös irány.</span>
              </h2>
            </div>
            <p>
              Az első vázlattól a működő rendszerig.
              <br />A részleteket együtt rakjuk össze.
            </p>
          </div>
          <div className="services-grid">
            {services.map(([num, title, lead, copy, tags]) => (
              <article className="service" key={num}>
                <div className="service-top">
                  <span>{num}</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <h3>{title}</h3>
                <p className="service-lead">{lead}</p>
                <p>{copy}</p>
                <small>{tags}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Portfolio />
      <section className="section concept-section">
        <div className="container concept-grid">
          <div className="concept-art" aria-hidden="true">
            <span className="concept-label">SZEMLÉLTETŐ KONCEPCIÓ</span>
            <div className="calendar-art">
              <div>
                KEVESEBB EGYEZTETÉS <span>↗</span>
              </div>
              <strong>
                Van időd
                <br />a lényegre.
              </strong>
              <div className="calendar-days">H K SZE CS P</div>
              <div className="calendar-block">
                10:30 <span>Új időpont</span> ✓
              </div>
              <div className="calendar-block second">
                14:00 <span>Automatikus emlékeztető</span>
              </div>
            </div>
            <span className="concept-star">✳</span>
          </div>
          <div className="concept-copy">
            <p className="eyebrow">02 / ÍGY GONDOLKODUNK</p>
            <h2>
              Egy probléma.
              <br />
              Több lehetőség.
            </h2>
            <p>
              Ha az időpontegyeztetés megszakítja a munkát, egy jól felépített
              foglalási folyamat segíthet. Átlátható felület, összekötött
              naptár, automatikus visszaigazolás.
            </p>
            <p className="small-note">
              Szemléltető példa, nem ügyfélreferencia. A saját
              megvalósításainkat fent, a munkáink között mutatjuk be.
            </p>
            <Link className="text-link" to="/demo">
              Nézzük meg a te problémádat <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="section demo-teaser">
        <div className="container teaser-grid">
          <div className="large-five" aria-hidden="true">
            5<span>lehetőség</span>
          </div>
          <div>
            <p className="eyebrow light">03 / PRÓBÁLJUK KI</p>
            <h2>
              Írd le, ami
              <br />
              most <em>időt vesz el.</em>
            </h2>
            <p>
              Az AI-demó rövid összefoglalót és megoldási irányt ad.
              Regisztráció és e-mail-megerősítés után összesen öt alkalommal
              próbálhatod ki.
            </p>
            <p className="availability">
              {demoAvailable
                ? "Öt lehetőség, hogy megtaláld az első lépést."
                : "Az AI-demó hamarosan elérhető. Ajánlatot már most kérhetsz."}
            </p>
            <Link className="button primary" to="/demo">
              Megnézem a demót <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="section contact-section" id="kapcsolat">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">04 / KEZDJÜK EGY BESZÉLGETÉSSEL</p>
            <h2>
              Van egy ötleted?
              <br />
              <span className="petrol">Adjunk neki formát.</span>
            </h2>
            <Link className="button dark" to="/ajanlat">
              Ajánlatot kérek <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="contact-details">
            <div>
              <span>TELEFON</span>
              {/^\+?[0-9]{6,15}$/.test(phoneNumber) ? (
                <a href={`tel:${phoneNumber}`}>{phone}</a>
              ) : (
                <p>Telefonszám hamarosan.</p>
              )}
            </div>
            <div>
              <span>IDŐPONTEGYEZTETÉS</span>
              {booking.startsWith("https://") ? (
                <a href={booking} target="_blank" rel="noreferrer">
                  Időpontot foglalok ↗
                </a>
              ) : (
                <Link to="/ajanlat">Egyeztessünk írásban ↗</Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

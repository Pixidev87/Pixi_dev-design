import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { projects } from "../data/portfolio";

export default function CaseStudy() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  useEffect(() => {
    document.title = project
      ? `${project.title} — Pixi`
      : "Esettanulmány nem található — Pixi";
  }, [project]);
  if (!project)
    return (
      <section className="section">
        <div className="container">
          <p className="eyebrow">PIXI / PORTFÓLIÓ</p>
          <h1>Ez a munka nem található.</h1>
          <p>Válassz a bemutatott projektjeink közül.</p>
          <Link className="button dark" to="/portfolio">
            Vissza a munkákhoz ↗
          </Link>
        </div>
      </section>
    );
  return (
    <article className="case-study">
      <header className="section case-heading">
        <div className="container">
          <Link className="case-back" to="/portfolio">
            ← Munkáink
          </Link>
          <p className="eyebrow">
            {project.kind} / {project.year}
          </p>
          <h1>{project.title}</h1>
          <p className="case-subtitle">{project.subtitle}</p>
          <div className="case-tags">
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="project-status">{project.status}</p>
        </div>
      </header>
      <div className="container case-cover">
        <img
          src={project.cover}
          alt={project.coverAlt}
          width="1280"
          height="900"
          fetchPriority="high"
        />
        {project.coverCaption && (
          <p className="case-cover-caption">{project.coverCaption}</p>
        )}
      </div>
      <section className="section">
        <div className="container case-story">
          {[
            ["01", "A kihívás", project.problem],
            ["02", "A megoldás", project.solution],
            [
              "03",
              project.resultTitle || "A kézzelfogható eredmény",
              project.result,
            ],
          ].map(([number, title, copy]) => (
            <div className="case-chapter" key={number}>
              <div>
                <p className="eyebrow">{number} / A TÖRTÉNET</p>
                <h2>{title}</h2>
              </div>
              <p>{copy}</p>
            </div>
          ))}
          <div className="case-evidence">
            <h2>Amit ellenőriztünk</h2>
            <ul>
              {project.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="small-note">
              {project.evidenceNote ||
                "Fejlesztési ellenőrzések a 6. szakasz lezárásakor; nem üzleti eredménymutatók."}
            </p>
            {project.sources && (
              <>
                <h3>Források és projektlink</h3>
                <ul>
                  {project.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
      {project.mobile ? (
        <section className="case-mobile-section">
          <div className="container case-mobile-grid">
            <img
              src={project.mobile}
              alt="A Pixi főoldala 390 pixeles mobilnézetben."
              width="390"
              height="844"
              loading="lazy"
            />
            <div>
              <p className="eyebrow">A KISEBB KÉPERNYŐ IS SZÁMÍT</p>
              <h2>
                Ugyanaz a karakter.
                <br />
                Más léptékben.
              </h2>
              <p>
                A főoldalt asztali és mobilnézetben is ellenőriztük. Az
                ajánlatkérést a mobilos felületről, a valódi helyi
                háttérrendszerrel is végigpróbáltuk.
              </p>
              <h3>Ami még előttünk van</h3>
              <p>{project.limits}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="section case-source-section">
          <div className="container case-story">
            <p className="eyebrow">A PROJEKT FELÉPÍTÉSE</p>
            <h2>Összekapcsolt modulok.</h2>
            <ul className="case-module-list">
              {project.modules?.map((module) => (
                <li key={module}>{module}</li>
              ))}
            </ul>
            <h3>A bemutató keretei</h3>
            <p>{project.limits}</p>
          </div>
        </section>
      )}
      <section className="section">
        <div className="container case-cta">
          <div>
            <p className="eyebrow">A KÖVETKEZŐ TÖRTÉNET LEHET A TIÉD</p>
            <h2>Van egy hasonló ötleted?</h2>
          </div>
          <Link className="button dark" to="/ajanlat">
            Beszéljünk róla ↗
          </Link>
        </div>
      </section>
    </article>
  );
}

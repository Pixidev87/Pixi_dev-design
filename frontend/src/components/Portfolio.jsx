import { useState } from "react";
import { Link } from "react-router-dom";
import { categories, projects } from "../data/portfolio";

export default function Portfolio({ standalone = false }) {
  const [selected, setSelected] = useState("all");
  const visible =
    selected === "all"
      ? projects
      : projects.filter((project) => project.categories.includes(selected));
  const Title = standalone ? "h1" : "h2";
  return (
    <section className="section portfolio-section" id="portfolio">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PIXI / MUNKÁINK</p>
            <Title>
              Ötletből
              <br />
              <span className="petrol">kézzelfogható megoldás.</span>
            </Title>
          </div>
          <p>
            Saját munkák, őszintén bemutatva.
            <br />A kihívástól a működő részletekig.
          </p>
        </div>
        <div
          className="portfolio-filters"
          role="group"
          aria-label="Portfólió szűrése"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              className={selected === category.id ? "selected" : ""}
              aria-pressed={selected === category.id}
              onClick={() => setSelected(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        <p className="portfolio-count" role="status">
          {visible.length} bemutatott projekt
        </p>
        {visible.length ? (
          <div className="portfolio-grid">
            {visible.map((project) => (
              <article className="project-card" key={project.slug}>
                <Link
                  className="project-link"
                  to={`/portfolio/${project.slug}`}
                >
                  <div className="project-image">
                    <img
                      src={project.cover}
                      alt={project.coverAlt}
                      width="1280"
                      height="900"
                      loading="lazy"
                    />
                    <span aria-hidden="true">↗</span>
                  </div>
                  <div className="project-body">
                    <div className="project-meta">
                      <span>{project.kind}</span>
                      <span>{project.year}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <span className="project-status">{project.status}</span>
                    <span className="project-read">
                      Esettanulmány megnyitása ↗
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="portfolio-empty">
            <h3>Ez a történet még készül.</h3>
            <p>
              Ebben a kategóriában még nincs publikált esettanulmány. Nézd meg a
              többi munkánkat, vagy mesélj a saját ötletedről.
            </p>
            <button
              className="button outline"
              onClick={() => setSelected("all")}
            >
              Összes munka mutatása
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

import { PROJECTS } from '../data/content';

export default function Projects() {
  return (
    <ul className="project-list">
      {PROJECTS.map((project) => (
        <li key={project.name} className="project-entry">
          {project.image && (
            <img className="project-entry__image" src={project.image} alt="" loading="lazy" />
          )}
          <div className="project-entry__meta">
            <span>{project.category}</span>
            <span>{project.year}</span>
          </div>
          <h2 className="project-entry__name">
            {project.link ? (
              <a href={project.link} target="_blank" rel="noreferrer">
                {project.name}
              </a>
            ) : (
              project.name
            )}
          </h2>
          <p className="project-entry__description">{project.description}</p>
        </li>
      ))}
    </ul>
  );
}

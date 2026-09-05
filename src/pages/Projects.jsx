import { PROJECTS } from '../data/content';

export default function Projects() {
  return (
    <ol className="projects-list">
      {PROJECTS.map(([type, name, year], index) => (
        <li key={name} className="projects-list__item">
          <span className="projects-list__index">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <p className="projects-list__meta">{type} · {year}</p>
            <h2>{name}</h2>
          </div>
        </li>
      ))}
    </ol>
  );
}

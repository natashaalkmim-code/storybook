import { PROCESS } from '../data/content';

export default function Process() {
  return (
    <ol className="process-list">
      {PROCESS.map((stage) => (
        <li key={stage.number} className="process-entry">
          <span className="process-entry__number" aria-hidden="true">
            {stage.number}
          </span>
          <div>
            <h2 className="process-entry__title">{stage.title}</h2>
            <p className="process-entry__description">{stage.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

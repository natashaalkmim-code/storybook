import { PROCESS } from '../data/content';

export default function Process() {
  return (
    <ol className="process-list">
      {PROCESS.map(([number, title, description]) => (
        <li key={number}>
          <span>{number}</span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

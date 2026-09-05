import { SERVICES } from '../data/content';

export default function Services() {
  return (
    <ul className="services-list">
      {SERVICES.map(([title, description]) => (
        <li key={title}>
          <h2>{title}</h2>
          <p>{description}</p>
        </li>
      ))}
    </ul>
  );
}

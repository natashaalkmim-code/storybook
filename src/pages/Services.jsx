import { SERVICES } from '../data/content';

export default function Services() {
  return (
    <ul className="service-list">
      {SERVICES.map((service) => (
        <li key={service.title} className="service-entry">
          <h2 className="service-entry__title">{service.title}</h2>
          <p className="service-entry__description">{service.description}</p>
        </li>
      ))}
    </ul>
  );
}

import { ABOUT } from '../data/content';

export default function About() {
  return (
    <div className="about">
      {ABOUT.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="about__paragraph">
          {paragraph}
        </p>
      ))}
      <ul className="about__credits">
        {ABOUT.credits.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

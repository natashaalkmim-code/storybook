import { ABOUT } from '../data/content';

export default function About() {
  return (
    <div className="about-page">
      {ABOUT.paragraphs.map((text) => <p key={text}>{text}</p>)}
      <div className="about-page__credits">
        {ABOUT.credits.map((text) => <span key={text}>{text}</span>)}
      </div>
    </div>
  );
}

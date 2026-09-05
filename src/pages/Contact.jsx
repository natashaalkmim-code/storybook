import { CONTACT } from '../data/content';

export default function Contact() {
  return (
    <div className="contact-page">
      <a className="contact-page__email" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
      <a className="contact-page__social" href="https://instagram.com/storybookstudio" target="_blank" rel="noreferrer">
        Instagram <span>{CONTACT.instagram}</span>
      </a>
      <div className="contact-page__newsletter">
        <p>{CONTACT.newsletter}</p>
        <form onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="newsletter">Email</label>
          <input id="newsletter" type="email" placeholder="you@email.com" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
}

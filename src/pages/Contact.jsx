import { CONTACT } from '../data/content';

export default function Contact() {
  return (
    <div className="contact">
      <a className="contact__email" href={`mailto:${CONTACT.email}`}>
        {CONTACT.emailLabel}
      </a>

      <ul className="contact__social">
        {CONTACT.social.map((item) => (
          <li key={item.label}>
            <a href={item.href} target="_blank" rel="noreferrer">
              {item.label}
              <span className="contact__handle">{item.handle}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="contact__newsletter">
        <p>{CONTACT.newsletterNote}</p>
        {/*
          Visual placeholder only — no submit handler wired up.
          Point this form at Mailchimp, Buttondown or ConvertKit's embed
          endpoint (or their API) once Miren picks one.
        */}
        <form className="contact__newsletter-form" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input id="newsletter-email" type="email" placeholder="you@email.com" autoComplete="email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
}

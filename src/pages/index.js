import Projects from './Projects';
import Contact from './Contact';
import About from './About';
import Services from './Services';
import Process from './Process';

// Keyed by section id from src/data/sections.js. Add a folder there and a
// matching entry here — FolderStack looks components up by id, it never
// hardcodes which page goes with which index.
export const PAGES = {
  projects: Projects,
  contact: Contact,
  about: About,
  services: Services,
  process: Process,
};

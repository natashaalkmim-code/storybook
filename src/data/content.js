// ---------------------------------------------------------------------------
// CONTENT
// ---------------------------------------------------------------------------
// Every editable word for the five open pages lives in this one file.
// It's placeholder copy written for Storybook Studio specifically (not lorem
// ipsum) so the framework can be reviewed with something close to real
// weight — replace freely, the layout doesn't depend on any of these exact
// strings.

export const ABOUT = {
  kicker: 'About',
  paragraphs: [
    'Storybook Studio is the practice of Miren Arregui — a positioning and communication studio for people whose work is too layered for a one-line pitch.',
    'Miren spent six years building marketing strategy inside other people\u2019s companies before leaving to work only with founders and independent practitioners who needed that same rigor turned toward their own name. She moved from Spain to Norway partway through that shift, which turned out to be its own kind of translation.',
    'The studio exists for people making complex, authorial work who need it carried into language, positioning and guidelines that other people can actually act on.',
  ],
  credits: ['Founder & strategist — Miren Arregui', 'Based in Norway, working internationally'],
};

export const SERVICES = [
  {
    title: 'Brand Narrative',
    description:
      'Finding the throughline in work that resists a single sentence, and turning it into language you can stand behind.',
  },
  {
    title: 'Positioning Strategy',
    description: 'Where you sit against the market, who it\u2019s actually for, and why that matters right now.',
  },
  {
    title: 'Communication Guidelines',
    description:
      'Tone, vocabulary and message hierarchy your team — or future you — can pick up without you in the room.',
  },
  {
    title: 'Ongoing Direction',
    description: 'A standing sounding board for the calls that don\u2019t have a template yet.',
  },
];

export const PROCESS = [
  {
    number: '01',
    title: 'Listen',
    description: 'A long-form conversation before any strategy — what you make, why, and what\u2019s getting lost in translation.',
  },
  {
    number: '02',
    title: 'Translate',
    description: 'The throughline gets named: positioning, narrative and the words that will carry it forward.',
  },
  {
    number: '03',
    title: 'Shape',
    description: 'Guidelines and message architecture your team can stay consistent with, on the days you\u2019re not in the room.',
  },
  {
    number: '04',
    title: 'Release',
    description: 'Handoff, with room to return when the work — or the market around it — shifts.',
  },
];

// `image` is optional — leave it '' to render as a text-only entry (the
// default below). Drop a file in public/assets/projects/ and point `image`
// at it (e.g. '/assets/projects/ceramics.webp') to show a thumbnail instead.
export const PROJECTS = [
  {
    name: 'A Ceramics Studio Finds Its Sentence',
    category: 'Positioning',
    year: '2025',
    description: 'Twelve years of practice, no clear answer to "what do you make." A narrative built from the material up.',
    image: '',
    link: '',
  },
  {
    name: 'Repositioning a Wellness Practice for International Clients',
    category: 'Brand Narrative',
    year: '2025',
    description: 'Local reputation, global ambitions. Message architecture that travels across language and market.',
    image: '',
    link: '',
  },
  {
    name: 'Guidelines for a Two-Person Studio Growing Into a Team',
    category: 'Communication Guidelines',
    year: '2024',
    description: 'The founders\u2019 voice, written down clearly enough for a third hire to use it correctly on day one.',
    image: '',
    link: '',
  },
  {
    name: 'A Decade of Consulting, Renamed',
    category: 'Positioning',
    year: '2024',
    description: 'From an unremarkable job title to a named point of view the market could refer clients toward.',
    image: '',
    link: '',
  },
];

// TODO(Miren): confirm the exact inbox — placeholder built from the
// chapter@ address already in use.
export const CONTACT = {
  email: 'chapter@storybookstudio.com',
  emailLabel: 'chapter@storybookstudio.com',
  social: [
    { label: 'Instagram', href: 'https://instagram.com/storybookstudio', handle: '@storybookstudio' },
    { label: 'LinkedIn', href: 'https://linkedin.com', handle: 'Miren Arregui' },
  ],
  newsletterNote: 'One note, sent occasionally, on positioning and the work of translation.',
};

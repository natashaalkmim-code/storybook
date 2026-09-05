/*
  Closed stack art direction.

  The four pale papers below are the new, taller PNG exports supplied for the
  final composition. Their rotation is already baked into the PNGs, so the code
  only controls scale and placement. The values are viewport-relative and were
  tuned against the complete Storybook reference composition.
*/
export const SECTIONS = [
  {
    id: 'projects',
    label: 'Projects',
    dividerImage: '/assets/dividers/projects.png',
    dividerRatio: 1611 / 2048,
    shoulderYRatio: 150 / 1611,
    tabX: 0.155,

    // NEW sheet-c = the nearly horizontal paper behind Projects.
    sheetImage: '/assets/sheets/sheet-c.png',
    sheetRatio: 1188 / 882,
    sheetWidthRatio: 0.8584,
    sheetWidthMax: 1600,
    sheetXRatio: -0.0116,
    sheetTopRatio: 0.2376,
    sheetHitClip: 'none',
  },
  {
    id: 'contact',
    label: 'Contact',
    dividerImage: '/assets/dividers/contact.png',
    dividerRatio: 1792 / 1918,
    shoulderYRatio: 157 / 1792,
    tabX: 0.52,

    // NEW sheet-a = the long slanted paper behind Contact.
    sheetImage: '/assets/sheets/sheet-a.png',
    sheetRatio: 1507 / 810,
    sheetWidthRatio: 0.6808,
    sheetWidthMax: 1280,
    sheetXRatio: -0.0082,
    sheetTopRatio: 0.3676,
    sheetHitClip: 'none',
  },
  {
    id: 'about',
    label: 'About',
    dividerImage: '/assets/dividers/about.png',
    dividerRatio: 1792 / 1485,
    shoulderYRatio: 119 / 1792,
    tabX: 0.315,

    // Dark sheet is unchanged.
    sheetImage: '/assets/sheets/sheet-dark.png',
    sheetRatio: 1234 / 787,
    sheetWidthRatio: 0.67,
    sheetWidthMax: 1260,
    sheetXRatio: 0.13,
    sheetTopRatio: 0.492,
    sheetFit: 'contain',
    sheetHitClip: 'polygon(4.6% 0%, 100% 12.3%, 95.3% 100%, 0% 87.5%)',
  },
  {
    id: 'services',
    label: 'Services',
    dividerImage: '/assets/dividers/services.png',
    dividerRatio: 1792 / 1268,
    shoulderYRatio: 177 / 1792,
    tabX: 0.62,

    // NEW sheet-b = the taller paper behind Services.
    sheetImage: '/assets/sheets/sheet-b.png',
    sheetRatio: 1224 / 935,
    sheetWidthRatio: 0.7018,
    sheetWidthMax: 1320,
    sheetXRatio: 0.1447,
    sheetTopRatio: 0.5796,
    sheetHitClip: 'none',
  },
  {
    id: 'process',
    label: 'Process',
    dividerImage: '/assets/dividers/process.png',
    dividerRatio: 1792 / 792,
    shoulderYRatio: 199 / 1792,
    tabX: 0.5,

    // NEW sheet-d = the wide paper behind Process.
    sheetImage: '/assets/sheets/sheet-d.png',
    sheetRatio: 1536 / 884,
    sheetWidthRatio: 0.8796,
    sheetWidthMax: 1640,
    sheetXRatio: -0.0243,
    sheetTopRatio: 0.6926,
    sheetHitClip: 'none',
  },
];

export function getSectionIndex(id) {
  return SECTIONS.findIndex((section) => section.id === id);
}

/*
  The uploaded PNGs are the actual visual interface. Nothing here recreates
  the folders with CSS. Reorder this array and the stack geometry still works.

  dividerRatio / sheetRatio are width / height ratios from the uploaded files.
  tabX marks the approximate horizontal center of the printed tab so the
  invisible accessible click target sits on the artwork rather than over the
  whole giant folder image.
*/
export const SECTIONS = [
  {
    id: 'projects',
    label: 'Projects',
    dividerImage: '/assets/dividers/projects.png',
    dividerRatio: 1611 / 2048,
    tabX: 0.155,
    sheetImage: '/assets/sheets/sheet-a.png',
    sheetRatio: 842 / 952,
  },
  {
    id: 'contact',
    label: 'Contact',
    dividerImage: '/assets/dividers/contact.png',
    dividerRatio: 1792 / 1918,
    tabX: 0.52,
    sheetImage: '/assets/sheets/sheet-b.png',
    sheetRatio: 446 / 870,
  },
  {
    id: 'about',
    label: 'About',
    dividerImage: '/assets/dividers/about.png',
    dividerRatio: 1792 / 1485,
    tabX: 0.315,
    sheetImage: '/assets/sheets/sheet-c.png',
    sheetRatio: 800 / 909,
  },
  {
    id: 'services',
    label: 'Services',
    dividerImage: '/assets/dividers/services.png',
    dividerRatio: 1792 / 1268,
    tabX: 0.62,
    sheetImage: '/assets/sheets/sheet-d.png',
    sheetRatio: 720 / 772,
  },
  {
    id: 'process',
    label: 'Process',
    dividerImage: '/assets/dividers/process.png',
    dividerRatio: 1792 / 792,
    tabX: 0.5,
    // There are four uploaded loose-paper images for five dividers. Reusing
    // the first one here preserves the exact uploaded visual language without
    // generating a fake fifth paper in CSS.
    sheetImage: '/assets/sheets/sheet-a.png',
    sheetRatio: 842 / 952,
  },
];

export function getSectionIndex(id) {
  return SECTIONS.findIndex((section) => section.id === id);
}

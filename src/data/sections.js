// ---------------------------------------------------------------------------
// SECTIONS
// ---------------------------------------------------------------------------
// The stack is generated from this array — reorder, rename, recolor or add a
// folder here and FolderStack.jsx, the routes and the resting geometry all
// follow automatically. Nothing about the animation system needs to change.
//
// `color` must match one of the palette keys defined as --color-* custom
// properties in src/styles/global.css (see the PALETTE map there).

export const SECTIONS = [
  {
    id: 'projects',
    label: 'Projects',
    color: 'purple',
    dividerImage: '/assets/dividers/projects.webp',
    sheetImage: '/assets/sheets/projects.webp',
  },
  {
    id: 'contact',
    label: 'Contact',
    color: 'lilac',
    dividerImage: '/assets/dividers/contact.webp',
    sheetImage: '/assets/sheets/contact.webp',
  },
  {
    id: 'about',
    label: 'About',
    color: 'green',
    dividerImage: '/assets/dividers/about.webp',
    sheetImage: '/assets/sheets/about.webp',
  },
  {
    id: 'services',
    label: 'Services',
    color: 'wine',
    dividerImage: '/assets/dividers/services.webp',
    sheetImage: '/assets/sheets/services.webp',
  },
  {
    id: 'process',
    label: 'Process',
    color: 'deep-purple',
    dividerImage: '/assets/dividers/process.webp',
    sheetImage: '/assets/sheets/process.webp',
  },
];

export const SECTION_IDS = SECTIONS.map((section) => section.id);

export function getSectionIndex(id) {
  return SECTIONS.findIndex((section) => section.id === id);
}

export function getSection(id) {
  return SECTIONS.find((section) => section.id === id);
}

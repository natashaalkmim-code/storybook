/*
  These PNGs are the actual interface artwork.

  shoulderYRatio is the Y position of the folder's long horizontal shoulder,
  divided by the PNG width. measureScene() aligns those visual anchors at an
  equal interval, so the visible divider spacing stays uniform even though the
  source PNG canvases have different transparent padding.

  sheetXRatio / sheetTopRatio / sheetWidthRatio reproduce the loose-paper
  composition from the supplied Storybook mockup. They are viewport-relative,
  so the arrangement scales rather than being tied to one screenshot size.
*/
export const SECTIONS = [
  {
    id: 'projects',
    label: 'Projects',
    dividerImage: '/assets/dividers/projects.png',
    dividerRatio: 1611 / 2048,
    shoulderYRatio: 150 / 1611,
    tabX: 0.155,

    // Wide pale sheet leaning up to the right, behind Projects.
    sheetImage: '/assets/sheets/sheet-c.png',
    sheetRatio: 800 / 909,
    sheetWidthRatio: 0.424,
    sheetXRatio: -0.221,
    sheetTopRatio: 0.222,
    sheetHitClip: 'polygon(0% 7.8%, 89.5% 0%, 100% 92.1%, 10.4% 100%)',
  },
  {
    id: 'contact',
    label: 'Contact',
    dividerImage: '/assets/dividers/contact.png',
    dividerRatio: 1792 / 1918,
    shoulderYRatio: 157 / 1792,
    tabX: 0.52,

    // Pale sheet on the right, behind Contact.
    sheetImage: '/assets/sheets/sheet-a.png',
    sheetRatio: 842 / 952,
    sheetWidthRatio: 0.427,
    sheetXRatio: 0.231,
    sheetTopRatio: 0.294,
    sheetHitClip: 'polygon(17.4% 0%, 100% 12.9%, 82.4% 100%, 0% 87%)',
  },
  {
    id: 'about',
    label: 'About',
    dividerImage: '/assets/dividers/about.png',
    dividerRatio: 1792 / 1485,
    shoulderYRatio: 119 / 1792,
    tabX: 0.315,

    // The reference composition has a dark textured paper here. Reuse the
    // supplied Storybook background texture instead of inventing a new asset.
    sheetImage: '/assets/sheets/sheet-dark.png',
    sheetRatio: 1234 / 787,
    sheetWidthRatio: 0.67,
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

    // Narrow pale sheet on the right, behind Services.
    sheetImage: '/assets/sheets/sheet-b.png',
    sheetRatio: 446 / 870,
    sheetWidthRatio: 0.22,
    sheetXRatio: 0.271,
    sheetTopRatio: 0.595,
    sheetHitClip: 'polygon(15.4% 0%, 100% 3.5%, 84.4% 100%, 0% 96.4%)',
  },
  {
    id: 'process',
    label: 'Process',
    dividerImage: '/assets/dividers/process.png',
    dividerRatio: 1792 / 792,
    shoulderYRatio: 199 / 1792,
    tabX: 0.5,

    // Wide pale sheet on the left, behind Process.
    sheetImage: '/assets/sheets/sheet-d.png',
    sheetRatio: 720 / 772,
    sheetWidthRatio: 0.387,
    sheetXRatio: -0.247,
    sheetTopRatio: 0.67,
    sheetHitClip: 'polygon(13% 0%, 100% 11%, 86.9% 100%, 0% 88.7%)',
  },
];

export function getSectionIndex(id) {
  return SECTIONS.findIndex((section) => section.id === id);
}

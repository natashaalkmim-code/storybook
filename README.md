# Storybook Studio — image-based 3D folder site

This rebuild uses the supplied artwork directly:

- `public/assets/background/storybook-background.png` — the dark textile background + Storybook Studio mark
- `public/assets/dividers/projects.png`
- `public/assets/dividers/contact.png`
- `public/assets/dividers/about.png`
- `public/assets/dividers/services.png`
- `public/assets/dividers/process.png`
- `public/assets/sheets/sheet-a.png` through `sheet-d.png`

The folder silhouettes, texture, tab labels and paper silhouettes are **not recreated in CSS**.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## The geometry

Edit `src/config/stackConfig.js`.

The important values are:

- `dividerYStep`: one identical vertical interval between every divider
- `dividerZStep`: one identical 3D depth interval between every divider
- `sheetBetweenRatio`: where the paper sits inside that interval
- `sheetBehindZRatio`: how far behind its own divider the paper sits
- `rotateX`: how strongly the whole stack tilts into 3D perspective
- `perspective`: camera depth
- `dividerWidthRatio`: overall folder scale

Every divider position is calculated from its array index. There are no per-folder `translateY` / `translateZ` magic numbers.

## Why the sheet is really behind the divider

For divider `i`, the divider depth is:

```js
index * dividerZStep
```

Its sheet is:

```js
dividerZ - dividerZStep * sheetBehindZRatio
```

So the sheet is always farther from the camera than its own divider. For dividers after the first, that sheet still sits in front of the divider behind it, which places it inside the fixed 3D interval.

The sheet's top edge also lands mathematically inside the uniform vertical interval between consecutive folder tops.

## Content

Edit `src/data/content.js`.

## Deploy

Push this folder to GitHub and import the repository in Vercel. Vercel will detect Vite automatically. `vercel.json` keeps direct routes such as `/projects` working on refresh.

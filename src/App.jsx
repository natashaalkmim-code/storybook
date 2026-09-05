import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StorybookScene from './components/StorybookScene';

// Both routes render the SAME StorybookScene instance. The stack, all five
// dividers and all five sheets stay mounted the whole time — the URL just
// tells FolderStack which one (if any) should be open. That's what keeps the
// GSAP timelines continuous across navigation instead of remounting and
// jump-cutting on every route change.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorybookScene />} />
        <Route path="/:sectionId" element={<StorybookScene />} />
      </Routes>
    </BrowserRouter>
  );
}

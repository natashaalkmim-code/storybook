import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StorybookScene from './components/StorybookScene';

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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import StoryPage from './features/story/StoryPage.jsx';

createRoot(document.getElementById('app')).render(
  <StrictMode><StoryPage /></StrictMode>,
);

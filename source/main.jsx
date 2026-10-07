import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExperiencePage } from './features/experience/ExperiencePage.jsx';
import './styles/experience-loader.css';
import './styles/experience-vendor.css';
import './styles/experience.css';

// The preserved canvas engine owns document-wide state and loads once per document.
createRoot(document.getElementById('app')).render(<ExperiencePage />);

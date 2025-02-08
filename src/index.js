import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ReleaseNotesGenerator from './components/ReleaseNotesGenerator';

ReactDOM.render(
  <React.StrictMode>
    <ReleaseNotesGenerator />
  </React.StrictMode>,
  document.getElementById('root')
);
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReleaseNotesGenerator from './components/ReleaseNotesGenerator';

ReactDOM.render(
  <React.StrictMode>
    <ReleaseNotesGenerator />
  </React.StrictMode>,
  document.getElementById('root')
);
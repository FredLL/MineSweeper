import * as React from "react";
import { createRoot } from "react-dom/client";
import queryString from "query-string";
import { Game } from "./Game";

// PWA stuff
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then(registration => {
      // tslint:disable:no-console
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
} else {
  console.log('SW not available');
}

// URL parameters and default values
let rows = 9;
let cols = 9;
let nbMines = 10;
let longClickDelay: number = undefined;
let nonTurnedShellShowDelay: number = undefined;

const parsed = queryString.parse(location.search);
if (parsed.rows && typeof parsed.rows == 'string') {
  try {
    rows = parseInt(parsed.rows);
  } catch (e) { }
}
if (parsed.cols && typeof parsed.cols == 'string') {
  try {
    cols = parseInt(parsed.cols);
  } catch (e) { }
}
if (parsed.nbMines && typeof parsed.nbMines == 'string') {
  try {
    nbMines = parseInt(parsed.nbMines);
  } catch (e) { }
}
if (parsed.longClickDelay && typeof parsed.longClickDelay == 'string') {
  try {
    longClickDelay = parseInt(parsed.longClickDelay);
  } catch (e) { }
}
if (parsed.nonTurnedShellShowDelay && typeof parsed.nonTurnedShellShowDelay == 'string') {
  try {
    nonTurnedShellShowDelay = parseInt(parsed.nonTurnedShellShowDelay);
  } catch (e) { }
}

const container = document.getElementById('MineSweeper');
if (container) {
  createRoot(container).render(<Game rows={rows} cols={cols} nbMines={nbMines} longClickDelay={longClickDelay} nonTurnedShellShowDelay={nonTurnedShellShowDelay} />)
}

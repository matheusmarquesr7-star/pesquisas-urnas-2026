import { render } from 'preact';
import { html } from './lib/html.js';
import { App } from './App.js';
import { loadData } from './data/index.js';
import './styles/index.css';

const root = document.getElementById('app');

function BootError({ error }) {
  return html`<div class="boot" role="alert">
    <h1>O site não carregou</h1>
    <p>${error.message}</p>
    <button class="button" onClick=${() => location.reload()}>Tentar de novo</button>
  </div>`;
}

try {
  const data = await loadData();
  root.replaceChildren();
  render(html`<${App} data=${data}/>`, root);
} catch (error) {
  root.replaceChildren();
  render(html`<${BootError} error=${error}/>`, root);
}

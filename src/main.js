import { render } from 'preact';
import { html } from './lib/html.js';
import { createGeography } from './map/geography.js';
import { App } from './App.js';
import { loadData } from './data/index.js';
import './styles/index.css';

const root = document.getElementById('app');

function BootError({ error }) {
  return html`<div class="boot" role="alert">
    <h1>O mapa não carregou</h1>
    <p>${error.message}</p>
    <button class="button" onClick=${() => location.reload()}>Tentar de novo</button>
  </div>`;
}

try {
  const loadMap = async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}data/brasil-uf.topo.json`);
    if (!response.ok) throw new Error(`Não foi possível carregar a malha das UFs (HTTP ${response.status}).`);
    return createGeography(await response.json());
  };
  const [geo, data] = await Promise.all([loadMap(), loadData()]);
  root.replaceChildren();
  render(html`<${App} geo=${geo} data=${data}/>`, root);
} catch (error) {
  root.replaceChildren();
  render(html`<${BootError} error=${error}/>`, root);
}

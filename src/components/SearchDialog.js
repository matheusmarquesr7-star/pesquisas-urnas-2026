import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { normalize } from '../lib/format.js';
import { STATES } from '../data/meta.js';
import { Icon } from './Icon.js';

const SUGGESTIONS = ['SP', 'RJ', 'MG'];

function findPlaces(query, institutes, pollsByUf) {
  const needle = normalize(query.trim());
  const states = Object.entries(STATES)
    .filter(([uf, [name]]) => !needle ? SUGGESTIONS.includes(uf) : normalize(name).includes(needle) || uf.toLowerCase() === needle)
    .map(([uf, [name, region]]) => ({ type: 'state', id: uf, name, detail: `UF · ${region}${pollsByUf[uf]?.length ? ` · ${pollsByUf[uf].length} pesquisas de Senado` : ''}`, tag: uf }));
  const insts = institutes
    .filter(name => !needle ? ['Datafolha', 'Quaest', 'AtlasIntel'].includes(name) : normalize(name).includes(needle))
    .map(name => ({ type: 'institute', id: name, name, detail: 'Instituto de pesquisa', tag: name.slice(0, 2).toUpperCase() }));
  return [...states, ...insts];
}

export function SearchDialog({ institutes, pollsByUf, onState, onInstitute, onClose }) {
  const dialog = useRef(), list = useRef();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const places = useMemo(() => findPlaces(query, institutes, pollsByUf), [query]);

  // showModal() dá foco preso, Esc para fechar e devolução do foco.
  useEffect(() => { dialog.current.showModal(); }, []);
  useEffect(() => { list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [active]);

  const pick = place => {
    if (place.type === 'state') onState(place.id);
    else onInstitute(place.id);
    dialog.current.close();
  };

  const onKeyDown = event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive(index => places.length ? (index + step + places.length) % places.length : 0);
    } else if (event.key === 'Enter' && places[active]) {
      event.preventDefault();
      pick(places[active]);
    }
  };

  return html`<dialog class="search-dialog" ref=${dialog} aria-label="Buscar UF ou instituto" onClose=${onClose}
    onClick=${event => { if (event.target === dialog.current) dialog.current.close(); }}>
    <div class="search-field">
      <${Icon} name="search"/>
      <input type="text" role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list"
        aria-activedescendant=${places[active] ? 'search-option-' + active : undefined}
        placeholder="Buscar UF ou instituto" aria-label="Buscar UF ou instituto" autocomplete="off" spellcheck=${false}
        value=${query} onInput=${event => { setQuery(event.currentTarget.value); setActive(0); }} onKeyDown=${onKeyDown}/>
      <button class="icon-button" aria-label="Fechar busca" onClick=${() => dialog.current.close()}><${Icon} name="close"/></button>
    </div>
    ${!query.trim() && html`<p class="search-caption">Sugestões</p>`}
    ${places.length
      ? html`<ul class="search-results" id="search-results" role="listbox" ref=${list}>
          ${places.map((place, index) => html`<li key=${place.type + place.id} id=${'search-option-' + index} role="option"
            aria-selected=${index === active} onClick=${() => pick(place)} onPointerMove=${() => setActive(index)}>
            <span class="place-tag">${place.tag}</span>
            <span class="place-name"><strong>${place.name}</strong><small>${place.detail}</small></span>
            <${Icon} name="right" size=${16}/>
          </li>`)}
        </ul>`
      : html`<p class="empty">Nada encontrado com “${query.trim()}”. Tente o nome da UF, a sigla ou o instituto.</p>`}
    <footer class="search-keys" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>Enter</kbd> abrir</span><span><kbd>Esc</kbd> fechar</span></footer>
  </dialog>`;
}

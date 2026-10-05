import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { normalize, plural } from '../lib/format.js';
import { STATES } from '../data/meta.js';
import { Icon } from './Icon.js';

const SUGGESTIONS = ['SP', 'RJ', 'MG'];

/** Pesquisas distintas (a mesma pesquisa divulgada em VV e VT conta uma vez). */
const distinctPolls = polls => new Set((polls ?? []).map(p => p.inst + (p.div ?? '?'))).size;

/** Sigla exata primeiro, depois nomes que começam com o termo, depois os que só o contêm. */
function rank(needle, name, code) {
  if (code && code.toLowerCase() === needle) return 0;
  const text = normalize(name);
  if (text.startsWith(needle)) return 1;
  if (text.split(/\s+/).some(word => word.startsWith(needle))) return 2;
  return text.includes(needle) ? 3 : null;
}

function findPlaces(query, institutes, pollsByUf) {
  const needle = normalize(query.trim());
  const states = Object.entries(STATES)
    .map(([uf, [name, region]]) => ({ type: 'state', id: uf, name, tag: uf, order: needle ? rank(needle, name, uf) : SUGGESTIONS.includes(uf) ? 1 : null,
      detail: `UF · ${region}${pollsByUf[uf]?.length ? ` · ${plural(distinctPolls(pollsByUf[uf]), 'pesquisa', 'pesquisas')} de Senado` : ''}` }));
  const insts = institutes
    .map(name => ({ type: 'institute', id: name, name, detail: 'Instituto de pesquisa', tag: name.slice(0, 2).toUpperCase(),
      order: needle ? rank(needle, name) : ['Datafolha', 'Quaest', 'AtlasIntel'].includes(name) ? 4 : null }));
  return [...states, ...insts].filter(place => place.order != null).sort((a, b) => a.order - b.order);
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

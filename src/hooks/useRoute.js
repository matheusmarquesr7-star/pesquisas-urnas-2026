import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { STATES } from '../data/meta.js';

export const VIEWS = ['presidente', 'senado', 'institutos', 'metodologia'];
export const BASE_PARAMS = ['validos', 'totais'];

// A URL é a fonte da verdade: #senado/SP?base=validos, #institutos/datafolha?base=totais, #metodologia.
export function parse(hash, institutes = new Set()) {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const [first, second] = path.split('/');
  const params = new URLSearchParams(query);
  const view = VIEWS.includes(first) ? first : 'presidente';
  const code = second?.toUpperCase();
  return {
    view,
    uf: (view === 'presidente' || view === 'senado') && STATES[code] ? code : null,
    inst: view === 'institutos' && institutes.has(second) ? second : null,
    base: BASE_PARAMS.includes(params.get('base')) ? params.get('base') : 'validos',
  };
}

export function toHash({ view, uf, inst, base }) {
  const path = [view, uf ?? inst].filter(Boolean).join('/');
  return view === 'metodologia' ? '#metodologia' : `#${path}?base=${base}`;
}

/** pushState/replaceState podem ser recusados (iframe isolado, por exemplo): a rota continua em memória. */
function writeHistory(method, url) {
  try { history[method](null, '', url); } catch { /* sem histórico: o estado segue só na página */ }
}

export function useRoute(institutes) {
  const read = () => parse(location.hash, institutes);
  const [route, setRoute] = useState(read);
  const latest = useRef(route);
  latest.current = route;

  useEffect(() => {
    const sync = () => setRoute(read());
    addEventListener('popstate', sync);
    addEventListener('hashchange', sync);
    // Normaliza a URL de entrada (ex.: sem hash → #presidente?base=validos) sem criar entrada no histórico.
    writeHistory('replaceState', toHash(latest.current));
    return () => {
      removeEventListener('popstate', sync);
      removeEventListener('hashchange', sync);
    };
  }, []);

  const actions = useMemo(() => {
    // Mudar de tela, de UF ou de instituto cria uma entrada no histórico (o voltar sobe um nível);
    // trocar a base só reescreve a entrada atual.
    const go = (changes, { push = false } = {}) => {
      const next = { ...latest.current, ...changes };
      writeHistory(push ? 'pushState' : 'replaceState', toHash(next));
      latest.current = next;
      setRoute(next);
      if (push) window.dispatchEvent(new CustomEvent('route:navigate'));
    };
    return {
      setView: view => go({ view, uf: null, inst: null }, { push: true }),
      openState: (uf, view) => go({ view: view ?? (latest.current.view === 'senado' ? 'senado' : latest.current.view === 'presidente' ? 'presidente' : 'senado'), uf, inst: null }, { push: true }),
      openInstitute: inst => go({ view: 'institutos', inst, uf: null }, { push: true }),
      back: () => {
        const { uf, inst, view } = latest.current;
        if (uf || inst) go({ uf: null, inst: null }, { push: true });
        else if (view === 'metodologia') go({ view: 'presidente' }, { push: true });
      },
      setBase: base => go({ base }),
    };
  }, []);

  return { ...route, ...actions };
}

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
  const path = [view, view === 'metodologia' ? null : uf ?? inst].filter(Boolean).join('/');
  return `#${path}?base=${base}`;
}

/** A tela-mãe de cada rota: UF e instituto sobem para a tela da seção; a metodologia volta ao painel. */
export function parentOf(route) {
  if (route.uf || route.inst) return { ...route, uf: null, inst: null };
  if (route.view === 'metodologia') return { ...route, view: 'presidente' };
  return null;
}

/**
 * pushState/replaceState podem ser recusados (iframe isolado, por exemplo): a rota continua em memória.
 * Cada entrada guarda em `state.from` o endereço de onde se veio, para o "voltar" do app reaproveitar o histórico.
 */
function writeHistory(method, url, state = null) {
  try { history[method](state, '', url); } catch { /* sem histórico: o estado segue só na página */ }
}
const currentState = () => { try { return history.state; } catch { return null; } };

export function useRoute(institutes) {
  const read = () => parse(location.hash, institutes);
  const [route, setRoute] = useState(read);
  const latest = useRef(route);
  const keepBase = useRef(null);
  latest.current = route;

  useEffect(() => {
    // Ao voltar pelo botão do app, a base escolhida (válidos/totais) acompanha a tela anterior.
    const sync = () => {
      const next = read();
      if (keepBase.current && keepBase.current !== next.base) {
        next.base = keepBase.current;
        writeHistory('replaceState', toHash(next), currentState());
      }
      keepBase.current = null;
      latest.current = next;
      setRoute(next);
    };
    addEventListener('popstate', sync);
    addEventListener('hashchange', sync);
    // Normaliza a URL de entrada (ex.: sem hash → #presidente?base=validos) sem criar entrada no histórico.
    writeHistory('replaceState', toHash(latest.current), currentState());
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
      if (push) writeHistory('pushState', toHash(next), { from: toHash(latest.current) });
      else writeHistory('replaceState', toHash(next), currentState());
      latest.current = next;
      setRoute(next);
      if (push) window.dispatchEvent(new CustomEvent('route:navigate'));
    };
    return {
      setView: view => go({ view, uf: null, inst: null }, { push: true }),
      openState: (uf, view) => go({ view: view ?? (latest.current.view === 'senado' ? 'senado' : latest.current.view === 'presidente' ? 'presidente' : 'senado'), uf, inst: null }, { push: true }),
      openInstitute: inst => go({ view: 'institutos', inst, uf: null }, { push: true }),
      // Sobe um nível. Se a entrada anterior do histórico já é a tela-mãe (ou, na metodologia, a tela
      // de onde se veio), volta no histórico; senão troca a entrada atual, sem empilhar outra.
      back: () => {
        const parent = parentOf(latest.current);
        if (!parent) return;
        const from = currentState()?.from;
        const fromRoute = from ? parse(from, institutes) : null;
        if (from && (from.split('?')[0] === toHash(parent).split('?')[0] || latest.current.view === 'metodologia')) {
          try { keepBase.current = latest.current.base; history.back(); return; } catch { keepBase.current = null; }
        }
        go(latest.current.view === 'metodologia' && fromRoute ? { ...fromRoute, base: latest.current.base } : parent);
        window.dispatchEvent(new CustomEvent('route:navigate'));
      },
      setBase: base => go({ base }),
    };
  }, []);

  return { ...route, ...actions };
}

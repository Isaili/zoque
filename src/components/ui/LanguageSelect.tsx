'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';

// Traducción automática con el widget de Google Translate, manejado desde nuestro propio selector.
// El script de Google solo se carga cuando alguien elige otro idioma (o ya lo había elegido antes).

export const LANGUAGES = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'zh-CN', label: '中文', short: '中文' },
  { code: 'ja', label: '日本語', short: '日本' },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (options: object, elementId: string) => unknown } };
  }
}

const COOKIE = 'googtrans';
const SCRIPT_ID = 'google-translate-script';
const ELEMENT_ID = 'google_translate_element';

const readLanguage = (): LanguageCode => {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/es\/([^;]+)/);
  const code = match ? decodeURIComponent(match[1]) : 'es';
  return (LANGUAGES.some((l) => l.code === code) ? code : 'es') as LanguageCode;
};

// La cookie se pone en el dominio actual y en el "padre" porque Google la busca en ambos
const writeCookie = (value: string | null) => {
  const domains = ['', `;domain=${window.location.hostname}`, `;domain=.${window.location.hostname.split('.').slice(-2).join('.')}`];
  for (const domain of domains) {
    document.cookie = value
      ? `${COOKIE}=${value};path=/${domain}`
      : `${COOKIE}=;path=/${domain};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

// Google cambia el texto de la página por su cuenta; React luego puede intentar quitar nodos que ya no son
// suyos. Este parche (sugerido por el equipo de React) evita que la página falle por eso.
let patched = false;
const patchDomForTranslation = () => {
  if (patched || typeof Node !== 'function') return;
  patched = true;
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, reference: Node | null): T {
    if (reference && reference.parentNode !== this) return node;
    return insertBefore.call(this, node, reference) as T;
  };
};

const loadGoogle = () =>
  new Promise<void>((resolve) => {
    patchDomForTranslation();
    if (document.getElementById(SCRIPT_ID)) return resolve();
    // Contenedor oculto donde Google pone su selector (uno solo para toda la página)
    if (!document.getElementById(ELEMENT_ID)) {
      const holder = document.createElement('div');
      holder.id = ELEMENT_ID;
      holder.style.display = 'none';
      document.body.appendChild(holder);
    }
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'es', includedLanguages: LANGUAGES.map((l) => l.code).join(','), autoDisplay: false },
          ELEMENT_ID,
        );
      }
      resolve();
    };
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  });

// Elige el idioma en el selector oculto de Google (aparece un momento después de cargar el script)
const applyLanguage = async (code: LanguageCode) => {
  await loadGoogle();
  for (let attempt = 0; attempt < 40; attempt++) {
    const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
      return;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
};

const subscribeNoop = () => () => {};

/* Selector de idioma con el diseño de la página */
export function LanguageSelect({ className = '', menuAlign = 'right' }: { className?: string; menuAlign?: 'right' | 'left' }) {
  const saved = useSyncExternalStore(subscribeNoop, readLanguage, () => 'es' as LanguageCode);
  const [picked, setPicked] = useState<LanguageCode | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = picked ?? saved;
  const currentLanguage = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  // Si en una visita anterior se eligió otro idioma, se vuelve a cargar el traductor
  useEffect(() => {
    if (saved !== 'es') void loadGoogle();
  }, [saved]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (code: LanguageCode) => {
    setOpen(false);
    if (code === current) return;
    if (code === 'es') {
      // Volver al original: lo más confiable es quitar la traducción y recargar
      writeCookie(null);
      window.location.reload();
      return;
    }
    setPicked(code);
    writeCookie(`/es/${code}`);
    void applyLanguage(code);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`} translate="no">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${currentLanguage.label}`}
        className="flex h-11 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
      >
        <Globe className="h-4 w-4" aria-hidden />
        {currentLanguage.short}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Elegir idioma"
          className={`absolute top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-zoque-900/95 p-1 shadow-2xl backdrop-blur-md ${
            menuAlign === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {LANGUAGES.map(({ code, label }) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === current}
                onClick={() => choose(code)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  code === current ? 'bg-white/10 text-gold' : 'text-white/85 hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
                {code === current && <Check className="h-4 w-4" aria-hidden />}
              </button>
            </li>
          ))}
          <li className="px-3 pb-1 pt-2 text-[10px] text-white/40">Traducción automática de Google</li>
        </ul>
      )}
    </div>
  );
}

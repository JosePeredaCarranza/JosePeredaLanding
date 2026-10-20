'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const api = window.turnstile;
    if (!ready || !api || !container.current) return;
    const id = api.render(container.current, {
      sitekey: siteKey,
      action: 'contact',
      theme: 'light',
      size: 'flexible',
      callback: (token: string) => {
        setFailed(false);
        onToken(token);
      },
      'expired-callback': () => onToken(''),
      'error-callback': () => {
        onToken('');
        setFailed(true);
      },
    });
    return () => {
      api.remove(id);
    };
  }, [ready, siteKey, onToken]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
      />
      <div ref={container} />
      {failed && (
        <p role="alert">
          No se pudo cargar la verificación. Recarga la página para intentarlo de nuevo.
        </p>
      )}
    </>
  );
}

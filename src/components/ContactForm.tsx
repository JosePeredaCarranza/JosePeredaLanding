'use client';
import { useId, useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { Turnstile } from './Turnstile';

const contactEndpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || '';
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const workerEnabled = Boolean(contactEndpoint && turnstileSiteKey);
import { sitePath, staticExport } from '@/lib/paths';
import type { Content } from '@/lib/content';
export function ContactForm({ content: c, email }: { email: string; content: Content['contact'] }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error' | 'mail'>('idle');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [privacyError, setPrivacyError] = useState(false);
  const privacyErrorId = useId();
  const privacyLabelParts = c.privacyLabel.split(/(política de privacidad)/i);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (workerEnabled && !turnstileToken) return;
    const form = event.currentTarget;
    setStatus('pending');
    try {
      const data = Object.fromEntries(new FormData(form));
      if (staticExport && !workerEnabled) {
        const body = [
          `Nombre: ${data.name}`,
          `WhatsApp: ${data.phone || 'No indicado'}`,
          `Correo: ${data.email}`,
          `Tipo de proyecto: ${data.service}`,
          `Etapa: ${data.stage}`,
          `Mensaje: ${data.message}`,
        ].join('\n');
        window.location.href = `mailto:${email}?subject=${encodeURIComponent('Consulta de proyecto')}&body=${encodeURIComponent(body)}`;
        setStatus('mail');
        return;
      }
      const response = await fetch(workerEnabled ? contactEndpoint : sitePath('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...(workerEnabled ? { turnstileToken } : {}) }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error();
      setStatus('success');
      form.reset();
      setPrivacyError(false);
    } catch {
      setStatus('error');
    } finally {
      if (workerEnabled) {
        setTurnstileToken('');
        setChallengeVersion((version) => version + 1);
      }
    }
  }
  return (
    <form onSubmit={submit} className="contact-form">
      <label>
        {c.nameLabel}
        <input name="name" autoComplete="name" required maxLength={120} />
      </label>
      <div className="field-pair">
        <label>
          {c.emailLabel}
          <input name="email" type="email" autoComplete="email" required maxLength={200} />
        </label>
        <label>
          {c.phoneLabel}
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            pattern={'[+0-9\\(\\) .\\-]{7,25}'}
            maxLength={25}
          />
        </label>
      </div>
      <label>
        {c.serviceLabel}
        <select name="service" required defaultValue="">
          <option value="" disabled>
            {c.serviceLabel}
          </option>
          {c.projectTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        {c.stageLabel}
        <select name="stage" required defaultValue="">
          <option value="" disabled>
            {c.stageLabel}
          </option>
          {c.stages.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        {c.messageLabel}
        <textarea name="message" rows={5} required minLength={10} maxLength={5000} />
      </label>
      <div className="honey" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="privacy-field">
        <label className="check">
          <input
            type="checkbox"
            name="privacy"
            required
            aria-invalid={privacyError || undefined}
            aria-describedby={privacyError ? privacyErrorId : undefined}
            onInvalid={(event) => {
              event.preventDefault();
              setPrivacyError(true);
            }}
            onChange={() => setPrivacyError(false)}
          />
          <span>
            {privacyLabelParts.length > 1 ? (
              privacyLabelParts.map((part, index) =>
                index % 2 === 1 ? (
                  <a key={index} href={sitePath('/privacidad/')} target="_blank" rel="noopener">
                    {part}
                  </a>
                ) : (
                  part
                ),
              )
            ) : (
              <a href={sitePath('/privacidad/')} target="_blank" rel="noopener">
                {c.privacyLabel}
              </a>
            )}
          </span>
        </label>
        {privacyError && (
          <p className="privacy-error" id={privacyErrorId} role="alert">
            <FiAlertCircle aria-hidden="true" />
            Acepta la política de privacidad para continuar.
          </p>
        )}
      </div>
      {workerEnabled && (
        <Turnstile key={challengeVersion} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      )}
      <button
        className="button primary"
        disabled={status === 'pending' || (workerEnabled && !turnstileToken)}
      >
        {status === 'pending' ? c.pendingLabel : c.submitLabel}
        <span aria-hidden="true">↗</span>
      </button>
      {staticExport && !workerEnabled && (
        <p className="contact-hint">
          {c.mailHint} <a href={`mailto:${email}`}>{email}</a>
        </p>
      )}
      <p role="status" aria-live="polite" className={`form-status ${status}`}>
        {status === 'mail'
          ? c.mailStatus
          : status === 'success'
            ? c.successMessage
            : status === 'error'
              ? c.errorMessage
              : ''}
      </p>
    </form>
  );
}

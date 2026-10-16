import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { type Env } from './index';

const env: Env = {
  ALLOWED_ORIGINS: 'https://poqata.com',
  TURNSTILE_SECRET_KEY: 'test-secret',
  RESEND_API_KEY: 'test-key',
  CONTACT_FROM: 'Portfolio <contact@example.com>',
  CONTACT_TO: 'owner@example.com',
};
const data = {
  name: 'Test',
  email: 'visitor@example.com',
  phone: '',
  service: 'Web',
  stage: 'Idea',
  message: 'Proyecto de ejemplo',
  privacy: 'on',
  website: '',
  turnstileToken: 'test-token',
};
const request = (body: unknown = data, origin = 'https://poqata.com') =>
  new Request('https://worker.example/contact', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

test('rejects untrusted origins before contacting providers', async () => {
  assert.equal((await worker.fetch(request(data, 'https://attacker.example'), env)).status, 403);
});
test('supports preflight for the allowed website', async () => {
  const response = await worker.fetch(
    new Request('https://worker.example/contact', {
      method: 'OPTIONS',
      headers: { Origin: 'https://poqata.com' },
    }),
    env,
  );
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://poqata.com');
});
test('rejects missing token, consent, honeypot and oversized input', async () => {
  for (const body of [
    { ...data, turnstileToken: '' },
    { ...data, privacy: '' },
    { ...data, website: 'spam' },
  ]) {
    assert.equal((await worker.fetch(request(body), env)).status, 400);
  }
  assert.equal(
    (await worker.fetch(request({ ...data, message: 'x'.repeat(21000) }), env)).status,
    413,
  );
});
test('validates Turnstile before sending; provider failures are not successes', async (t) => {
  let calls: { url: string; body: Record<string, unknown> }[] = [];
  let verification = { success: false, hostname: 'poqata.com', action: 'contact' };
  let mailStatus = 200;
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return url.includes('siteverify')
      ? Response.json(verification)
      : Response.json({ id: 'mock-id' }, { status: mailStatus });
  });
  for (const value of [
    verification,
    { success: true, hostname: 'other.example', action: 'contact' },
    { success: true, hostname: 'poqata.com', action: 'login' },
  ]) {
    verification = value;
    calls = [];
    assert.equal((await worker.fetch(request(), env)).status, 400);
    assert.equal(calls.length, 1);
  }
  verification = { success: true, hostname: 'poqata.com', action: 'contact' };
  calls = [];
  assert.equal((await worker.fetch(request(), env)).status, 200);
  assert.equal(calls[1].body.reply_to, data.email);
  assert.deepEqual(calls[1].body.to, [env.CONTACT_TO]);
  mailStatus = 429;
  assert.equal((await worker.fetch(request(), env)).status, 502);
});

import { z } from 'zod';
import { renderInquiryEmail } from './email';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional(),
  email: z.email().max(200),
  phone: z.string().max(25).optional(),
  service: z.string().trim().min(1).max(120),
  stage: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(5000),
  privacy: z.literal('on'),
  website: z.string().max(0).optional(),
  turnstileToken: z.string().min(1).max(2048),
});

export interface Env {
  ALLOWED_ORIGINS: string;
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_FROM: string;
  CONTACT_TO: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim());
    const headers = {
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
      'Cache-Control': 'no-store',
    };
    const reply = (status: number, error?: string) =>
      Response.json(error ? { error } : { ok: true }, { status, headers });

    if (!origin || !allowed.includes(origin)) {
      return Response.json({ error: 'Origen no permitido' }, { status: 403 });
    }
    if (new URL(request.url).pathname !== '/contact') return reply(404, 'No encontrado');
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...headers,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    if (request.method !== 'POST') return reply(405, 'Método no permitido');
    if (!request.headers.get('Content-Type')?.startsWith('application/json'))
      return reply(415, 'Se requiere JSON');
    if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.CONTACT_FROM || !env.CONTACT_TO)
      return reply(503, 'Contacto no disponible');

    try {
      // Limit the actual stream, including requests without Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return reply(400, 'Solicitud vacía');
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 20000) {
          await reader.cancel();
          return reply(413, 'Solicitud demasiado extensa');
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      let payload: unknown;
      try {
        payload = JSON.parse(new TextDecoder().decode(bytes));
      } catch {
        return reply(400, 'JSON inválido');
      }
      const parsed = schema.safeParse(payload);
      if (!parsed.success) return reply(400, 'Revisa los campos del formulario');
      const data = parsed.data;

      const verification = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: data.turnstileToken,
            remoteip: request.headers.get('CF-Connecting-IP') || undefined,
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!verification.ok) return reply(502, 'No se pudo verificar la solicitud');
      const result = (await verification.json()) as {
        success: boolean;
        hostname?: string;
        action?: string;
      };
      if (
        !result.success ||
        result.hostname !== new URL(origin).hostname ||
        result.action !== 'contact'
      ) {
        return reply(400, 'Verifica nuevamente que eres una persona');
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM,
          to: [env.CONTACT_TO],
          reply_to: data.email,
          subject: 'Nueva consulta desde el portfolio',
          html: renderInquiryEmail(data),
          text: [
            `Nombre: ${data.name}`,
            `Empresa: ${data.company || 'No indicada'}`,
            `Correo: ${data.email}`,
            `WhatsApp: ${data.phone || 'No indicado'}`,
            `Tipo de proyecto: ${data.service}`,
            `Etapa: ${data.stage}`,
            '',
            data.message,
          ].join('\n'),
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) return reply(502, 'No se pudo enviar la consulta');
      return reply(200);
    } catch {
      return reply(502, 'Servicio temporalmente no disponible');
    }
  },
};

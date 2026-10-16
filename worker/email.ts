interface InquiryEmail {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service: string;
  stage: string;
  message: string;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
}

function field(label: string, value: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3e9e7;border-radius:12px;background:#ffffff"><tr><td style="padding:18px"><p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#344a43">${label}</p><div style="padding:16px;background:#f3f5f3;border-radius:8px;color:#273932;font-size:15px;line-height:1.6;word-break:break-word">${escapeHtml(value).replace(/\r?\n/g, '<br>')}</div></td></tr></table>`;
}

export function renderInquiryEmail(data: InquiryEmail, now = new Date()): string {
  const date = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(now);
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nueva consulta</title></head>
<body style="margin:0;background:#f2f5f3;font-family:Arial,sans-serif;color:#273932">
<div style="display:none;max-height:0;overflow:hidden">Nueva consulta de ${escapeHtml(data.name)} sobre ${escapeHtml(data.service)}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:660px;background:#ffffff;border:1px solid #e3e9e7;border-radius:16px">
<tr><td style="padding:28px 24px 22px;border-bottom:1px solid #e3e9e7"><p style="font-size:12px;letter-spacing:2px;color:#54766a;margin:0 0 14px">PORTFOLIO · NUEVA CONSULTA</p><h1 style="font-size:23px;line-height:1.4;margin:0;color:#263b33">Ha llegado una nueva solicitud de <span style="color:#bf624c">${escapeHtml(data.name)}</span></h1><p style="font-size:13px;line-height:1.6;color:#63766e;margin:12px 0 0">${escapeHtml(date)} · Hora de Perú</p></td></tr>
<tr><td style="padding:22px 24px 0">${field('Correo electrónico', data.email)}</td></tr>
<tr><td style="padding:12px 24px 0">${field('Empresa u organización', data.company || 'No indicada')}</td></tr>
<tr><td style="padding:12px 24px 0">${field('WhatsApp', data.phone || 'No indicado')}</td></tr>
<tr><td style="padding:12px 24px 0">${field('Tipo de solución', data.service)}</td></tr>
<tr><td style="padding:12px 24px 0">${field('Etapa del proyecto', data.stage)}</td></tr>
<tr><td style="padding:12px 24px 24px">${field('Nos contó esto sobre el proyecto', data.message)}</td></tr>
<tr><td style="padding:20px 24px;background:#f7f9f7;border-top:1px solid #e3e9e7"><p style="font-size:13px;line-height:1.6;color:#5a7166;margin:0">Responde a este correo para contactar directamente con la persona que envió la consulta.</p></td></tr>
</table></td></tr></table></body></html>`;
}

# Contacto: Cloudflare Worker + Turnstile + Resend

El frontend sigue en GitHub Pages. El Worker recibe POST /contact, valida datos y el token de Turnstile (hostname y acción contact), y solicita a Resend el envío. Las claves privadas nunca se incluyen en Next.js ni en GitHub Pages.

## Activación

1. Verificar el dominio remitente en Resend.
2. Crear un widget Turnstile para poqata.com (y www.poqata.com si se utiliza). Guardar su site key pública.
3. Autenticar Wrangler con `npx wrangler login`.
4. Guardar estos cuatro valores mediante `npx wrangler secret put NOMBRE --config worker/wrangler.json`:
   - TURNSTILE_SECRET_KEY
   - RESEND_API_KEY
   - CONTACT_FROM: dirección de un dominio verificado en Resend.
   - CONTACT_TO: correo que recibirá las consultas.
5. Ejecutar `npm run worker:deploy`. Copiar la URL del Worker y añadir /contact.
6. En GitHub → Settings → Secrets and variables → Actions → Variables, configurar CONTACT_ENDPOINT y TURNSTILE_SITE_KEY. Volver a ejecutar Deploy Next.js site to Pages.
7. Para despliegues automáticos del Worker: añadir los secretos CLOUDFLARE_API_TOKEN (permiso de edición Workers Scripts) y CLOUDFLARE_ACCOUNT_ID, y la variable WORKER_DEPLOY_ENABLED=true.

Mientras falten URL o site key, el sitio estático conserva el contacto por correo. Las dos variables deben configurarse juntas. El Worker rechaza las consultas si faltan sus secretos.

`npm run worker:test` usa proveedores simulados y no envía correos. `npm run worker:check` comprueba el empaquetado sin desplegar. La prueba de entrega real requiere completar la configuración anterior.

## Dominio y estilos

GitHub Pages está configurado con poqata.com. `public/CNAME` conserva ese dominio. La compilación de Actions obtiene base_path y base_url de configure-pages: con dominio propio debe generar rutas /_next/, sin /JosePeredaLanding/. Si se cambia el dominio hay que reconstruir la web y actualizar los orígenes permitidos del Worker y Turnstile.

Documentación: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ y https://resend.com/docs/api-reference/emails/send-email

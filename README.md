# José Pereda — Next.js + Sanity

Landing basada en el PDF facilitado, sin productos digitales ni enlaces a esa sección. La oferta de desarrollo de tiendas virtuales se conserva como servicio.

## Desarrollo

Requiere Node 22.12 o superior. Desde esta carpeta:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Web: http://localhost:3000. Studio independiente: `npm run studio`, http://localhost:3333. La web está construida íntegramente con Next.js App Router y TypeScript. Sanity Studio usa su compilador oficial independiente.

## Sanity

Proyecto: `16asym1c`. Dataset público verificado: `production`. Contenido inicial importado. Dataset privado `inquiries` creado.

Editor publicado: https://jose-pereda-16asym1c.sanity.studio/ Configura las variables del ejemplo; nunca subas tokens al repositorio. Para el Studio, configura también `SANITY_STUDIO_PROJECT_ID` y `SANITY_STUDIO_DATASET` en `.env` o en el entorno del terminal. Los valores por defecto ya apuntan al proyecto indicado.

1. Crea un token Editor para el servidor en Sanity Manage y colócalo en `SANITY_API_WRITE_TOKEN`.
2. Ejecuta `npm run seed`. Importa el contenido del PDF y los dos recursos WebP. No sobrescribe una landing existente.
3. Abre Studio, edita «Contenido de la landing» y publica.
4. La web refleja los cambios con revalidación de 60 segundos. Añade los orígenes de Studio en CORS de Sanity.

Editables: marca y logo, navegación, portada, retrato, estadísticas, proceso, servicios, distintivos, proyectos, imágenes, testimonios, enlaces, textos y opciones del formulario, SEO, privacidad, pie, contactos, redes, colores y orden/visibilidad de secciones. La tipografía es Inter (identificada en el PDF), servida localmente. No se cargan otras fuentes externas.

Sin conexión a Sanity se muestra el contenido inicial del PDF. Las imágenes pendientes tienen superficies de color, sin SVG de relleno. Los testimonios ficticios, el teléfono provisional y enlaces de proyectos sin destino no se publican. Las redes se muestran con sus SVG oficiales de react-icons al añadir URLs reales en Studio.

## Formulario

`POST /api/contact` valida los datos en el servidor y guarda cada solicitud en Sanity. Se consulta en «Solicitudes de proyectos»; no envía correos automáticamente. El consentimiento comercial es opcional. Los mensajes de éxito aparecen únicamente después de guardar. Sin token o proyecto responde 503, nunca simula un envío correcto.

**Privacidad de las solicitudes:** los documentos `inquiry` en un dataset público pueden ser consultados públicamente. Antes de habilitar el formulario en producción, configure un dataset privado separado para solicitudes y el servidor conforme se indica en la configuración del proyecto.

## Despliegue con GitHub Actions

Workflow incluido desde la implementación: `.github/workflows/deploy.yml`. Cada PR y push a main verifica TypeScript, compila Next y compila Studio. Se usa Vercel como destino inicial.

Configura un proyecto Vercel con este repositorio y añade sus variables de entorno de `.env.example` (URL pública real incluida). En GitHub → Settings → Secrets and variables → Actions:

- Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Variable `DEPLOY_ENABLED=true` activa el despliegue web después de las verificaciones.
- Para publicar Studio: secret `SANITY_AUTH_TOKEN`, variables `SANITY_STUDIO_HOSTNAME` y `STUDIO_DEPLOY_ENABLED=true`.
- Opcionales: `SANITY_PROJECT_ID`, `SANITY_DATASET`.

Usa un environment `production` con las reglas de aprobación que prefieras. Desactiva el despliegue automático de la integración Git de Vercel si quieres que solo Actions publique. El workflow usa `npm ci` y el lockfile incluido.

## Verificación

```sh
npm run typecheck
npm run build
npm run studio:build
```

Todas las imágenes locales son WebP; Studio valida ese formato y el CDN lo solicita explícitamente. Las imágenes tienen `draggable=false`, CSS antirarrastre y una capa transparente encima. Esto evita el gesto de arrastrar, no impide descargar una imagen desde las herramientas del navegador.

## Estado de entrega

Web compilada y comprobada en escritorio y móvil. Studio compilado y publicado; esquemas e imágenes importados. Pendiente: token de servidor para activar recepción de solicitudes, otros perfiles sociales, imágenes y URLs definitivas de proyectos, y credenciales Vercel en GitHub Actions para el despliegue web. La sección de productos está excluida del código y del modelo editorial.

## GitHub Pages

El workflow `nextjs.yml` publica la exportación estática con Node 22, la ruta base proporcionada por Pages y el contenido publicado de Sanity. Las imágenes locales y los enlaces de privacidad incluyen la ruta base. Los cambios en Sanity se reflejan tras volver a ejecutar el workflow (Run workflow); también se admite `repository_dispatch` con tipo `sanity-published` para conectar un servicio de webhook autenticado. No se configura automáticamente ese servicio.

GitHub Pages no ejecuta API de Next.js: en este destino, el formulario prepara un correo que el visitante revisa y envía desde su aplicación. No guarda solicitudes en Sanity ni muestra una confirmación de envío. El despliegue en Vercel conserva el endpoint `/api/contact` y el guardado privado cuando se configura el token del servidor.

Prueba de exportación: establecer `NEXT_PUBLIC_STATIC_EXPORT=true`, `NEXT_PUBLIC_BASE_PATH=/JosePeredaLanding`, `NEXT_PUBLIC_SANITY_PROJECT_ID=16asym1c`, `NEXT_PUBLIC_SANITY_DATASET=production` y ejecutar `npm run build`. No usar `next start` para servir `out/`.

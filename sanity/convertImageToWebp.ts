/** Converts browser-readable images before they enter Sanity's asset pipeline. */
export async function convertImageToWebp(file: File): Promise<File> {
  if (
    !file.type.startsWith('image/') &&
    !/\.(png|jpe?g|webp|gif|avif|bmp|svg|ico|tiff?|heic|heif)$/i.test(file.name)
  ) {
    throw new Error('Selecciona una imagen. Los archivos ZIP no son compatibles.');
  }
  if (file.size > 30 * 1024 * 1024)
    throw new Error('La imagen supera los 30 MB. Reduce su tamaño antes de subirla.');
  const source = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(
          new Error(
            'No se pudo leer esta imagen. Prueba con PNG, JPG, WebP, GIF, AVIF, BMP o SVG.',
          ),
        );
      image.src = source;
    });
    const { naturalWidth: width, naturalHeight: height } = image;
    if (!width || !height) throw new Error('La imagen no tiene dimensiones válidas.');
    const scale = Math.min(1, 4096 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo preparar la conversión de la imagen.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result?.type === 'image/webp'
            ? resolve(result)
            : reject(
                new Error(
                  'Este navegador no puede convertir a WebP. Prueba con una versión actualizada.',
                ),
              ),
        'image/webp',
        0.9,
      );
    });
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
  } finally {
    image.src = '';
    URL.revokeObjectURL(source);
  }
}

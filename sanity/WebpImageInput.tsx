import { useEffect, useRef, useState } from 'react';
import { Button, Card, Stack, Text } from '@sanity/ui';
import { PatchEvent, set, setIfMissing, unset, useClient, type ObjectInputProps } from 'sanity';
import { filter, firstValueFrom, fromEvent, map, takeUntil, timeout } from 'rxjs';
import { convertImageToWebp } from './convertImageToWebp';

export function WebpImageInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion: '2026-09-01' });
  const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const previousUpload = Boolean((props.value as { _upload?: unknown } | undefined)?._upload);

  useEffect(() => () => controller.current?.abort(), []);

  async function upload(file: File) {
    if (props.readOnly || controller.current) return;
    const operation = new AbortController();
    controller.current = operation;
    setBusy(true);
    setError('');
    setStatus('Convirtiendo imagen a WebP…');
    try {
      const webp = await convertImageToWebp(file);
      operation.signal.throwIfAborted();
      setStatus('Subiendo imagen WebP…');
      const asset = await firstValueFrom(
        client.observable.assets
          .upload('image', webp, {
            filename: webp.name,
            contentType: 'image/webp',
          })
          .pipe(
            filter((event) => event.type === 'response'),
            map((event) => event.body.document),
            takeUntil(fromEvent(operation.signal, 'abort')),
            timeout(60000),
          ),
      );
      operation.signal.throwIfAborted();
      props.onChange(
        PatchEvent.from([
          setIfMissing({ _type: props.schemaType.name }),
          set({ _type: 'reference', _ref: asset._id }, ['asset']),
          unset(['_upload']),
          unset(['crop']),
          unset(['hotspot']),
        ]),
      );
      setStatus('Imagen convertida y guardada en WebP.');
    } catch (cause) {
      if (operation.signal.aborted) setStatus('Subida cancelada.');
      else {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No se pudo subir la imagen. Inténtalo de nuevo.',
        );
        setStatus('');
      }
    } finally {
      controller.current = null;
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <Stack style={{ gap: 12 }}>
      <Card
        padding={3}
        border
        radius={2}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDropCapture={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const file = event.dataTransfer.files[0];
          if (file) void upload(file);
        }}
        onPasteCapture={(event) => {
          const file = event.clipboardData.files[0];
          if (file) {
            event.preventDefault();
            event.stopPropagation();
            void upload(file);
          }
        }}
      >
        <Stack style={{ gap: 12 }}>
          <Text size={1}>Sube o arrastra una imagen. Se convierte automáticamente a WebP.</Text>
          <input
            ref={input}
            type="file"
            accept="image/*"
            aria-label="Seleccionar imagen para convertir a WebP"
            disabled={props.readOnly || busy}
            style={{ maxWidth: '100%' }}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void upload(file);
            }}
          />
          {busy && (
            <Button text="Cancelar" mode="ghost" onClick={() => controller.current?.abort()} />
          )}
          {previousUpload && !busy && (
            <Button
              text="Cancelar subida anterior atascada"
              tone="caution"
              mode="ghost"
              disabled={props.readOnly}
              onClick={() => props.onChange(unset(['_upload']))}
            />
          )}
          {status && (
            <Text size={1} role="status" aria-live="polite">
              {status}
            </Text>
          )}
          {error && (
            <Card padding={3} radius={2} tone="critical">
              <Text size={1} role="alert">
                {error}
              </Text>
            </Card>
          )}
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  );
}

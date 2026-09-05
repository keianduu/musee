export function nullableText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

export function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function assertHttpUrl(value: string | null, label: string) {
  if (!value) return;
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol)) throw new Error(`${label}はhttp(s) URLで入力してください。`);
}

export function slugify(value: string) {
  const normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[’'"“”]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "untitled";
}

export function importedSlug(title: string, externalId: string) {
  return `${slugify(title)}-${slugify(externalId)}`.slice(0, 180);
}

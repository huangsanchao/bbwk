/**
 * 生成 URL 友好的 slug
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(base, existingSlugs) {
  let slug = generateSlug(base);
  let counter = 1;
  while (existingSlugs.has(slug)) {
    slug = `${generateSlug(base)}-${counter}`;
    counter++;
  }
  return slug;
}

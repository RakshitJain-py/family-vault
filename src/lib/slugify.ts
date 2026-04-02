export const slugify = (name: string) =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const deslugify = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

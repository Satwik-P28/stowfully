export type KeepsakeKind = 'link' | 'note' | 'image';

export type Keepsake = {
  id: string;
  kind: KeepsakeKind;
  title: string;
  body: string;
  url?: string;
  image?: string;
  tags: string[];
  createdAt: string;
};

export const SAMPLE_KEEPSAKES: Keepsake[] = [
  {
    id: 'sample-1',
    kind: 'link',
    title: 'Designing for calm',
    body: 'A thoughtful essay about interfaces that respect attention.',
    url: 'https://example.com/designing-for-calm',
    tags: ['design', 'reading'],
    createdAt: '2026-08-29T10:00:00.000Z',
  },
  {
    id: 'sample-2',
    kind: 'note',
    title: 'A line worth keeping',
    body: 'Collect slowly. Revisit generously. Keep only what still feels alive.',
    tags: ['words', 'ideas'],
    createdAt: '2026-08-31T14:30:00.000Z',
  },
  {
    id: 'sample-3',
    kind: 'image',
    title: 'Color study: early autumn',
    body: 'Moss, clay, paper, and a clear blue morning.',
    tags: ['color', 'inspiration'],
    createdAt: '2026-09-02T08:15:00.000Z',
  },
  {
    id: 'sample-4',
    kind: 'link',
    title: 'Small tools, loosely joined',
    body: 'Notes on building personal software that remains understandable.',
    url: 'https://example.com/small-tools',
    tags: ['software', 'indie'],
    createdAt: '2026-09-03T17:10:00.000Z',
  },
];

export function normalizeTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 8);
}

export function findKeepsakes(
  items: Keepsake[],
  query: string,
  kind: KeepsakeKind | 'all',
) {
  const needle = query.trim().toLowerCase();
  return items.filter((item) => {
    const hasKind = kind === 'all' || item.kind === kind;
    const haystack = [item.title, item.body, item.url ?? '', ...item.tags]
      .join(' ')
      .toLowerCase();
    return hasKind && (!needle || haystack.includes(needle));
  });
}

export function parseVaultExport(value: string): Keepsake[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error('Vault export must be an array.');
  return parsed.filter((item): item is Keepsake => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Partial<Keepsake>;
    return (
      typeof candidate.id === 'string' &&
      ['link', 'note', 'image'].includes(candidate.kind ?? '') &&
      typeof candidate.title === 'string' &&
      typeof candidate.body === 'string' &&
      Array.isArray(candidate.tags) &&
      typeof candidate.createdAt === 'string'
    );
  });
}

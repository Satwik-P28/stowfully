import { describe, expect, it } from 'vitest';
import {
  findKeepsakes,
  normalizeTags,
  parseVaultExport,
  SAMPLE_KEEPSAKES,
} from './vault';

describe('vault helpers', () => {
  it('normalizes and deduplicates tags', () => {
    expect(normalizeTags(' Design, reading, design ')).toEqual([
      'design',
      'reading',
    ]);
  });

  it('searches text, URLs, and tags while respecting type filters', () => {
    expect(findKeepsakes(SAMPLE_KEEPSAKES, 'software', 'link')).toHaveLength(1);
    expect(findKeepsakes(SAMPLE_KEEPSAKES, '', 'note')).toHaveLength(1);
  });

  it('rejects malformed exports and keeps valid records', () => {
    expect(parseVaultExport(JSON.stringify(SAMPLE_KEEPSAKES))).toHaveLength(4);
    expect(() => parseVaultExport('{}')).toThrow('array');
  });
});

import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeAttr } from './sanitize.js';

describe('escapeHtml', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('escapes &', () => {
    expect(escapeHtml('&')).toBe('&amp;');
  });

  it('escapes < and >', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeHtml("'hello'")).toBe('&#39;hello&#39;');
  });

  it('passes through safe strings', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
    expect(escapeHtml('123')).toBe('123');
  });

  it('handles mixed content', () => {
    expect(escapeHtml('<b onclick="alert(1)">test</b>'))
      .toBe('&lt;b onclick=&quot;alert(1)&quot;&gt;test&lt;&#x2F;b&gt;');
  });
});

describe('sanitizeAttr', () => {
  it('escapes double quotes', () => {
    expect(sanitizeAttr('hello "world"')).toBe('hello &quot;world&quot;');
  });
});

export function unknownToString(s: unknown): string {
  if (typeof s === 'undefined') {
    return 'undefined';
  }
  if (s == null) {
    return 'null';
  }
  return s.toString();
}

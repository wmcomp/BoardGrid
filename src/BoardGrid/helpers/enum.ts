import { unknownToString } from './unknownToString';

export type Enum<T> = T[keyof T];

export function isEnum<T>(obj: Record<string, T>) {
  const values = new Set(Object.values(obj));
  return (s: unknown): s is T => values.has(s as T);
}

export function toEnum<T>(
  itemIsEnum: (s: unknown) => s is T,
  preConvert: (s: unknown) => unknown = unknownToString,
) {
  function toEnumFull(s: unknown): T | null;
  function toEnumFull(s: unknown, defaultValue: T): T;
  function toEnumFull(s: unknown, defaultValue?: T): T | null {
    const str = preConvert(s);
    if (itemIsEnum(str)) {
      return str;
    }
    return defaultValue ?? null;
  }
  return toEnumFull;
}

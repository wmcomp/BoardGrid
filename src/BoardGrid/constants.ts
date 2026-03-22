import { type Enum, isEnum, toEnum } from './helpers';

export const emptyObject: Record<string | number, never> = Object.freeze({});
export const emptyArray: never[] = Object.freeze([]) as never[];
export const dataTransferType = 'object/board-grid-card';

export const RESIZE = {
  Bottom: 'b',
  BottomLeft: 'bl',
  BottomRight: 'br',
  Left: 'l',
  Right: 'r',
  Top: 't',
  TopLeft: 'tl',
  TopRight: 'tr',
} as const;

export type Resize = Enum<typeof RESIZE>;
export const isResize = isEnum<Resize>(RESIZE);
export const toResize = toEnum(isResize);



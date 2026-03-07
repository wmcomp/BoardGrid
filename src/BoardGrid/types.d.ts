import type { FC, PropsWithChildren } from 'react';

export type LayoutItem<T extends PropsWithChildren = PropsWithChildren> = {
  i: string; // Unique identifier (must match child key)
  x: number; // X position in grid units
  y: number; // Y position in grid units
  w: number; // Width in grid units
  h: number; // Height in grid units
  minW?: number; // Minimum width (default: 0)
  maxW?: number; // Maximum width (default: Infinity)
  minH?: number; // Minimum height (default: 0)
  maxH?: number; // Maximum height (default: Infinity)
  static?: boolean; // If true, not draggable or resizable
  isDraggable?: boolean; // Override grid isDraggable
  isResizable?: boolean; // Override grid isResizable
  isBounded?: boolean; // Override grid isBounded
  resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
  component?: FC<T>;
  payload?: T;
  children?: LayoutItem<T>[];
};

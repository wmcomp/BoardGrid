import { useCallback, useEffect, useRef, useState } from "react";
import { toResize } from "../constants";
import {
  applyResize,
  type ResizeCtx,
  type ResizeResult,
} from "../helpers/resizeCalc";
import type { LayoutItem } from "../types";

type ResizeLayout = Pick<
  LayoutItem,
  "i" | "x" | "y" | "w" | "h" | "maxW" | "minW" | "maxH" | "minH"
>;

export type UseResizeOptions = {
  layouts: ResizeLayout[];
  container: HTMLElement | null;
  cols: number;
  rows: number;
  onResizeEnd?: (id: string, result: ResizeResult) => void;
};

type ResizePreview = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function useResize({
  layouts,
  container,
  cols,
  rows,
  onResizeEnd,
}: UseResizeOptions) {
  const [preview, setPreview] = useState<ResizePreview | null>(null);

  const layoutsRef = useRef(layouts);
  layoutsRef.current = layouts;

  const colsRef = useRef(cols);
  colsRef.current = cols;

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const containerRef = useRef(container);
  containerRef.current = container;

  const onResizeEndRef = useRef(onResizeEnd);
  onResizeEndRef.current = onResizeEnd;

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const dir = toResize(target.getAttribute("data-resize"));
    if (!dir) return;

    const cardEl = target.closest("[data-card-id]");
    if (!cardEl) return;

    const cardId = cardEl.getAttribute("data-card-id");
    if (!cardId) return;

    const initialLayout = layoutsRef.current.find((l) => l.i === cardId);
    if (!initialLayout) return;

    const ctr = containerRef.current;
    if (!ctr) return;

    cleanupRef.current?.();

    target.setPointerCapture(e.pointerId);

    const currentCols = colsRef.current;
    const currentRows = rowsRef.current;

    const onMove = (ev: PointerEvent) => {
      const rect = ctr.getBoundingClientRect();
      const columnWidth = rect.width / currentCols;
      const rowHeight = rect.height / currentRows;

      const {
        maxH = currentRows,
        minH = 1,
        maxW = currentCols,
        minW = 1,
      } = initialLayout;

      const ctx: ResizeCtx = {
        clientX: ev.clientX,
        clientY: ev.clientY,
        top: rect.top,
        left: rect.left,
        rowHeight,
        columnWidth,
        minX: 0,
        maxX: currentCols - initialLayout.w,
        minY: 0,
        maxY: currentRows - initialLayout.h,
        minW,
        maxW,
        minH,
        maxH,
        cx: initialLayout.x,
        cy: initialLayout.y,
        cw: initialLayout.w,
        ch: initialLayout.h,
      };

      const result = applyResize(dir, ctx);

      // учет позиции карточки
      result.w = Math.min(result.w, currentCols - result.x);
      result.h = Math.min(result.h, currentRows - result.y);

      setPreview((prev) => {
        if (
          prev &&
          prev.id === cardId &&
          prev.x === result.x &&
          prev.y === result.y &&
          prev.w === result.w &&
          prev.h === result.h
        ) {
          return prev;
        }
        return { id: cardId, ...result };
      });
    };

    const cleanup = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("lostpointercapture", onUp);
      cleanupRef.current = null;
    };

    const onUp = () => {
      cleanup();
      setPreview((prev) => {
        if (prev) onResizeEndRef.current?.(prev.id, prev);
        return null;
      });
    };

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("lostpointercapture", onUp);

    cleanupRef.current = cleanup;

    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    handlePointerDown,
    preview,
  };
}

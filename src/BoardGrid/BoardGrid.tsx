import {
  type CSSProperties,
  type PropsWithChildren,
  type DragEvent as ReactDragEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BoardCard } from './BoardCard';
import { BoardCardPreview } from './BoardCardPreview';
import {
  dataTransferType,
  emptyArray,
  emptyObject,
  RESIZE,
  type Resize,
  toResize,
} from './constants';
import { useRectObserver } from './hooks/useRectObserver';
import css from './style.module.css';
import type { LayoutItem } from './types';

export type BoardGridProps<T extends PropsWithChildren = PropsWithChildren> =
  PropsWithChildren<{
    group?: string;
    layouts?: LayoutItem<T>[];
    onChange?: (layouts?: LayoutItem<T>[]) => void;
    /**
     * кол-во столбцов
     */
    cols?: number;
    /**
     * кол-во строк
     */
    rows?: number;
  }>;
export function BoardGrid<T extends PropsWithChildren = PropsWithChildren>({
  layouts = emptyArray,
  cols = 12,
  rows,
  group,
  onChange,
  children,
}: BoardGridProps<T>) {
  const [dragCardElement, setDragCardElement] = useState<
    LayoutItem<T> | undefined
  >(undefined);
  const dragCardElementRef = useRef(dragCardElement);
  const layoutsRef = useRef(layouts);
  const id = useId();
  const [self, setSelf] = useState(false);
  const [drag, setDrag] = useState(false);
  const [resize, setResize] = useState<Resize | null>(null);
  const resizeRef = useRef<Resize | null>(resize);
  const [boardDiv, setBoardDiv] = useState<HTMLElement | null>(null);

  const [boardDivRect] = useRectObserver(boardDiv, true);

  const { width, height, top, left } = boardDivRect;

  const column_width = width / cols;

  useEffect(() => {
    dragCardElementRef.current = !drag ? dragCardElement : undefined;
  }, [dragCardElement, drag]);

  useEffect(() => {
    layoutsRef.current = layouts;
  }, [layouts]);

  useEffect(() => {
    resizeRef.current = resize;
  }, [resize]);

  const current_rows = useMemo(() => {
    if (rows != null) {
      return rows;
    }
    const h =
      drag && dragCardElement ? dragCardElement.y + dragCardElement.h : 0;
    return layouts.reduce((res, item) => {
      res = Math.max(res, item.y + item.h);
      return res;
    }, h);
  }, [layouts, dragCardElement, drag, rows]);

  const row_height = height / current_rows;

  const onDragStart = useCallback(
    (event: DragEvent) => {
      const resize = toResize(
        event.target instanceof HTMLElement
          ? event.target.getAttribute('data-resize')
          : null,
      );

      setResize(resize);
      // if (resize &&) {
      // }

      const layout = saveJSONParse<LayoutItem<T>>(
        event.dataTransfer?.getData(dataTransferType),
      );
      if (
        layout &&
        (!resize || layoutsRef.current.findIndex((i) => i.i === layout.i) > -1)
      ) {
        console.log(event.type, id, group, layout, 'resize', resize);
        if (layout?.i !== group) {
          setDragCardElement(layout);
          dragCardElementRef.current = layout;
          setSelf(false);
        } else {
          setSelf(true);
        }
      } else {
        // console.log(event.type, id);
      }
      console.log(event.type, id, group, dragCardElementRef.current);
    },
    [group, id],
  );
  const onDragEnd = useCallback(
    (event: DragEvent) => {
      console.log(event.type, id, group, dragCardElementRef.current);
      setResize(null);
      if (dragCardElementRef.current && onChange && !resizeRef.current) {
        layoutsRef.current = layoutsRef.current.filter(
          (i) => i.i !== dragCardElementRef.current?.i,
        );
        onChange(layoutsRef.current);
      }
      setSelf(false);
      setDrag(false);
      setDragCardElement(undefined);
      dragCardElementRef.current = undefined;
    },
    [onChange, id, group],
  );

  useEffect(() => {
    const start = onDragStart;
    window.addEventListener('dragstart', start);
    return () => {
      window.removeEventListener('dragstart', start);
    };
  }, [onDragStart]);

  useEffect(() => {
    const end = onDragEnd;
    window.addEventListener('dragend', end);
    return () => {
      window.removeEventListener('dragend', end);
    };
  }, [onDragEnd]);

  useEffect(() => {
    const outerDrop = (event: DragEvent) => {
      //  outDropRef.current = true;
      setDragCardElement(undefined);
      dragCardElementRef.current = undefined;
      console.log('window drop');
      event.preventDefault();
      // event.stopPropagation();
    };
    const over = (event: DragEvent) => {
      console.log('window dragover');
      event.preventDefault();
    };
    window.addEventListener('drop', outerDrop);
    window.addEventListener('dragover', over);
    return () => {
      window.removeEventListener('dragover', outerDrop);
      window.removeEventListener('dragover', over);
    };
  }, []);

  const dragOver = useCallback(
    (event: ReactDragEvent) => {
      console.log(event.type, id, dragCardElementRef.current);

      // if (dragCardElementRef.current) {
      setDragCardElement((c) => {
        if (!c) {
          return c;
        }
        let {
          h,
          w,
          x,
          y,
          maxH = current_rows,
          minH = 1,
          maxW = cols,
          minW = 1,
        } = c;
        const maxX = cols - c.w;
        const minX = 0;
        const maxY = current_rows - c.h;
        const minY = 0;

        console.log(event.type, id);

        switch (resizeRef.current) {
          case RESIZE.Bottom:
            h = Math.min(
              maxH,
              Math.max(
                minH,
                Math.round(
                  (event.nativeEvent.clientY + c.h * row_height - top) /
                    row_height,
                ) -
                  c.y -
                  c.h,
              ),
            );
            break;
          case RESIZE.BottomLeft:
            h = Math.min(
              maxH,
              Math.max(
                minH,
                Math.round(
                  (event.nativeEvent.clientY + c.h * row_height - top) /
                    row_height,
                ) -
                  c.y -
                  c.h,
              ),
            );
            x = Math.min(
              c.x + c.w - 1,
              Math.max(
                minX,
                Math.round((event.nativeEvent.clientX - left) / column_width),
              ),
            );
            w = Math.min(maxW, Math.max(minW, c.w + (c.x - x)));
            break;
          case RESIZE.BottomRight:
            w = Math.min(
              maxW,
              Math.max(
                minW,

                Math.round(
                  (event.nativeEvent.clientX + c.w * column_width - left) /
                    column_width,
                ) -
                  c.x -
                  c.w,
              ),
            );
            h = Math.min(
              maxH,
              Math.max(
                minH,
                Math.round(
                  (event.nativeEvent.clientY + c.h * row_height - top) /
                    row_height,
                ) -
                  c.y -
                  c.h,
              ),
            );
            break;
          case RESIZE.Left:
            x = Math.min(
              c.x + c.w - 1,
              Math.max(
                minX,
                Math.round((event.nativeEvent.clientX - left) / column_width),
              ),
            );
            w = Math.min(maxW, Math.max(minW, c.w + (c.x - x)));
            break;
          case RESIZE.Right:
            w = Math.min(
              maxW,
              Math.max(
                minW,

                Math.round(
                  (event.nativeEvent.clientX + c.w * column_width - left) /
                    column_width,
                ) -
                  c.x -
                  c.w,
              ),
            );
            break;
          case RESIZE.Top:
            y = Math.min(
              c.y + c.h - 1,
              Math.max(
                minY,
                Math.round((event.nativeEvent.clientY - top) / row_height),
              ),
            );
            h = Math.min(maxH, Math.max(minH, c.h + (c.y - y)));
            break;
          case RESIZE.TopLeft:
            y = Math.min(
              c.y + c.h - 1,
              Math.max(
                minY,
                Math.round((event.nativeEvent.clientY - top) / row_height),
              ),
            );
            h = Math.min(maxH, Math.max(minH, c.h + (c.y - y)));
            x = Math.min(
              c.x + c.w - 1,
              Math.max(
                minX,
                Math.round((event.nativeEvent.clientX - left) / column_width),
              ),
            );
            w = Math.min(maxW, Math.max(minW, c.w + (c.x - x)));
            break;
          case RESIZE.TopRight:
            y = Math.min(
              c.y + c.h - 1,
              Math.max(
                minY,
                Math.round((event.nativeEvent.clientY - top) / row_height),
              ),
            );
            h = Math.min(maxH, Math.max(minH, c.h + (c.y - y)));
            w = Math.min(
              maxW,
              Math.max(
                minW,

                Math.round(
                  (event.nativeEvent.clientX + c.w * column_width - left) /
                    column_width,
                ) -
                  c.x -
                  c.w,
              ),
            );
            break;
        }
        if (!resizeRef.current) {
          x = Math.min(
            maxX,
            Math.max(
              minX,
              Math.round(
                (event.nativeEvent.clientX - (c.w * column_width) / 2 - left) /
                  column_width,
              ),
            ),
          );
          y = Math.min(
            maxY,
            Math.max(
              minY,
              Math.round(
                (event.nativeEvent.clientY - (c.h * row_height) / 2 - top) /
                  row_height,
              ),
            ),
          );
        }
        if (c.x === x && c.y === y && c.h === h && c.w === w) {
          return c;
        }
        return {
          ...c,
          h,
          w,
          x,
          y,
        };
      });
      setDrag(true);
      event.preventDefault();
      event.stopPropagation();
      // }
    },
    [left, top, column_width, row_height, cols, current_rows],
  );

  const dragLeave = useCallback(() => {
    if (!resizeRef.current) {
      setDrag(false);
    }
  }, []);

  const drop = useCallback(
    (event: ReactDragEvent) => {
      console.log('drop', id, drag, layoutsRef.current);
      let change = false;
      if (
        dragCardElement &&
        layoutsRef.current &&
        layoutsRef.current.findIndex((i) => i.i === dragCardElement?.i) > -1
      ) {
        layoutsRef.current = layoutsRef.current.filter(
          (i) => i.i !== dragCardElement?.i,
        );
        change = true;
      }
      if (drag && dragCardElement && layoutsRef.current) {
        layoutsRef.current = [...layoutsRef.current, dragCardElement];
        change = true;
      }
      if (change && onChange) {
        console.log('drop', id, drag, dragCardElement, layoutsRef.current);
        onChange(layoutsRef.current);
      }
      setDrag(false);
      setDragCardElement(undefined);
      dragCardElementRef.current = undefined;
      event.preventDefault();
      event.stopPropagation();
    },
    [id, drag, dragCardElement, onChange],
  );
  const onChangeLayout = useCallback(
    (layout?: LayoutItem<T>) => {
      console.log(id);

      if (
        onChange &&
        layout &&
        layoutsRef.current &&
        layoutsRef.current.findIndex((i) => i.i === layout.i) > -1
      ) {
        if (
          layout.children &&
          layout.children.findIndex((i) => i.i === layout.i) > -1
        ) {
          return;
        }
        layoutsRef.current = layoutsRef.current.map((i) => {
          return i.i === layout.i ? layout : i;
        });
        console.log('onChangeLayout', layoutsRef.current);
        onChange(layoutsRef.current);
      }
    },
    [onChange],
  );

  return (
    <div
      className={css.boardGridOuter}
      style={
        {
          '--board-columns': cols,
          '--board-rows': current_rows,
        } as CSSProperties
      }
    >
      <aside
        className={css.boardGrid}
        onDragLeave={dragLeave}
        onDragOver={self ? undefined : dragOver}
        onDrop={self ? undefined : drop}
        // onDragStart={onDragStart}
        // onDragEnd={onDragEnd}
        ref={setBoardDiv}
      >
        {children
          ? children
          : layouts.map((item) => (
              <BoardCard<T>
                key={item.i}
                layout={item}
                onChangeLayout={onChangeLayout}
              />
            ))}
        {drag && !!dragCardElement && (
          <BoardCard className={css.boardCardPreview} layout={dragCardElement}>
            <BoardCardPreview />
          </BoardCard>
        )}
      </aside>
    </div>
  );
}

function saveJSONParse<T>(
  str?: string | null,
  validate: (item: unknown) => T = saveJSONParseUnSaveValidate,
): T | null {
  if (str == null) {
    return null;
  }
  try {
    const res = JSON.parse(str);
    return validate(res);
  } catch (error) {
    console.error(error);
  }
  return null;
}

function saveJSONParseUnSaveValidate<T>(item: unknown): T {
  return item as T;
}

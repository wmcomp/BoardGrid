import { clsx } from 'clsx';
import {
  type CSSProperties,
  type JSX,
  type PropsWithChildren,
  type DragEvent as ReactDragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BoardGrid } from './BoardGrid';
import { dataTransferType, emptyObject, RESIZE } from './constants';
import css from './style.module.css';
import type { LayoutItem } from './types';

export type BoardCardProps<T extends PropsWithChildren = PropsWithChildren> =
  PropsWithChildren<
    JSX.IntrinsicElements['div'] & {
      layout?: LayoutItem<T>;
      onChangeLayout?: (layout?: LayoutItem<T>) => void;
    }
  >;
export function BoardCard<T extends PropsWithChildren = PropsWithChildren>({
  layout,
  children,
  onChangeLayout,
  ...props
}: BoardCardProps<T>) {
  const {
    isDraggable = true,
    isResizable = true,
    i,
    w,
    h,
    x,
    y,
    payload,
    component: Component,
  } = layout ?? emptyObject;
  const [drag, setDrag] = useState(false);
  const [resize, setResize] = useState(false);
  const refDiv = useRef<HTMLDivElement>(null);

  const componentProps: T = payload ?? (emptyObject as T);

  const onChange = useCallback(
    (layouts?: LayoutItem<T>[]) => {
      if (onChangeLayout && layout) {
        onChangeLayout({ ...layout, children: layouts });
      }
    },
    [layout, onChangeLayout],
  );

  const onDragEnd = useCallback((_event: ReactDragEvent<HTMLElement>) => {
    setTimeout(() => {
      if (refDiv.current) {
        refDiv.current.style.display = '';
      }
    });
    setDrag(false);
  }, []);

  const onDragStart = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      const data = event.dataTransfer.getData(dataTransferType);
      // const target = event.currentTarget;

      if (!data && refDiv.current) {
        event.dataTransfer.setDragImage(refDiv.current, 0, 0);
        event.dataTransfer.setData(dataTransferType, JSON.stringify(layout));
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';
        setDrag(true);
        setTimeout(() => {
          if (refDiv.current) {
            refDiv.current.style.display = 'none';
          }
        });
      }
    },
    [layout],
  );

  const onDragResizeStart = useCallback(
    (event: ReactDragEvent<HTMLElement>) => {
      // event.stopPropagation();
      // console.log("onDragResizeStarts", event);

      const data = event.dataTransfer.getData(dataTransferType);
      // const target = event.currentTarget;
      if (!data) {
        // event.dataTransfer.setDragImage(document.createElement("DIV"), 0, 0);
        event.dataTransfer.setData(dataTransferType, JSON.stringify(layout));
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';
        setResize(true);
        setTimeout(() => {
          if (refDiv.current) {
            refDiv.current.style.display = 'none';
          }
        });
      }
    },
    [layout],
  );
  const onDragResizeEnd = useCallback((_event: ReactDragEvent<HTMLElement>) => {
    // console.log("onDragResizeEnd", event);
    setTimeout(() => {
      if (refDiv.current) {
        refDiv.current.style.display = '';
      }
    });
    setResize(false);
  }, []);

  const style = useMemo(
    () =>
      ({
        '--board-card-height': h,
        '--board-card-position-x': x,
        '--board-card-position-y': y,
        '--board-card-width': w,
        ...props.style,
      }) as CSSProperties,
    [w, h, x, y, props.style],
  );
  return (
    <aside
      {...props}
      className={clsx(
        css.boardCard,
        drag && css.boardCardDrag,
        resize && css.boardCardResize,
        props.className,
      )}
      draggable={isDraggable}
      // key={i}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      ref={refDiv}
      style={style}
    >
      {isResizable && (
        <>
          <aside
            className={clsx(
              css.boardCardResizeCorner,
              css.boardCardResizeBottomRight,
            )}
            data-resize={RESIZE.BottomRight}
            draggable
            onDragEnd={onDragResizeEnd}
            onDragStart={onDragResizeStart}
          ></aside>
          <aside
            className={clsx(
              css.boardCardResizeCorner,
              css.boardCardResizeBottom,
            )}
            data-resize={RESIZE.Bottom}
            draggable
            onDragEnd={onDragResizeEnd}
            onDragStart={onDragResizeStart}
          ></aside>
          <aside
            className={clsx(
              css.boardCardResizeCorner,
              css.boardCardResizeBottomLeft,
            )}
            data-resize={RESIZE.BottomLeft}
            draggable
            onDragEnd={onDragResizeEnd}
            onDragStart={onDragResizeStart}
          ></aside>
          <aside
            className={clsx(
              css.boardCardResizeCorner,
              css.boardCardResizeTopRight,
            )}
            data-resize={RESIZE.TopRight}
            draggable
            onDragEnd={onDragResizeEnd}
            onDragStart={onDragResizeStart}
          ></aside>
          <aside
            className={clsx(css.boardCardResizeCorner, css.boardCardResizeTop)}
            data-resize={RESIZE.Top}
            draggable
            onDragEnd={onDragResizeEnd}
            onDragStart={onDragResizeStart}
          ></aside>
          <aside
            className={clsx(
              css.boardCardResizeCorner,
              css.boardCardResizeTopLeft,
            )}
            data-resize={RESIZE.TopLeft}
            draggable
            onDragEnd={onDragResizeEnd}
            onDragStart={onDragResizeStart}
          ></aside>
          <aside
            className={clsx(css.boardCardResizeCorner, css.boardCardResizeLeft)}
            data-resize={RESIZE.Left}
            draggable
            onDragEnd={onDragResizeEnd}
            onDragStart={onDragResizeStart}
          ></aside>
          <aside
            className={clsx(
              css.boardCardResizeCorner,
              css.boardCardResizeRight,
            )}
            data-resize={RESIZE.Right}
            draggable
            onDragEnd={onDragResizeEnd}
            onDragStart={onDragResizeStart}
          ></aside>
        </>
      )}
      {children ? (
        children
      ) : layout?.children ? (
        <BoardGrid
          cols={w}
          group={i}
          layouts={layout.children}
          onChange={onChange}
          rows={h}
        />
      ) : Component ? (
        <Component {...componentProps} />
      ) : (
        payload?.children
      )}
    </aside>
  );
}

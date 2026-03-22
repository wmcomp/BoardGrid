import { clsx } from "clsx";
import {
  type CSSProperties,
  type JSX,
  type PropsWithChildren,
  type DragEvent as ReactDragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { BoardGrid } from "./BoardGrid";
import { dataTransferType, emptyObject, RESIZE } from "./constants";
import css from "./style.module.css";
import type { LayoutItem } from "./types";

const DIRRECTION_HANDLES = [
  { dirrection: RESIZE.BottomRight, cls: css.boardCardResizeBottomRight },
  { dirrection: RESIZE.Bottom, cls: css.boardCardResizeBottom },
  { dirrection: RESIZE.BottomLeft, cls: css.boardCardResizeBottomLeft },
  { dirrection: RESIZE.TopRight, cls: css.boardCardResizeTopRight },
  { dirrection: RESIZE.Top, cls: css.boardCardResizeTop },
  { dirrection: RESIZE.TopLeft, cls: css.boardCardResizeTopLeft },
  { dirrection: RESIZE.Left, cls: css.boardCardResizeLeft },
  { dirrection: RESIZE.Right, cls: css.boardCardResizeRight },
];

export type BoardCardProps<T extends PropsWithChildren = PropsWithChildren> =
  PropsWithChildren<
    JSX.IntrinsicElements["div"] & {
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
  // const [resize, setResize] = useState(false);
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
        refDiv.current.style.display = "";
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
        event.dataTransfer.dropEffect = "move";
        event.dataTransfer.effectAllowed = "move";
        setDrag(true);
        setTimeout(() => {
          if (refDiv.current) {
            refDiv.current.style.display = "none";
          }
        });
      }
    },
    [layout],
  );
  const style = useMemo(
    () =>
      ({
        "--board-card-height": h,
        "--board-card-position-x": x,
        "--board-card-position-y": y,
        "--board-card-width": w,
        ...props.style,
      }) as CSSProperties,
    [w, h, x, y, props.style],
  );
  return (
    <aside
      {...props}
      data-card-id={i}
      className={clsx(
        css.boardCard,
        drag && css.boardCardDrag,
        props.className,
      )}
      draggable={isDraggable}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      ref={refDiv}
      style={style}
    >

      {isResizable &&
        DIRRECTION_HANDLES.map(({ dirrection, cls }) => (
          <aside
            key={dirrection}
            className={clsx(css.boardCardResizeCorner, cls)}
            data-resize={dirrection}
          />
        ))}

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

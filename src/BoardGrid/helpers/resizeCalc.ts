import { RESIZE } from "../constants";

export type ResizeCtx = {
  clientX: number;
  clientY: number;
  top: number;
  left: number;
  rowHeight: number;
  columnWidth: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  cx: number;
  cy: number;
  cw: number;
  ch: number;
};

export const clamp = (min: number, max: number, value: number) =>
  Math.min(max, Math.max(min, value));

export const calcYFromTop = (ctx: ResizeCtx) =>
  clamp(ctx.minY, ctx.cy + ctx.ch - 1, Math.round((ctx.clientY - ctx.top) / ctx.rowHeight));

export const calcHFromTop = (ctx: ResizeCtx, newY: number) =>
  clamp(ctx.minH, ctx.maxH, ctx.ch + (ctx.cy - newY));

export const calcHFromBottom = (ctx: ResizeCtx) =>
  clamp(
    ctx.minH,
    ctx.maxH,
    Math.round((ctx.clientY + ctx.ch * ctx.rowHeight - ctx.top) / ctx.rowHeight) - ctx.cy - ctx.ch,
  );

export const calcXFromLeft = (ctx: ResizeCtx) =>
  clamp(ctx.minX, ctx.cx + ctx.cw - 1, Math.round((ctx.clientX - ctx.left) / ctx.columnWidth));

export const calcWFromLeft = (ctx: ResizeCtx, newX: number) =>
  clamp(ctx.minW, ctx.maxW, ctx.cw + (ctx.cx - newX));

export const calcWFromRight = (ctx: ResizeCtx) =>
  clamp(
    ctx.minW,
    ctx.maxW,
    Math.round((ctx.clientX + ctx.cw * ctx.columnWidth - ctx.left) / ctx.columnWidth) - ctx.cx - ctx.cw,
  );

export const calcDragX = (ctx: ResizeCtx) =>
  clamp(ctx.minX, ctx.maxX, Math.round((ctx.clientX - (ctx.cw * ctx.columnWidth) / 2 - ctx.left) / ctx.columnWidth));

export const calcDragY = (ctx: ResizeCtx) =>
  clamp(ctx.minY, ctx.maxY, Math.round((ctx.clientY - (ctx.ch * ctx.rowHeight) / 2 - ctx.top) / ctx.rowHeight));

export type ResizeResult = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export function applyResize(dir: string | null, ctx: ResizeCtx): ResizeResult {
  let { cx: x, cy: y, cw: w, ch: h } = ctx;

  switch (dir) {
    case RESIZE.Bottom:
      h = calcHFromBottom(ctx);
      break;
    case RESIZE.BottomLeft:
      h = calcHFromBottom(ctx);
      x = calcXFromLeft(ctx);
      w = calcWFromLeft(ctx, x);
      break;
    case RESIZE.BottomRight:
      h = calcHFromBottom(ctx);
      w = calcWFromRight(ctx);
      break;
    case RESIZE.Left:
      x = calcXFromLeft(ctx);
      w = calcWFromLeft(ctx, x);
      break;
    case RESIZE.Right:
      w = calcWFromRight(ctx);
      break;
    case RESIZE.Top:
      y = calcYFromTop(ctx);
      h = calcHFromTop(ctx, y);
      break;
    case RESIZE.TopLeft:
      y = calcYFromTop(ctx);
      h = calcHFromTop(ctx, y);
      x = calcXFromLeft(ctx);
      w = calcWFromLeft(ctx, x);
      break;
    case RESIZE.TopRight:
      y = calcYFromTop(ctx);
      h = calcHFromTop(ctx, y);
      w = calcWFromRight(ctx);
      break;
    default:
      x = calcDragX(ctx);
      y = calcDragY(ctx);
  }

  return { x, y, w, h };
}
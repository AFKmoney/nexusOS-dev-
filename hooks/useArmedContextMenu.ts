import { useRef } from "react";

const MOVE_CANCEL_PX = 14;
const TOUCH_HOLD_MS = 650;

type OpenFn = (x: number, y: number) => void;

/**
 * Desktop: native right-click.
 * Mobile: long-press 650ms, cancelled if the finger moves (scroll).
 * Always suppress the browser context menu on touch so iOS/Android
 * do not pop our menu during a flick-scroll.
 */
export function useArmedContextMenu(open: OpenFn) {
  const hold = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    x: number;
    y: number;
    pointerId: number | null;
  }>({ timer: null, x: 0, y: 0, pointerId: null });

  const clear = () => {
    if (hold.current.timer) clearTimeout(hold.current.timer);
    hold.current.timer = null;
    hold.current.pointerId = null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    clear();
    hold.current.x = e.clientX;
    hold.current.y = e.clientY;
    hold.current.pointerId = e.pointerId;
    hold.current.timer = setTimeout(() => {
      hold.current.timer = null;
      open(hold.current.x, hold.current.y);
    }, TOUCH_HOLD_MS);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (hold.current.pointerId !== e.pointerId || !hold.current.timer) return;
    const dx = e.clientX - hold.current.x;
    const dy = e.clientY - hold.current.y;
    if (dx * dx + dy * dy > MOVE_CANCEL_PX * MOVE_CANCEL_PX) clear();
  };

  const onContextMenu = (e: React.MouseEvent) => {
    const ne = e.nativeEvent as MouseEvent & { pointerType?: string; sourceCapabilities?: { firesTouchEvents?: boolean } };
    const fromTouch =
      ne.pointerType === "touch" ||
      ne.sourceCapabilities?.firesTouchEvents === true ||
      (e.button === 0 && "ontouchstart" in window);
    if (fromTouch) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    open(e.clientX, e.clientY);
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: clear,
    onPointerCancel: clear,
    onContextMenu,
  };
}

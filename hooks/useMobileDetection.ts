import { useState, useEffect } from 'react';

export const MOBILE_BREAKPOINT_PX = 768;

export interface MobileState {
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  isPortrait: boolean;
  isTouchDevice: boolean;
}

/**
 * React hook that dynamically detects whether the user is on mobile
 * based on screen width (<= 768px), touch capability, or user manual override.
 */
export function useMobileDetection(manualOverride?: 'auto' | 'mobile' | 'desktop') {
  const [state, setState] = useState<MobileState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        screenWidth: 1280,
        screenHeight: 800,
        isPortrait: false,
        isTouchDevice: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isNarrow = width <= MOBILE_BREAKPOINT_PX;

    let isMob = isNarrow;
    if (manualOverride === 'mobile') isMob = true;
    if (manualOverride === 'desktop') isMob = false;

    return {
      isMobile: isMob,
      screenWidth: width,
      screenHeight: height,
      isPortrait: height > width,
      isTouchDevice: isTouch,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrow = width <= MOBILE_BREAKPOINT_PX;

      let isMob = isNarrow;
      if (manualOverride === 'mobile') isMob = true;
      if (manualOverride === 'desktop') isMob = false;

      setState({
        isMobile: isMob,
        screenWidth: width,
        screenHeight: height,
        isPortrait: height > width,
        isTouchDevice: isTouch,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [manualOverride]);

  return state;
}

/**
 * Standalone helper to detect current mobile status outside of React components.
 */
export function isCurrentViewportMobile(manualOverride?: 'auto' | 'mobile' | 'desktop'): boolean {
  if (manualOverride === 'mobile') return true;
  if (manualOverride === 'desktop') return false;
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= MOBILE_BREAKPOINT_PX;
}

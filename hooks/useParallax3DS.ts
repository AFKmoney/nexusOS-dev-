import { useEffect, useRef, useState, useCallback } from 'react';

export interface ParallaxState {
  // Normalized tilt: [-1, 1]
  tiltX: number;
  tiltY: number;
  // Tap impulse value: [0, 1] spring
  impulse: number;
  // Substrate float offset in pixels for desktop icons (1-2px max)
  iconOffsetX: number;
  iconOffsetY: number;
  // Trigger function for tap/click
  triggerImpulse: () => void;
}

// Global singleton state so DesktopWallpaper, DesktopIconGrid, and touch handlers share identical lerped values
type ParallaxListener = (state: { tiltX: number; tiltY: number; impulse: number }) => void;

class ParallaxController {
  private static instance: ParallaxController;

  // Sensor targets
  private targetTiltX = 0;
  private targetTiltY = 0;

  // Current lerped values
  public currentTiltX = 0;
  public currentTiltY = 0;

  // Spring physics for tap impulse
  public impulsePos = 0;
  private impulseVel = 0;

  private isRunning = false;
  private rafId: number | null = null;
  private lastSensorTime = 0;
  private listeners = new Set<ParallaxListener>();
  private permissionRequested = false;

  private isMobile = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
    }
  }

  public static getInstance(): ParallaxController {
    if (!ParallaxController.instance) {
      ParallaxController.instance = new ParallaxController();
    }
    return ParallaxController.instance;
  }

  public subscribe(listener: ParallaxListener): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) {
      this.start();
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  public triggerImpulse(): void {
    // Kick camera forward (dolly) and pitch tilt
    // Single crisp impulse beat, damped spring returns to 0
    this.impulseVel = Math.min(this.impulseVel + 0.42, 0.85);

    // Also on iOS, request device orientation permission on this user gesture if not yet granted
    this.requestDeviceOrientationPermission();
  }

  public requestDeviceOrientationPermission(): void {
    if (this.permissionRequested) return;
    this.permissionRequested = true;

    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
      ) {
        (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
          .requestPermission()
          .then((res: string) => {
            if (res === 'granted') {
              window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
            }
          })
          .catch(() => {});
      }
    } catch {
      // Ignore
    }
  }

  private equilibriumBeta: number | null = null;
  private equilibriumGamma: number | null = null;

  private handleOrientation = (e: DeviceOrientationEvent): void => {
    const now = performance.now();
    if (now - this.lastSensorTime < 16) return;
    this.lastSensorTime = now;

    const rawGamma = e.gamma ?? 0;
    const rawBeta = e.beta ?? 45;

    // Calibrate natural equilibrium holding angle on first readings
    if (this.equilibriumBeta === null) {
      this.equilibriumBeta = rawBeta;
      this.equilibriumGamma = rawGamma;
    }

    const deltaGamma = rawGamma - (this.equilibriumGamma ?? 0);
    const deltaBeta = rawBeta - (this.equilibriumBeta ?? 45);

    // Normalize into [-1, 1] range with comfortable tilt thresholds (~20 degrees)
    const normX = Math.max(-1, Math.min(1, deltaGamma / 20));
    const normY = Math.max(-1, Math.min(1, deltaBeta / 20));

    this.targetTiltX = normX;
    this.targetTiltY = normY;
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const normX = ((e.clientX / window.innerWidth) - 0.5) * 2;
    const normY = ((e.clientY / window.innerHeight) - 0.5) * 2;

    // Responsive 3D parallax tilt on desktop cursor
    this.targetTiltX = Math.max(-1, Math.min(1, normX * 0.75));
    this.targetTiltY = Math.max(-1, Math.min(1, normY * 0.75));
  };

  private handleTouchMove = (e: TouchEvent): void => {
    const touch = e.touches[0];
    if (touch) {
      const normX = ((touch.clientX / window.innerWidth) - 0.5) * 2;
      const normY = ((touch.clientY / window.innerHeight) - 0.5) * 2;
      this.targetTiltX = Math.max(-1, Math.min(1, normX * 0.85));
      this.targetTiltY = Math.max(-1, Math.min(1, normY * 0.85));
    }
  };

  private start(): void {
    if (this.isRunning || typeof window === 'undefined') return;
    this.isRunning = true;

    // Attach listeners
    window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });

    const step = () => {
      // 1. Lerp smoothing for continuous gyro tilt
      // Using factor ~0.09 for buttery smooth spring-like responsiveness without sensor jitter
      const lerpSpeed = 0.09;
      this.currentTiltX += (this.targetTiltX - this.currentTiltX) * lerpSpeed;
      this.currentTiltY += (this.targetTiltY - this.currentTiltY) * lerpSpeed;

      // 2. Tap impulse spring physics: damped harmonic oscillator
      // F = -k * x - c * v
      const springK = 0.14;   // stiffness: gives that crisp snap
      const damping = 0.82;   // friction: 1-2 oscillations max, quickly resting at 0
      const force = -springK * this.impulsePos;
      this.impulseVel = (this.impulseVel + force) * damping;
      this.impulsePos += this.impulseVel;

      // Settle near zero to avoid micro-renders
      if (Math.abs(this.impulsePos) < 0.001 && Math.abs(this.impulseVel) < 0.001) {
        this.impulsePos = 0;
        this.impulseVel = 0;
      }

      // Notify subscribers
      const payload = {
        tiltX: this.currentTiltX,
        tiltY: this.currentTiltY,
        impulse: this.impulsePos,
      };

      this.listeners.forEach((listener) => listener(payload));

      if (this.isRunning) {
        this.rafId = requestAnimationFrame(step);
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  private stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', this.handleOrientation);
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleTouchMove);
    }
  }
}

export function useParallax3DS(): ParallaxState {
  const controller = ParallaxController.getInstance();

  const [state, setState] = useState(() => ({
    tiltX: controller.currentTiltX,
    tiltY: controller.currentTiltY,
    impulse: controller.impulsePos,
  }));

  useEffect(() => {
    return controller.subscribe((next) => {
      setState(next);
    });
  }, [controller]);

  const triggerImpulse = useCallback(() => {
    controller.triggerImpulse();
  }, [controller]);

  // Home menu 3DS floating offset for icons (1-2 px max)
  // Trash and desktop icons float minutely; dock/taskbar remains glued
  const iconOffsetX = -state.tiltX * 1.8;
  const iconOffsetY = -state.tiltY * 1.8;

  return {
    tiltX: state.tiltX,
    tiltY: state.tiltY,
    impulse: state.impulse,
    iconOffsetX,
    iconOffsetY,
    triggerImpulse,
  };
}

export const parallaxEngine = ParallaxController.getInstance();

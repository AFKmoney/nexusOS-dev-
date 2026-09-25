import React, { useEffect, useMemo, useRef } from 'react';
import { PROCEDURAL_WALLPAPERS } from '../appShellConstants';
import { vfs, SYSTEM_VFS_APP_ID } from '../kernel/fileSystem';
import { useOS } from '../store/osStore';
import { useParallax3DS } from '../hooks/useParallax3DS';
import GyroscopicImage3D from './GyroscopicImage3D';

type DesktopWallpaperProps = {
  wallpaper: string;
};

// Bootstrap injected into animated wallpaper iframes so they receive continuous 3DS gyro & tap impulses
const POINTER_BRIDGE = `<script>
window.__nexus3D = { tiltX: 0, tiltY: 0, impulse: 0, strength: 0.6 };
(function(){
  window.addEventListener('message', function(ev){
    var d = ev.data;
    if(!d || d.__nexusPointer !== true) return;
    if(d.kind === '3d_gyro') {
      window.__nexus3D.tiltX = d.tiltX || 0;
      window.__nexus3D.tiltY = d.tiltY || 0;
      window.__nexus3D.impulse = d.impulse || 0;
      window.__nexus3D.strength = d.strength || 0.6;
      var simX = (0.5 + window.__nexus3D.tiltX * window.__nexus3D.strength * 0.45) * (window.innerWidth || 800);
      var simY = (0.5 + window.__nexus3D.tiltY * window.__nexus3D.strength * 0.45) * (window.innerHeight || 600);
      try {
        var mEvt = new MouseEvent('mousemove', { clientX: simX, clientY: simY, bubbles: true, cancelable: true, view: window });
        window.dispatchEvent(mEvt);
        if (document.body) document.body.dispatchEvent(mEvt);
        if (window.__nexus3D.impulse > 0.3) {
          var cEvt = new MouseEvent('click', { clientX: simX, clientY: simY, bubbles: true, cancelable: true, view: window });
          window.dispatchEvent(cEvt);
          if (document.body) document.body.dispatchEvent(cEvt);
        }
      } catch(e) {}
      return;
    }
    var init = { clientX: d.x, clientY: d.y, bubbles: true, cancelable: true, view: window };
    try {
      var evt = new MouseEvent(d.kind, init);
      window.dispatchEvent(evt);
      if (document.body) document.body.dispatchEvent(evt);
    } catch (e) {}
  });
})();
function getGyro3D(){ return window.__nexus3D; }
</script>`;

const isHtmlDocument = (s: string) =>
  s.startsWith('<!DOCTYPE') || s.startsWith('<html');

function withPointerBridge(html: string): string {
  if (html.includes('</body>')) {
    return html.replace('</body>', POINTER_BRIDGE + '</body>');
  }
  if (html.includes('</html>')) {
    return html.replace('</html>', POINTER_BRIDGE + '</html>');
  }
  return html + POINTER_BRIDGE;
}

export default function DesktopWallpaper({ wallpaper }: DesktopWallpaperProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const motionStrength = useOS(state => state.wallpaperMotionStrength) ?? 0.6;
  const { tiltX, tiltY, impulse } = useParallax3DS();

  const activeWallpaperKey = wallpaper || 'nexus://procedural/nebula';

  const resolved = useMemo<{ kind: 'html'; doc: string } | { kind: 'image'; url: string } | null>(() => {
    if (activeWallpaperKey.startsWith('nexus://procedural/')) {
      const html = PROCEDURAL_WALLPAPERS[activeWallpaperKey] || PROCEDURAL_WALLPAPERS['nexus://procedural/nebula'];
      return html ? { kind: 'html', doc: withPointerBridge(html) } : null;
    }

    if (isHtmlDocument(activeWallpaperKey)) {
      return { kind: 'html', doc: withPointerBridge(activeWallpaperKey) };
    }

    if (activeWallpaperKey.startsWith('/')) {
      const content = vfs.readFile(activeWallpaperKey, SYSTEM_VFS_APP_ID) ?? '';
      if (isHtmlDocument(content)) {
        return { kind: 'html', doc: withPointerBridge(content) };
      }
      return { kind: 'image', url: activeWallpaperKey };
    }

    return { kind: 'image', url: activeWallpaperKey };
  }, [activeWallpaperKey]);

  // Forward desktop pointer activity into animated iframe
  useEffect(() => {
    if (!resolved || resolved.kind !== 'html') return;

    let rafId: number | null = null;
    let lastMoveEvent: MouseEvent | null = null;

    const post = (kind: 'mousemove' | 'click', e: MouseEvent) => {
      const win = iframeRef.current?.contentWindow;
      if (win) win.postMessage({ __nexusPointer: true, kind, x: e.clientX, y: e.clientY }, '*');
    };

    const onMove = (e: MouseEvent) => {
      lastMoveEvent = e;
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          if (lastMoveEvent) {
            post('mousemove', lastMoveEvent);
          }
        });
      }
    };
    const onClick = (e: MouseEvent) => post('click', e);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [resolved]);

  // Continuously stream 3DS gyro & tap impulses into procedural iframes
  useEffect(() => {
    if (!resolved || resolved.kind !== 'html') return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    win.postMessage({
      __nexusPointer: true,
      kind: '3d_gyro',
      tiltX,
      tiltY,
      impulse,
      strength: motionStrength
    }, '*');
  }, [tiltX, tiltY, impulse, motionStrength, resolved]);

  if (!resolved) return null;

  if (resolved.kind === 'image') {
    return <GyroscopicImage3D url={resolved.url} />;
  }

  // 3DS Perspective tilt container for procedural wallpapers: smooth camera perspective viewport
  const rotX = (tiltY * 4.8 + impulse * 1.5) * motionStrength;
  const rotY = (-tiltX * 4.8) * motionStrength;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      <div
        className="w-full h-full relative"
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`,
          transformOrigin: 'center center',
          transition: 'transform 0.04s linear',
          willChange: 'transform',
        }}
      >
        <iframe
          ref={iframeRef}
          srcDoc={resolved.doc}
          className="absolute border-none pointer-events-none w-full h-full inset-0"
          sandbox="allow-scripts"
          title="wallpaper"
        />
      </div>
    </div>
  );
}

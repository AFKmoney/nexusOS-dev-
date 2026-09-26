import { eventBus, OS_EVENTS } from './eventBus';
import { appGenerator } from './appGenerator';
import { useOS } from '../store/osStore';

export type AppCommand = {
  appId: string;
  command: 'click' | 'set' | 'read' | 'eval' | 'focus';
  selector?: string;
  value?: string;
  code?: string;
};

export function listLiveGeneratedApps(): Array<{ id: string; name: string; path: string; open: boolean }> {
  const os = useOS.getState();
  const openIds = new Set(os.windows.map(w => w.appId));
  const fromVfs = appGenerator.list().map(m => ({
    id: m.id,
    name: m.name,
    path: `/system/apps/${m.id}`,
    open: openIds.has(m.id),
  }));
  const extra = os.registry
    .filter(a => a.isCustom && !fromVfs.some(g => g.id === a.id))
    .map(a => ({
      id: a.id,
      name: a.name,
      path: a.sourcePath || '',
      open: openIds.has(a.id),
    }));
  return [...fromVfs, ...extra];
}

export function dispatchAppCommand(cmd: AppCommand): string {
  if (!cmd.appId) return '[APP] missing appId';
  const os = useOS.getState();
  const exists = os.registry.find(a => a.id === cmd.appId) || appGenerator.list().find(a => a.id === cmd.appId);
  if (!exists) return `[APP] unknown app ${cmd.appId}`;
  if (!os.windows.some(w => w.appId === cmd.appId)) {
    os.openWindow(cmd.appId);
  }
  eventBus.emit(OS_EVENTS.APP_COMMAND, cmd);
  return `[APP] ${cmd.command} → ${cmd.appId}${cmd.selector ? ' ' + cmd.selector : ''}`;
}

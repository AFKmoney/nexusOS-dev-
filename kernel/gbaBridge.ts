import { eventBus, OS_EVENTS } from './eventBus';

export type GbaAction = 'play' | 'pause' | 'load' | 'press' | 'open';

export function dispatchGbaCommand(args: {
  action?: string;
  key?: string;
  rom?: string;
}): string {
  const action = String(args.action || '').trim() as GbaAction;
  if (!action) return '[GBA] missing action';

  if (action === 'open') {
    eventBus.emit(OS_EVENTS.APP_LAUNCHED, { appId: 'gba' });
  }

  eventBus.emit(OS_EVENTS.GBA_COMMAND, {
    action,
    key: args.key,
    rom: args.rom,
  });

  return `[GBA] ${action} ${String(args.key || args.rom || '')}`.trim();
}

export function partitionGbaToolCalls<T extends { name: string; arguments?: unknown }>(
  toolCalls: T[]
): { gba: T[]; rest: T[] } {
  const gba: T[] = [];
  const rest: T[] = [];
  for (const call of toolCalls) {
    if (call.name === 'gba_command') gba.push(call);
    else rest.push(call);
  }
  return { gba, rest };
}

export function executeGbaToolCalls(
  toolCalls: { name: string; arguments?: unknown }[]
): string {
  const lines: string[] = [];
  for (const call of toolCalls) {
    const raw = call.arguments;
    const args = typeof raw === 'string' ? safeParse(raw) : ((raw || {}) as Record<string, unknown>);
    lines.push(
      dispatchGbaCommand({
        action: String(args.action || ''),
        key: args.key != null ? String(args.key) : undefined,
        rom: args.rom != null ? String(args.rom) : undefined,
      })
    );
  }
  return lines.join('\n');
}

function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return {};
  }
}

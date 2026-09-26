// NEXUS OS ACTION TOOL DEFINITIONS — Native Function-Calling Schema
import { AITool } from '../services/aiProviders';
import './gbaBridge';

const str = (description: string) => ({ type: 'string' as const, description });

export function getOsActionTools(): AITool[] {
  return [
    { name: 'write_file', description: 'Write content to a VFS file', parameters: { type: 'object', properties: { path: str('VFS path'), content: str('File content') }, required: ['path', 'content'] } },
    { name: 'read_file', description: 'Read a VFS file', parameters: { type: 'object', properties: { path: str('VFS path') }, required: ['path'] } },
    { name: 'delete_file', description: 'Move a file to the Recycle Bin', parameters: { type: 'object', properties: { path: str('VFS path') }, required: ['path'] } },
    { name: 'move_file', description: 'Move a VFS file', parameters: { type: 'object', properties: { src: str('Source path'), dest: str('Destination path') }, required: ['src', 'dest'] } },
    { name: 'copy_file', description: 'Copy a VFS file', parameters: { type: 'object', properties: { src: str('Source path'), dest: str('Destination path') }, required: ['src', 'dest'] } },
    { name: 'list_dir', description: 'List a VFS directory', parameters: { type: 'object', properties: { path: str('Directory path') }, required: ['path'] } },
    { name: 'create_folder', description: 'Create a VFS folder', parameters: { type: 'object', properties: { path: str('Folder path') }, required: ['path'] } },
    { name: 'search_files', description: 'Search VFS names and contents', parameters: { type: 'object', properties: { query: str('Search query') }, required: ['query'] } },
    { name: 'empty_trash', description: 'Empty the Recycle Bin', parameters: { type: 'object', properties: {} } },

    { name: 'open_app', description: 'Open an application', parameters: { type: 'object', properties: { appId: str('App id e.g. hyperide, gba, settings'), data: { type: 'object', description: 'Optional launch payload' } }, required: ['appId'] } },
    { name: 'close_app', description: 'Close an app window', parameters: { type: 'object', properties: { appId: str('App or window id') }, required: ['appId'] } },
    { name: 'focus_app', description: 'Focus an open app, or open it', parameters: { type: 'object', properties: { appId: str('App id') }, required: ['appId'] } },
    { name: 'minimize_all', description: 'Minimize every window', parameters: { type: 'object', properties: {} } },
    { name: 'ide_open_file', description: 'Open a file in HyperIDE', parameters: { type: 'object', properties: { path: str('VFS path') }, required: ['path'] } },

    { name: 'notify', description: 'Show a system notification', parameters: { type: 'object', properties: { title: str('Title'), message: str('Body') }, required: ['title', 'message'] } },
    { name: 'set_wallpaper', description: 'Change wallpaper', parameters: { type: 'object', properties: { wallpaperId: str('Wallpaper id') }, required: ['wallpaperId'] } },
    { name: 'set_theme', description: 'Change theme preset', parameters: { type: 'object', properties: { name: str('Theme name') }, required: ['name'] } },
    { name: 'set_accent', description: 'Change accent color', parameters: { type: 'object', properties: { hex: str('#rrggbb') }, required: ['hex'] } },
    { name: 'clipboard_copy', description: 'Copy text to the clipboard', parameters: { type: 'object', properties: { text: str('Text to copy') }, required: ['text'] } },
    { name: 'take_screenshot', description: 'Capture the screen to VFS', parameters: { type: 'object', properties: {} } },
    { name: 'analyze_screen', description: 'Capture and analyze the screen', parameters: { type: 'object', properties: { question: str('What to look for') } } },
    { name: 'play_audio', description: 'Play an audio file in Music', parameters: { type: 'object', properties: { path: str('VFS audio path') }, required: ['path'] } },
    { name: 'speak', description: 'Speak text aloud', parameters: { type: 'object', properties: { text: str('Utterance') }, required: ['text'] } },
    { name: 'listen', description: 'Listen on the microphone and return a transcript', parameters: { type: 'object', properties: {} } },

    { name: 'remember', description: 'Store a fact in long-term memory', parameters: { type: 'object', properties: { content: str('What to remember') }, required: ['content'] } },
    { name: 'index_docs', description: 'Index a VFS file or folder for RAG', parameters: { type: 'object', properties: { path: str('VFS path') }, required: ['path'] } },
    { name: 'search_rag', description: 'Query indexed documents', parameters: { type: 'object', properties: { query: str('Question') }, required: ['query'] } },

    { name: 'run_command', description: 'Run a commander/shell command inside the OS', parameters: { type: 'object', properties: { command: str('Command string') }, required: ['command'] } },
    { name: 'run_native', description: 'Run a host/native command via Electron', parameters: { type: 'object', properties: { command: str('Host command') }, required: ['command'] } },
    { name: 'execute_js', description: 'Run JavaScript in the OS sandbox', parameters: { type: 'object', properties: { code: str('JavaScript') }, required: ['code'] } },
    { name: 'exec_code', description: 'Run a snippet in a language sandbox', parameters: { type: 'object', properties: { language: str('js|py|sh'), code: str('Source') }, required: ['language', 'code'] } },
    { name: 'schedule_task', description: 'Repeat a command on an interval', parameters: { type: 'object', properties: { seconds: { type: 'string', description: 'Interval in seconds' }, command: str('Command to run') }, required: ['seconds', 'command'] } },
    { name: 'emit_event', description: 'Emit an internal OS event', parameters: { type: 'object', properties: { event: str('Event name'), data: str('JSON or text payload') }, required: ['event'] } },

    { name: 'open_url', description: 'Open a URL in NetRunner', parameters: { type: 'object', properties: { url: str('URL') }, required: ['url'] } },
    { name: 'web_search', description: 'Search the web', parameters: { type: 'object', properties: { query: str('Query') }, required: ['query'] } },
    { name: 'browse_navigate', description: 'Navigate the agent browser', parameters: { type: 'object', properties: { url: str('URL') }, required: ['url'] } },
    { name: 'browse_back', description: 'Browser back', parameters: { type: 'object', properties: {} } },
    { name: 'browse_forward', description: 'Browser forward', parameters: { type: 'object', properties: {} } },
    { name: 'browse_reload', description: 'Reload current page', parameters: { type: 'object', properties: {} } },
    { name: 'browse_extract', description: 'Extract text from the current page', parameters: { type: 'object', properties: { selector: str('CSS selector, default body'), maxChars: str('Max characters') } } },
    { name: 'browse_click', description: 'Click a selector in the agent browser', parameters: { type: 'object', properties: { selector: str('CSS selector') }, required: ['selector'] } },
    { name: 'browse_input', description: 'Type into a selector', parameters: { type: 'object', properties: { selector: str('CSS selector'), value: str('Value') }, required: ['selector', 'value'] } },
    { name: 'browse_scroll', description: 'Scroll the agent browser', parameters: { type: 'object', properties: { deltaX: str('px'), deltaY: str('px') } } },
    { name: 'browse_state', description: 'Read current browser URL/title/state', parameters: { type: 'object', properties: {} } },

    { name: 'git_init', description: 'git init', parameters: { type: 'object', properties: { path: str('Repo path') }, required: ['path'] } },
    { name: 'git_add', description: 'git add a file', parameters: { type: 'object', properties: { path: str('Repo path'), file: str('File path') }, required: ['path', 'file'] } },
    { name: 'git_add_all', description: 'git add -A', parameters: { type: 'object', properties: { path: str('Repo path') }, required: ['path'] } },
    { name: 'git_commit', description: 'git commit', parameters: { type: 'object', properties: { path: str('Repo path'), message: str('Commit message') }, required: ['path', 'message'] } },
    { name: 'git_log', description: 'git log', parameters: { type: 'object', properties: { path: str('Repo path') }, required: ['path'] } },
    { name: 'git_diff', description: 'git diff', parameters: { type: 'object', properties: { path: str('Repo path') }, required: ['path'] } },
    { name: 'git_status', description: 'git status', parameters: { type: 'object', properties: { path: str('Repo path') }, required: ['path'] } },
    { name: 'git_branch', description: 'List branches', parameters: { type: 'object', properties: { path: str('Repo path') }, required: ['path'] } },
    { name: 'git_checkout', description: 'Checkout a ref', parameters: { type: 'object', properties: { path: str('Repo path'), ref: str('Branch or commit') }, required: ['path', 'ref'] } },

    { name: 'spawn_agent', description: 'Spawn a sub-agent', parameters: { type: 'object', properties: { goal: str('Goal'), role: { type: 'string', description: 'Specialization', enum: ['planner', 'coder', 'reviewer', 'tester', 'researcher', 'architect', 'debugger'] } }, required: ['goal'] } },
    { name: 'agent_message', description: 'Send a message to a running agent', parameters: { type: 'object', properties: { toId: str('Target agent id'), message: str('Message') }, required: ['toId', 'message'] } },
    { name: 'add_goal', description: 'Queue an AutoPilot goal', parameters: { type: 'object', properties: { description: str('Goal'), priority: { type: 'string', enum: ['low', 'normal', 'high', 'critical'] } }, required: ['description'] } },
    { name: 'get_goals', description: 'List AutoPilot goals', parameters: { type: 'object', properties: {} } },
    { name: 'complete_goal', description: 'Mark an AutoPilot goal complete', parameters: { type: 'object', properties: { goalId: str('Goal id') }, required: ['goalId'] } },
    { name: 'set_autopilot', description: 'Engage or disengage AutoPilot', parameters: { type: 'object', properties: { mode: { type: 'string', enum: ['on', 'off'] } }, required: ['mode'] } },

    { name: 'forge_skill', description: 'Create or update a skill. Set exposeAs to register a new OS::COMMAND the agent can call later.', parameters: { type: 'object', properties: { name: str('Skill name'), description: str('Summary'), code: str('JavaScript body. Receives ctx.'), exposeAs: str('Optional OS command name, e.g. SNAP_NOTES') }, required: ['name', 'description', 'code'] } },
    { name: 'call_skill', description: 'Run a forged skill', parameters: { type: 'object', properties: { name: str('Skill name'), args: { type: 'object', description: 'ctx.args' } }, required: ['name'] } },
    { name: 'list_skills', description: 'List forged skills', parameters: { type: 'object', properties: {} } },
    { name: 'delete_skill', description: 'Delete a forged skill', parameters: { type: 'object', properties: { name: str('Skill name') }, required: ['name'] } },
    { name: 'build_app', description: 'Generate an app from a description, register it, and open it', parameters: { type: 'object', properties: { description: str('What to build'), name: str('Optional name') }, required: ['description'] } },
    { name: 'list_apps', description: 'List generated apps the agent created plus whether they are open', parameters: { type: 'object', properties: {} } },
    { name: 'use_app', description: 'Drive a generated app: open it and click/set/read/eval inside it', parameters: { type: 'object', properties: { appId: str('gen_… id'), command: { type: 'string', enum: ['focus', 'click', 'set', 'read', 'eval'] }, selector: str('CSS selector'), value: str('Value for set'), code: str('JS for eval') }, required: ['appId', 'command'] } },
    { name: 'self_evolve', description: 'Trigger a self-evolution pass', parameters: { type: 'object', properties: { directive: str('What to evolve') } } },

    { name: 'cluster_scan', description: 'Scan the local cluster', parameters: { type: 'object', properties: {} } },
    { name: 'cluster_status', description: 'Read cluster status', parameters: { type: 'object', properties: {} } },

    { name: 'gba_command', description: 'Control GBA Station: play, pause, load a ROM, or press a key', parameters: { type: 'object', properties: { action: { type: 'string', enum: ['play', 'pause', 'load', 'press', 'open'] }, key: str('Pad key'), rom: str('ROM filename in /home/user/Roms') }, required: ['action'] } },
    { name: 'x_open', description: 'Open the X app', parameters: { type: 'object', properties: {} } },
    { name: 'x_search', description: 'Search X posts', parameters: { type: 'object', properties: { query: str('Search query') }, required: ['query'] } },
    { name: 'x_post', description: 'Post to X. Uses saved local token, otherwise opens compose.', parameters: { type: 'object', properties: { text: str('Tweet text, max 280') }, required: ['text'] } },
    { name: 'x_timeline', description: 'Open X home or saved handle timeline', parameters: { type: 'object', properties: {} } },
    { name: 'x_profile', description: 'Open an X profile', parameters: { type: 'object', properties: { handle: str('Username without required @') }, required: ['handle'] } },
  ];
}

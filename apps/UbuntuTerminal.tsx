
import React, { useState, useRef, useEffect } from 'react';
import { SYSTEM_VFS_APP_ID,  vfs } from '../kernel/fileSystem';
import { useOS } from '../store/osStore';
import { Info, Terminal as TerminalIcon } from 'lucide-react';
import DOMPurify from 'dompurify';

type TerminalLine = { type: 'text'; content: string } | { type: 'html'; content: string };

export default function UbuntuTerminalApp({ windowId }: { windowId: string }) {
  const { addNotification } = useOS();
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'text', content: 'Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-89-generic x86_64)' },
    { type: 'text', content: '' },
    { type: 'text', content: ' * Documentation:  https://help.ubuntu.com' },
    { type: 'text', content: ' * Management:     https://landscape.canonical.com' },
    { type: 'text', content: ' * Support:        https://ubuntu.com/pro' },
    { type: 'text', content: '' },
    { type: 'text', content: 'System information as of ' + new Date().toUTCString() },
    { type: 'text', content: '' },
    { type: 'text', content: '0 updates can be applied immediately.' },
    { type: 'text', content: '' },
  ]);
  
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [cwd, setCwd] = useState('/home/user');
  const [installedPackages, setInstalledPackages] = useState<string[]>(['coreutils', 'apt']);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m] ?? m);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [history]);

  const print = (line: string | TerminalLine) => {
    if (typeof line === 'string') {
      setHistory(prev => [...prev, { type: 'text', content: line }]);
    } else {
      setHistory(prev => [...prev, line]);
    }
  };

  const getPrompt = () => {
    let displayDir = cwd;
    if (cwd.startsWith('/home/user')) {
      displayDir = '~' + cwd.slice('/home/user'.length);
    }
    return (
      <span className="font-bold">
        <span className="text-[#8ae234]">user@nexus-ubuntu</span>
        <span className="text-white">:</span>
        <span className="text-[#729fcf]">{displayDir}</span>
        <span className="text-white">$</span>
      </span>
    );
  };

  const constructPromptString = () => {
    let displayDir = cwd;
    if (cwd.startsWith('/home/user')) displayDir = '~' + cwd.slice(10);
    return `user@nexus-ubuntu:${displayDir}$`;
  };

  const resolvePath = (target: string) => {
    if (target.startsWith('/')) return target;
    if (target === '~') return '/home/user';
    if (target === '.') return cwd;
    if (target === '..') {
      const parts = cwd.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/');
    }
    return cwd === '/' ? `/${target}` : `${cwd}/${target}`;
  };

  const handleCommand = async (cmdString: string) => {
    const rawArgs = cmdString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const args = rawArgs.map(a => a.startsWith('"') && a.endsWith('"') ? a.slice(1, -1) : a);
    if (!args.length) return;

    let effectiveArgs = [...args];
    if (effectiveArgs[0]?.toLowerCase() === 'sudo') {
      effectiveArgs.shift();
    }
    if (!effectiveArgs.length) return;

    const rawCmd = effectiveArgs[0];
    if (!rawCmd) return;
    const cmd = rawCmd.toLowerCase();
    
    switch (cmd) {
      case 'clear':
        setHistory([]);
        break;
        
      case 'pwd':
        print(cwd);
        break;
        
      case 'whoami':
        print('user');
        break;

      case 'id':
        print('uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev)');
        break;

      case 'hostname':
        print('nexus-ubuntu');
        break;

      case 'date':
        print(new Date().toUTCString());
        break;

      case 'uptime':
        print(' 14:02:19 up 3:42,  1 user,  load average: 0.14, 0.08, 0.02');
        break;

      case 'df':
        print('Filesystem     1K-blocks    Used Available Use% Mounted on');
        print('/dev/root        8256384 1421056   6415328  18% /');
        print('tmpfs             512000       0    512000   0% /dev/shm');
        print('vfs-subsystem    1048576   32768   1015808   3% /home/user');
        break;

      case 'free':
        print('               total        used        free      shared  buff/cache   available');
        print('Mem:         8192000      245760     6840320       12288     1105920     7946240');
        print('Swap:        2097152           0     2097152');
        break;

      case 'ps':
        print('    PID TTY          TIME CMD');
        print('   1024 pts/0    00:00:00 bash');
        print('   1428 pts/0    00:00:00 ps');
        break;

      case 'uname':
        if (effectiveArgs[1] === '-a') {
          print('Linux nexus-ubuntu 5.15.0-89-generic #99-Ubuntu SMP Mon Oct 30 20:42:41 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux');
        } else if (effectiveArgs[1] === '-r') {
          print('5.15.0-89-generic');
        } else if (effectiveArgs[1] === '-m') {
          print('x86_64');
        } else {
          print('Linux');
        }
        break;

      case 'ls': {
        const targetDir = effectiveArgs[1] && !effectiveArgs[1].startsWith('-') ? resolvePath(effectiveArgs[1]) : cwd;
        const stat = vfs.stat(targetDir);
        if (!stat || stat.type !== 'directory') {
          print(`ls: cannot access '${targetDir}': No such file or directory`);
        } else {
          const children = vfs.listDir(targetDir) || [];
          if (children.length === 0) break;
          
          if (effectiveArgs.includes('-l') || effectiveArgs.includes('-la')) {
            print(`total ${children.length * 4}`);
            children.forEach(c => {
              const cstat = vfs.stat(`${targetDir === '/' ? '' : targetDir}/${c}`);
              const perms = cstat?.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--';
              const size = cstat?.type === 'directory' ? 4096 : (vfs.readFile(`${targetDir === '/' ? '' : targetDir}/${c}`, SYSTEM_VFS_APP_ID)?.length || 0);
              const date = new Date(cstat?.modified || Date.now()).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
              const escapedName = escapeHtml(c);
              const nameHtml = cstat?.type === 'directory' ? `<span class="text-[#729fcf] font-bold">${escapedName}</span>` : escapedName;
              print({ type: 'html', content: `${perms} 1 user user ${size.toString().padStart(6)} ${date} ${nameHtml}` });
            });
          } else {
            const out = children.map(c => {
              const cstat = vfs.stat(`${targetDir === '/' ? '' : targetDir}/${c}`);
              const escapedName = escapeHtml(c);
              return cstat?.type === 'directory' ? `<span class="text-[#729fcf] font-bold">${escapedName}</span>` : escapedName;
            }).join('  ');
            print({ type: 'html', content: out });
          }
        }
        break;
      }

      case 'cd': {
        const targetArg = effectiveArgs[1];
        const newDir = targetArg ? resolvePath(targetArg) : '/home/user';
        const st = vfs.stat(newDir);
        if (!st) {
          print(`bash: cd: ${targetArg ?? ''}: No such file or directory`);
        } else if (st.type !== 'directory') {
          print(`bash: cd: ${targetArg ?? ''}: Not a directory`);
        } else {
          setCwd(newDir);
        }
        break;
      }

      case 'mkdir':
        if (!effectiveArgs[1]) { print('mkdir: missing operand'); break; }
        vfs.createDir(resolvePath(effectiveArgs[1]), SYSTEM_VFS_APP_ID);
        break;

      case 'touch':
        if (!effectiveArgs[1]) { print('touch: missing file operand'); break; }
        vfs.writeFile(resolvePath(effectiveArgs[1]), '', SYSTEM_VFS_APP_ID);
        break;

      case 'rm':
        if (!effectiveArgs[1]) { print('rm: missing operand'); break; }
        vfs.delete(resolvePath(effectiveArgs[1]), SYSTEM_VFS_APP_ID);
        break;

      case 'cat': {
        if (!effectiveArgs[1]) { print('cat: missing operand'); break; }
        const targetPath = resolvePath(effectiveArgs[1]);
        if (targetPath === '/etc/os-release' || targetPath === '/etc/issue') {
          print('NAME="Ubuntu"');
          print('VERSION="22.04.3 LTS (Jammy Jellyfish)"');
          print('ID=ubuntu');
          print('ID_LIKE=debian');
          print('PRETTY_NAME="Ubuntu 22.04.3 LTS"');
          print('VERSION_ID="22.04"');
          print('HOME_URL="https://www.ubuntu.com/"');
          print('SUPPORT_URL="https://help.ubuntu.com/"');
          break;
        }
        const content = vfs.readFile(targetPath, SYSTEM_VFS_APP_ID);
        if (content === null) print(`cat: ${effectiveArgs[1]}: No such file or directory`);
        else content.split('\n').forEach(l => print(l));
        break;
      }
        
      case 'echo': {
        const text = effectiveArgs.slice(1).join(' ');
        if (text.includes('>')) {
           const parts = text.split('>');
           const val = parts[0]?.trim() ?? '';
           const file = parts[parts.length - 1]?.trim() ?? '';
           if (file) {
             vfs.writeFile(resolvePath(file), val, SYSTEM_VFS_APP_ID);
           }
        } else {
           print(text);
        }
        break;
      }
        
      case 'grep':
        if (effectiveArgs.length < 3) { print('grep: missing operand'); break; }
        const term = effectiveArgs[1] ?? '';
        const grepTarget = effectiveArgs[2];
        if (!grepTarget) { print('grep: missing operand'); break; }
        const gcontent = vfs.readFile(resolvePath(grepTarget), SYSTEM_VFS_APP_ID);
        if (gcontent === null) {
            print(`grep: ${grepTarget}: No such file or directory`);
        } else {
            gcontent.split('\n').forEach(line => {
                if (term && line.includes(term)) {
                    const escapedLine = escapeHtml(line);
                    const escapedTerm = escapeHtml(term);
                    const highlighted = escapedLine.replace(new RegExp(escapedTerm, 'g'), `<span class="text-red-500 font-bold">${escapedTerm}</span>`);
                    print({ type: 'html', content: highlighted });
                }
            });
        }
        break;

      case 'apt':
      case 'apt-get':
        if (effectiveArgs[1] === 'update') {
          print('Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease');
          print('Get:2 http://security.ubuntu.com/ubuntu jammy-security InRelease [110 kB]');
          print('Fetched 110 kB in 1s (110 kB/s)');
          print('Reading package lists... Done');
          print('Building dependency tree... Done');
          print('Reading state information... Done');
          print('All packages are up to date.');
        } else if (effectiveArgs[1] === 'install') {
          if (!effectiveArgs[2]) { print('E: No packages found'); break; }
          const pkg = effectiveArgs[2];
          print(`Reading package lists... Done`);
          print(`Building dependency tree... Done`);
          print(`The following NEW packages will be installed:`);
          print(`  ${pkg}`);
          print(`0 upgraded, 1 newly installed, 0 to remove.`);
          print(`Inst ${pkg} (1.0.0 Ubuntu:22.04/jammy [amd64])`);
          print(`Conf ${pkg} (1.0.0 Ubuntu:22.04/jammy [amd64])`);
          setInstalledPackages(prev => [...prev, pkg]);
        }
        break;

      case 'neofetch':
        if (!installedPackages.includes('neofetch')) {
            print("Command 'neofetch' not found, but can be installed with:");
            print("sudo apt install neofetch");
            break;
        }
        print({ type: 'html', content: '<div class="flex gap-4">' });
        print({ type: 'html', content: '<pre class="text-[#E95420]">' });
        print('            .-/+oossssoo+/-.               ');
        print('        `:+ssssssssssssssssss+:`           ');
        print('      -+ssssssssssssssssssyyssss+-         ');
        print('    .ossssssssssssssssssdMMMNysssso.       ');
        print('   /ssssssssssshdmmNNmmyNMMMMhssssss/      ');
        print('  +ssssssssshmydMMMMMMMNddddyssssssss+     ');
        print(' /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/    ');
        print('.ssssssssdMMMNhsssssssssshNMMMdssssssss.   ');
        print('+sssshhhyNMMNyssssssssssssyNMMMysssssss+   ');
        print('ossyNMMMNyMMhsssssssssssssshmmmhssssssso   ');
        print('ossyNMMMNyMMhsssssssssssssshmmmhssssssso   ');
        print('+sssshhhyNMMNyssssssssssssyNMMMysssssss+   ');
        print('.ssssssssdMMMNhsssssssssshNMMMdssssssss.   ');
        print(' /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/    ');
        print('  +sssssssssdmydMMMMMMMMddddyssssssss+     ');
        print('   /ssssssssssshdmNNNNmyNMMMMhssssss/      ');
        print('    .ossssssssssssssssssdMMMNysssso.       ');
        print('      -+sssssssssssssssssyyyssss+-         ');
        print('        `:+ssssssssssssssssss+:`           ');
        print('            .-/+oossssoo+/-.               ');
        print({ type: 'html', content: '</pre>' });
        print({ type: 'html', content: '<div class="flex flex-col gap-1 mt-4">' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">user</span>@<span class="text-[#E95420] font-bold">nexus-ubuntu</span></div>' });
        print('<div>-----------------</div>');
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">OS</span>: Ubuntu 22.04.3 LTS x86_64</div>' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">Host</span>: Nexus VFS Subsystem v2.0</div>' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">Kernel</span>: 5.15.0-89-generic</div>' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">Uptime</span>: 1 hour, 23 mins</div>' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">Packages</span>: ' + escapeHtml(installedPackages.length.toString()) + ' (dpkg)</div>' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">Shell</span>: bash 5.1.16</div>' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">Terminal</span>: nexus-pty</div>' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">CPU</span>: Virtual Processor (16) @ 3.4GHz</div>' });
        print({ type: 'html', content: '<div><span class="text-[#E95420] font-bold">Memory</span>: 142MB / 8192MB</div>' });
        print({ type: 'html', content: '<div class="flex mt-2">' });
        print({ type: 'html', content: '<div class="w-4 h-4 bg-[#2e3436]"></div><div class="w-4 h-4 bg-[#cc0000]"></div><div class="w-4 h-4 bg-[#4e9a06]"></div><div class="w-4 h-4 bg-[#c4a000]"></div><div class="w-4 h-4 bg-[#3465a4]"></div><div class="w-4 h-4 bg-[#75507b]"></div><div class="w-4 h-4 bg-[#06989a]"></div><div class="w-4 h-4 bg-[#d3d7cf]"></div>' });
        print({ type: 'html', content: '</div>' });
        print({ type: 'html', content: '</div></div>' });
        break;
        
      case 'python3':
        if (!installedPackages.includes('python3')) {
            print("Command 'python3' not found, but can be installed with:");
            print("sudo apt install python3");
            break;
        }
        print("Python 3.10.12 (main, Nov 20 2023, 15:14:05) [GCC 11.4.0] on linux");
        print("Type \"help\", \"copyright\", \"credits\" or \"license\" for more information.");
        print(">>> Nexus Virtual REPL active. Evaluating expression...");
        try {
            // simple eval just for fun
            if (args.length > 1 && args[1] === '-c') {
                const input = args[2];
                if (input && /^[0-9+\-*/().\s]+$/.test(input)) {
                    const res = Function(`"use strict";return (${input})`)();
                    print(String(res));
                } else {
                    print("NameError: name 'eval' is not defined (or restricted input for security)");
                }
            } else {
                print("Pass -c 'expression' to evaluate.");
            }
        } catch(e:any) {
            print(`Traceback (most recent call last):\n  File "<stdin>", line 1, in <module>\nNameError: ${e.message}`);
        }
        break;

      default:
        print(`bash: ${cmd}: command not found`);
    }
  };

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    setHistory(prev => [...prev, { type: 'text', content: `${constructPromptString()} ${cmd}` }]);
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setInput('');
    handleCommand(cmd);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(cmdHistory[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[nextIdx] || '');
      }
    }
  };

  const quickCommands = ['ls -la', 'uname -a', 'uptime', 'free', 'df -h', 'clear'];

  return (
    <div className="h-full flex flex-col bg-[#300a24] text-white overflow-hidden custom-scrollbar select-none">
      {/* Header / Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2c001e] border-b border-black/30 shrink-0 select-none">
          <div className="flex items-center gap-2">
              <TerminalIcon size={16} className="text-white/70" />
              <div className="text-xs sm:text-sm font-semibold text-white/90 font-sans tracking-wide">user@nexus-ubuntu:~</div>
          </div>
          <div className="text-[10px] font-mono text-[#8ae234] bg-black/40 px-2 py-0.5 rounded border border-white/5">
            SUBSYSTEM_ONLINE
          </div>
      </div>

      {/* Terminal Content */}
      <div 
        className="flex-1 p-3 font-mono text-xs sm:text-sm overflow-y-auto select-text cursor-text" 
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className="min-h-[18px] whitespace-pre-wrap break-all leading-relaxed">
            {line.type === 'text' ? (
              line.content || ' '
            ) : (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line.content || ' ') }} />
            )}
          </div>
        ))}
        
        <div className="flex items-center mt-1">
          <div className="shrink-0 mr-2 whitespace-pre select-none">{getPrompt()}</div>
          <input
            ref={inputRef}
            id="ubuntu-cli-input"
            type="text"
            className="flex-1 bg-transparent text-white outline-none caret-[#8ae234] font-mono text-xs sm:text-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Mobile & Touch Virtual Shortcut Bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#200015] border-t border-black/40 overflow-x-auto no-scrollbar shrink-0 select-none">
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mr-1 shrink-0">Quick:</span>
        {quickCommands.map(cmd => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-zinc-300 hover:text-white transition shrink-0 active:scale-95"
          >
            {cmd}
          </button>
        ))}
        <button
          onClick={() => {
            setHistory(prev => [...prev, { type: 'text', content: `${constructPromptString()} ^C` }]);
            setInput('');
          }}
          className="px-2 py-1 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-500/30 text-[10px] font-mono text-red-200 transition shrink-0 ml-auto"
        >
          ^C
        </button>
      </div>
    </div>
  );
}

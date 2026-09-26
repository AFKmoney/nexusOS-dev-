import React, { useCallback, useState } from 'react';
import { Calculator, RotateCcw, Activity } from 'lucide-react';

type Op = '+' | '-' | '*' | '/' | null;

function applyOp(left: number, right: number, op: Op): number {
  switch (op) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function formatNum(n: number): string {
  if (!Number.isFinite(n)) return 'Error';
  return Number(n.toPrecision(12)).toString();
}

function symbol(op: Op): string {
  if (op === '*') return '×';
  if (op === '/') return '÷';
  return op ?? '';
}

export default function CalculatorPro() {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const tap = useCallback((fn: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.button !== undefined && e.button !== 0) return;
    fn();
  }, []);

  const inputDigit = (digit: string) => {
    setDisplay((prev) => {
      if (fresh || prev === '0' || prev === 'Error') {
        return digit === '.' ? '0.' : digit;
      }
      if (digit === '.' && prev.includes('.')) return prev;
      return prev + digit;
    });
    setFresh(false);
  };

  const inputOp = (next: Op) => {
    const current = parseFloat(display);
    if (acc !== null && op && !fresh) {
      const result = applyOp(acc, current, op);
      const shown = formatNum(result);
      setAcc(Number.isFinite(result) ? result : null);
      setDisplay(shown);
      setEquation(shown + ' ' + symbol(next) + ' ');
    } else {
      setAcc(current);
      setEquation(display + ' ' + symbol(next) + ' ');
    }
    setOp(next);
    setFresh(true);
  };

  const calculate = () => {
    const current = parseFloat(display);
    if (op === null || acc === null) {
      setHistory((prev) => [display + ' = ' + display, ...prev].slice(0, 10));
      setEquation('');
      setFresh(true);
      return;
    }
    const result = applyOp(acc, current, op);
    const shown = formatNum(result);
    const line = `${acc} ${symbol(op)} ${current} = ${shown}`;
    setHistory((prev) => [line, ...prev].slice(0, 10));
    setDisplay(shown);
    setAcc(Number.isFinite(result) ? result : null);
    setOp(null);
    setEquation('');
    setFresh(true);
  };

  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setEquation('');
    setFresh(true);
  };

  const toggleSign = () => {
    setDisplay((d) => {
      if (d === '0' || d === 'Error') return d;
      return d.startsWith('-') ? d.slice(1) : '-' + d;
    });
  };

  const percent = () => {
    setDisplay((d) => {
      const n = parseFloat(d);
      if (!Number.isFinite(n)) return d;
      return formatNum(n / 100);
    });
    setFresh(true);
  };

  const Btn = ({
    label,
    onPress,
    color = 'bg-white/5',
    textColor = 'text-white',
    className = '',
  }: {
    label: React.ReactNode;
    onPress: () => void;
    color?: string;
    textColor?: string;
    className?: string;
  }) => (
    <button
      type="button"
      onPointerDown={tap(onPress)}
      className={`h-11 sm:h-14 rounded-xl sm:rounded-2xl ${color} ${textColor} text-base sm:text-lg font-bold hover:brightness-125 active:scale-95 transition-all shadow-md border border-white/5 flex items-center justify-center select-none touch-manipulation ${className}`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full bg-[#050508] text-white flex flex-col font-sans overflow-hidden select-none">
      <div className="h-12 sm:h-16 px-4 sm:px-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 sm:p-2 bg-zinc-500/20 rounded-lg">
            <Calculator size={18} className="text-zinc-400" />
          </div>
          <h1 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em]">Computation Core</h1>
        </div>
        <button
          type="button"
          onPointerDown={tap(() => setShowHistory(!showHistory))}
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase transition flex items-center gap-1.5 md:hidden ${
            showHistory ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <RotateCcw size={12} />
          <span>Logs</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto">
          <div className="h-24 sm:h-32 bg-black/40 rounded-2xl sm:rounded-3xl border border-white/5 p-4 sm:p-6 flex flex-col justify-end items-end mb-3 sm:mb-6 shadow-inner relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-2 opacity-5"><Activity size={80} /></div>
            <div className="text-[11px] sm:text-xs font-mono text-zinc-500 mb-0.5 sm:mb-1 truncate w-full text-right">{equation || '\u00a0'}</div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tighter truncate w-full text-right">{display}</div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 flex-1 auto-rows-fr">
            <Btn label="AC" onPress={clear} color="bg-red-500/20" textColor="text-red-400" />
            <Btn label="+/-" onPress={toggleSign} />
            <Btn label="%" onPress={percent} />
            <Btn label="÷" onPress={() => inputOp('/')} color="bg-accent/20" textColor="text-accent" />

            <Btn label="7" onPress={() => inputDigit('7')} />
            <Btn label="8" onPress={() => inputDigit('8')} />
            <Btn label="9" onPress={() => inputDigit('9')} />
            <Btn label="×" onPress={() => inputOp('*')} color="bg-accent/20" textColor="text-accent" />

            <Btn label="4" onPress={() => inputDigit('4')} />
            <Btn label="5" onPress={() => inputDigit('5')} />
            <Btn label="6" onPress={() => inputDigit('6')} />
            <Btn label="-" onPress={() => inputOp('-')} color="bg-accent/20" textColor="text-accent" />

            <Btn label="1" onPress={() => inputDigit('1')} />
            <Btn label="2" onPress={() => inputDigit('2')} />
            <Btn label="3" onPress={() => inputDigit('3')} />
            <Btn label="+" onPress={() => inputOp('+')} color="bg-accent/20" textColor="text-accent" />

            <Btn label="0" onPress={() => inputDigit('0')} className="col-span-2" />
            <Btn label="." onPress={() => inputDigit('.')} />
            <Btn label="=" onPress={calculate} color="bg-accent" textColor="text-black shadow-accent" />
          </div>
        </div>

        <div className={`${showHistory ? 'absolute inset-0 z-20 md:static' : 'hidden md:block'} md:w-64 border-l border-white/5 bg-[#050508]/95 backdrop-blur-xl md:bg-black/20 p-4 overflow-y-auto custom-scrollbar`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <RotateCcw size={12} /> Computation Logs
            </div>
            {showHistory && (
              <button type="button" onPointerDown={tap(() => setShowHistory(false))} className="md:hidden text-xs text-zinc-400 hover:text-white">
                Close
              </button>
            )}
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 text-[11px] font-mono text-zinc-300 break-all">
                {h}
              </div>
            ))}
            {!history.length && <div className="text-[10px] text-zinc-500 italic">No cycles performed</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

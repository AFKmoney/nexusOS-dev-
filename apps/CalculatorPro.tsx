import React, { useState } from 'react';
import { Calculator, Delete, RotateCcw, Equal, Percent, Hash, Activity } from 'lucide-react';

export default function CalculatorPro() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleDigit = (digit: string) => {
    setDisplay(prev => prev === '0' ? digit : prev + digit);
  };

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEq = equation + display;
      // Use Function constructor instead of eval for slight safety boost in local context
      const result = new Function(`return ${fullEq.replace('×', '*').replace('÷', '/')}`)();
      const resStr = result.toString();
      setHistory(prev => [fullEq + ' = ' + resStr, ...prev].slice(0, 10));
      setDisplay(resStr);
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => { setDisplay('0'); setEquation(''); };

  const Btn = ({ label, onClick, color = 'bg-white/5', textColor = 'text-white', className = '' }: any) => (
    <button 
      onClick={onClick}
      className={`h-11 sm:h-14 rounded-xl sm:rounded-2xl ${color} ${textColor} text-base sm:text-lg font-bold hover:brightness-125 active:scale-95 transition-all shadow-md border border-white/5 flex items-center justify-center ${className}`}
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
          onClick={() => setShowHistory(!showHistory)}
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase transition flex items-center gap-1.5 md:hidden ${
            showHistory ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <RotateCcw size={12} />
          <span>Logs</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Calc */}
        <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto">
          <div className="h-24 sm:h-32 bg-black/40 rounded-2xl sm:rounded-3xl border border-white/5 p-4 sm:p-6 flex flex-col justify-end items-end mb-3 sm:mb-6 shadow-inner relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-2 opacity-5"><Activity size={80} /></div>
            <div className="text-[11px] sm:text-xs font-mono text-zinc-500 mb-0.5 sm:mb-1 truncate w-full text-right">{equation || '0'}</div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tighter truncate w-full text-right">{display}</div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 flex-1 auto-rows-fr">
            <Btn label="AC" onClick={clear} color="bg-red-500/20" textColor="text-red-400" />
            <Btn label="+/-" onClick={() => setDisplay(d => (parseFloat(d) * -1).toString())} />
            <Btn label="%" onClick={() => setDisplay(d => (parseFloat(d) / 100).toString())} />
            <Btn label="÷" onClick={() => handleOp('÷')} color="bg-accent/20" textColor="text-accent" />
            
            <Btn label="7" onClick={() => handleDigit('7')} />
            <Btn label="8" onClick={() => handleDigit('8')} />
            <Btn label="9" onClick={() => handleDigit('9')} />
            <Btn label="×" onClick={() => handleOp('×')} color="bg-accent/20" textColor="text-accent" />
            
            <Btn label="4" onClick={() => handleDigit('4')} />
            <Btn label="5" onClick={() => handleDigit('5')} />
            <Btn label="6" onClick={() => handleDigit('6')} />
            <Btn label="-" onClick={() => handleOp('-')} color="bg-accent/20" textColor="text-accent" />
            
            <Btn label="1" onClick={() => handleDigit('1')} />
            <Btn label="2" onClick={() => handleDigit('2')} />
            <Btn label="3" onClick={() => handleDigit('3')} />
            <Btn label="+" onClick={() => handleOp('+')} color="bg-accent/20" textColor="text-accent" />
            
            <Btn label="0" onClick={() => handleDigit('0')} className="col-span-2" />
            <Btn label="." onClick={() => handleDigit('.')} />
            <Btn label="=" onClick={calculate} color="bg-accent" textColor="text-black shadow-accent" />
          </div>
        </div>

        {/* History Sidebar - static on desktop, slide-over sheet on mobile */}
        <div className={`${showHistory ? 'absolute inset-0 z-20 md:static' : 'hidden md:block'} md:w-64 border-l border-white/5 bg-[#050508]/95 backdrop-blur-xl md:bg-black/20 p-4 overflow-y-auto custom-scrollbar`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <RotateCcw size={12} /> Computation Logs
            </div>
            {showHistory && (
              <button onClick={() => setShowHistory(false)} className="md:hidden text-xs text-zinc-400 hover:text-white">
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

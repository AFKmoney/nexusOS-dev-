import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Play, Pause, RefreshCw, CheckCircle2, Circle, Clock, 
  Sparkles, DollarSign, Users, TrendingUp, AlertTriangle, ShieldCheck, 
  ExternalLink, FileCode, FolderOpen, Terminal as TerminalIcon, 
  Zap, Plus, ChevronRight, Activity, Globe, Bug, Eye, Compass, Cpu, Wrench
} from 'lucide-react';
import { 
  businessAutonomy, 
  BusinessGoal, 
  BUSINESS_PRESETS, 
  BusinessMilestone, 
  BusinessSubtask, 
  OodaPhase 
} from '../kernel/businessAutonomy';
import { useOS } from '../store/osStore';

export default function AutonomousBusinessEngine() {
  const [goal, setGoal] = useState<BusinessGoal | null>(businessAutonomy.getActiveGoal());
  const [activeTab, setActiveTab] = useState<'milestones' | 'artifacts' | 'terminal' | 'healing'>('milestones');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customRevenue, setCustomRevenue] = useState(1000);
  const [customCurrency, setCustomCurrency] = useState('EUR');
  const [healingLog, setHealingLog] = useState<string | null>(null);
  const [isHealing, setIsHealing] = useState(false);

  const { openWindow } = useOS();
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = businessAutonomy.subscribe((updated) => {
      setGoal(updated);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [goal?.eventLog, activeTab]);

  const handleTogglePlay = () => {
    if (!goal) return;
    if (goal.status === 'running') {
      businessAutonomy.pause();
    } else {
      businessAutonomy.start();
    }
  };

  const handleStepNext = async () => {
    await businessAutonomy.tickOoda();
  };

  const handleTriggerHealing = async () => {
    setIsHealing(true);
    const res = await businessAutonomy.triggerSelfHealing('Manual sentinel audit initiated by user');
    setHealingLog(res);
    setIsHealing(false);
  };

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    businessAutonomy.createCustomGoal(customTitle, customDesc, customRevenue, customCurrency);
    setShowNewGoalModal(false);
    setCustomTitle('');
    setCustomDesc('');
  };

  const handleSelectPreset = (presetId: string) => {
    businessAutonomy.loadPreset(presetId, true);
    setShowNewGoalModal(false);
  };

  if (!goal) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#09090d] text-white">
        <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-4 shadow-[0_0_30px_rgba(var(--nx-accent-rgb),0.3)]">
          <Rocket size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">No Active Business Goal</h2>
        <p className="text-sm text-zinc-400 text-center max-w-md mb-6">
          Launch a fully autonomous software product or online business using the OODA loop agent.
        </p>
        <button
          onClick={() => setShowNewGoalModal(true)}
          className="px-6 py-2.5 bg-accent text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={16} /> Launch Autonomous Business
        </button>
      </div>
    );
  }

  const OODA_STEPS: Array<{ key: OodaPhase; label: string; icon: React.ElementType; desc: string }> = [
    { key: 'OBSERVE', label: 'Observe', icon: Eye, desc: 'Perceive system & market state' },
    { key: 'ORIENT', label: 'Orient', icon: Compass, desc: 'Align long-term memory & specs' },
    { key: 'DECIDE', label: 'Decide', icon: Cpu, desc: 'Plan next actionable OS commands' },
    { key: 'ACT', label: 'Act', icon: Zap, desc: 'Execute code, VFS & Stripe dispatch' },
  ];

  const getSubtaskIcon = (status: BusinessSubtask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'running': return <RefreshCw size={16} className="text-accent animate-spin" />;
      case 'failed': return <AlertTriangle size={16} className="text-rose-400" />;
      default: return <Circle size={16} className="text-zinc-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#07070b] text-zinc-200 select-none overflow-hidden font-sans">
      {/* ── TOP HEADER ── */}
      <div className="px-6 py-4 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Rocket size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {goal.category}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                goal.status === 'running' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : goal.status === 'completed'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-zinc-800 text-zinc-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${goal.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                {goal.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight truncate max-w-md sm:max-w-xl">
              {goal.title}
            </h1>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              goal.status === 'running'
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                : 'bg-emerald-500 text-black hover:bg-emerald-400'
            }`}
          >
            {goal.status === 'running' ? <><Pause size={14} /> Pause Loop</> : <><Play size={14} /> Resume Loop</>}
          </button>

          <button
            onClick={handleStepNext}
            disabled={goal.status === 'completed'}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Step next single OODA tick manually"
          >
            <ChevronRight size={14} /> Step Tick
          </button>

          <button
            onClick={handleTriggerHealing}
            disabled={isHealing}
            className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Run Self-Healing Sentinel audit on generated assets"
          >
            <Wrench size={14} className={isHealing ? 'animate-spin' : ''} /> Auto-Heal
          </button>

          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> New Goal
          </button>
        </div>
      </div>

      {/* ── METRICS STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-black/20 border-b border-white/5 shrink-0">
        <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Revenue Generated</div>
            <div className="text-xl font-black text-emerald-400 flex items-baseline gap-1 mt-0.5">
              <span>{goal.metrics.currency} {goal.metrics.revenue}</span>
              <span className="text-[11px] font-normal text-zinc-500">/ {goal.metrics.targetRevenue}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Visitors & Leads</div>
            <div className="text-xl font-black text-white mt-0.5">
              {goal.metrics.visitors} <span className="text-[11px] font-normal text-zinc-500">({goal.metrics.conversions} paid)</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">OS Primitives</div>
            <div className="text-xl font-black text-white mt-0.5">
              {goal.metrics.apiCalls} <span className="text-[11px] font-normal text-zinc-500">actions</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Activity size={18} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Health & Sentinel</div>
            <div className="text-xl font-black text-emerald-300 mt-0.5 flex items-center gap-1.5">
              <span>100%</span>
              <span className="text-[11px] font-mono font-normal text-purple-400">({goal.metrics.autoPatchesCount} healed)</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* ── REAL-TIME OODA LOOP STEPPER & THOUGHT STREAM ── */}
      <div className="px-6 py-3.5 bg-black/40 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          {OODA_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = goal.oodaPhase === step.key;
            return (
              <React.Fragment key={step.key}>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-accent text-black shadow-[0_0_15px_rgba(var(--nx-accent-rgb),0.3)] scale-105'
                    : 'bg-white/5 text-zinc-400 border border-white/5'
                }`}>
                  <Icon size={13} className={isActive ? 'animate-bounce' : ''} />
                  <span>{step.label}</span>
                </div>
                {idx < OODA_STEPS.length - 1 && (
                  <span className="text-zinc-600 text-xs">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Live Thought */}
        <div className="flex-1 min-w-0 md:text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-zinc-300 max-w-full">
            <Sparkles size={12} className="text-accent shrink-0 animate-pulse" />
            <span className="truncate italic font-mono text-[11px]">{goal.currentThought}</span>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="px-6 pt-3 flex gap-2 border-b border-white/5 bg-black/30 shrink-0">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'milestones'
              ? 'border-accent text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <TrendingUp size={14} /> Goal Execution Tree
          <span className="ml-1 text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full font-mono">
            {goal.progress}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('artifacts')}
          className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'artifacts'
              ? 'border-accent text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FolderOpen size={14} /> Generated Assets
          <span className="ml-1 text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full font-mono">
            {goal.artifacts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'terminal'
              ? 'border-accent text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <TerminalIcon size={14} /> OS Telemetry & Actions
          <span className="ml-1 text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full font-mono">
            {goal.eventLog.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('healing')}
          className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'healing'
              ? 'border-accent text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ShieldCheck size={14} /> Self-Healing Sentinel
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 min-h-0 bg-[#07070b]">
        {/* 1. MILESTONES & SUBTASKS */}
        {activeTab === 'milestones' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Overall progress bar */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-zinc-300 uppercase tracking-wider">Autonomous Deployment Progress</span>
                <span className="font-mono text-accent font-bold">{goal.progress}% Completed</span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-accent rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            {goal.milestones.map((m, idx) => (
              <div 
                key={m.id}
                className={`p-5 rounded-2xl border transition-all ${
                  m.status === 'completed'
                    ? 'bg-black/30 border-emerald-500/20'
                    : m.status === 'running'
                      ? 'bg-black/50 border-accent/40 shadow-[0_0_25px_rgba(var(--nx-accent-rgb),0.08)]'
                      : 'bg-black/20 border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      m.status === 'completed' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : m.status === 'running'
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'bg-white/5 text-zinc-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{m.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{m.description}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    m.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : m.status === 'running'
                        ? 'bg-accent/10 text-accent animate-pulse'
                        : 'bg-white/5 text-zinc-500'
                  }`}>
                    {m.status}
                  </span>
                </div>

                {/* Subtask list */}
                <div className="space-y-2 mt-4 pt-3 border-t border-white/5 pl-2">
                  {m.subtasks.map(st => (
                    <div 
                      key={st.id} 
                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getSubtaskIcon(st.status)}
                        <span className={`truncate ${st.status === 'completed' ? 'text-zinc-300 line-through opacity-80' : 'text-zinc-200'}`}>
                          {st.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/5 text-zinc-500 rounded uppercase">
                          {st.actionType}
                        </span>
                      </div>
                      {st.result && (
                        <span className="text-[10px] text-zinc-500 truncate max-w-xs font-mono ml-2">
                          {st.result.slice(0, 45)}...
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. GENERATED ASSETS & ARTIFACTS */}
        {activeTab === 'artifacts' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white">Live Software & Deployment Artifacts</h3>
                <p className="text-xs text-zinc-400">Files and applications generated in the virtual filesystem (/home/user/Business/)</p>
              </div>
              <button
                onClick={() => openWindow('explorer', { path: '/home/user/Business' })}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <FolderOpen size={14} /> Open in Explorer
              </button>
            </div>

            {goal.artifacts.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs">
                Artifacts are being generated as the autonomous loop runs...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goal.artifacts.map(art => (
                  <div key={art.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between hover:border-white/20 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {art.type === 'html' ? <Globe size={16} className="text-blue-400" /> :
                           art.type === 'code' ? <FileCode size={16} className="text-emerald-400" /> :
                           art.type === 'api' ? <DollarSign size={16} className="text-amber-400" /> :
                           <TerminalIcon size={16} className="text-purple-400" />}
                          <span className="font-bold text-sm text-white font-mono">{art.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{art.size}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2">{art.summary || art.path}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                      {art.type === 'html' && (
                        <button
                          onClick={() => openWindow('netrunner')}
                          className="px-2.5 py-1 bg-accent/20 hover:bg-accent/30 text-accent text-xs font-semibold rounded-lg flex items-center gap-1"
                        >
                          <Globe size={12} /> Launch Live Page
                        </button>
                      )}
                      <button
                        onClick={() => openWindow('hyperide', { path: art.path })}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-zinc-200 text-xs rounded-lg flex items-center gap-1"
                      >
                        <FileCode size={12} /> Edit in HyperIDE
                      </button>
                      <button
                        onClick={() => openWindow('notepad', { path: art.path })}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-400 text-xs rounded-lg flex items-center gap-1 ml-auto"
                      >
                        <ExternalLink size={12} /> Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. TERMINAL & ACTION TELEMETRY */}
        {activeTab === 'terminal' && (
          <div className="max-w-4xl mx-auto h-[480px] bg-black/80 rounded-2xl border border-white/10 p-4 font-mono text-xs overflow-y-auto custom-scrollbar flex flex-col shadow-inner">
            <div className="text-zinc-500 pb-2 border-b border-white/10 mb-3 flex items-center justify-between">
              <span>◈ NEXUS OS::AUTONOMY KERNEL STREAM</span>
              <span className="text-emerald-400">● REAL-TIME DISPATCH</span>
            </div>

            <div className="space-y-2 flex-1">
              {goal.eventLog.map(evt => (
                <div key={evt.id} className="flex gap-2">
                  <span className="text-zinc-600 shrink-0">
                    [{new Date(evt.timestamp).toLocaleTimeString('en-US')}]
                  </span>
                  <span className={`font-bold shrink-0 ${
                    evt.phase === 'ACT' ? 'text-emerald-400' :
                    evt.phase === 'HEAL' ? 'text-purple-400' :
                    evt.phase === 'DECIDE' ? 'text-amber-400' :
                    'text-blue-400'
                  }`}>
                    [{evt.phase}]
                  </span>
                  <span className={evt.outcome === 'error' ? 'text-rose-400' : 'text-zinc-300'}>
                    {evt.message}
                  </span>
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>
          </div>
        )}

        {/* 4. SELF-HEALING SENTINEL */}
        {activeTab === 'healing' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 bg-gradient-to-br from-purple-950/30 to-black/60 rounded-2xl border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Autonomous Sentinel & Bug Watchdog</h3>
                  <p className="text-xs text-zinc-400">Continuous background error observation, syntax auditing, and automated hot-patching</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 my-6">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Auto-Patches</div>
                  <div className="text-2xl font-black text-purple-300 mt-1">{goal.metrics.autoPatchesCount}</div>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Error Interceptions</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{goal.metrics.errorCount}</div>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">VFS File Integrity</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">100%</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTriggerHealing}
                  disabled={isHealing}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
                >
                  <Wrench size={14} className={isHealing ? 'animate-spin' : ''} />
                  {isHealing ? 'Auditing & Repairing Files...' : 'Trigger Integrity Sentinel Now'}
                </button>
              </div>

              {healingLog && (
                <div className="mt-4 p-3 bg-black/60 rounded-xl border border-purple-500/20 font-mono text-xs text-purple-200">
                  {healingLog}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: CREATE CUSTOM GOAL OR CHOOSE PRESET ── */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Rocket size={16} className="text-accent" /> New Autonomous Goal / Business
              </h2>
              <button 
                onClick={() => setShowNewGoalModal(false)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              {/* Presets */}
              <div>
                <label className="text-xs uppercase tracking-wider font-bold text-zinc-400 block mb-3">
                  Turnkey Blueprints (Instant Launch)
                </label>
                <div className="grid gap-2.5">
                  {BUSINESS_PRESETS.map(preset => (
                    <div 
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider font-mono text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded">
                            {preset.category}
                          </span>
                          <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">
                            {preset.title}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{preset.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {preset.currency} {preset.targetRevenue}
                        </span>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Target CA</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Form */}
              <div className="pt-4 border-t border-white/10">
                <label className="text-xs uppercase tracking-wider font-bold text-zinc-400 block mb-3">
                  Or Define Custom Natural Language Goal
                </label>
                <form onSubmit={handleCreateCustomGoal} className="space-y-4">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Goal / Business Title</label>
                    <input
                      type="text"
                      placeholder="e.g. AI-Powered Medical Transcript Analyzer SaaS"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Description & Target Audience</label>
                    <textarea
                      placeholder="Specify features, target users, and monetization strategy..."
                      value={customDesc}
                      onChange={e => setCustomDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Target Revenue Goal</label>
                      <input
                        type="number"
                        value={customRevenue}
                        onChange={e => setCustomRevenue(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Currency</label>
                      <select
                        value={customCurrency}
                        onChange={e => setCustomCurrency(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewGoalModal(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!customTitle.trim()}
                      className="px-5 py-2 bg-accent text-black font-bold text-xs rounded-xl hover:opacity-90 disabled:opacity-50"
                    >
                      Deploy Autonomous Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

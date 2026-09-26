import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Trash2, MapPin, Sparkles } from 'lucide-react';
import { useOS } from '../store/osStore';
import { uuid } from '../utils/uuid';

interface Event { id: string; title: string; time: string; date: string; type: 'work' | 'personal' | 'system'; }
type EventType = Event['type'];
const LS_KEY = 'nexus_calendar_v2';

export default function CalendarApp() {
  const { addNotification, isMobileView } = useOS();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', title: 'Neural Core Maintenance', time: '02:00', date: new Date().toISOString().split('T')[0] ?? '', type: 'system' },
      { id: '2', title: 'Global Sync Protocol', time: '14:30', date: new Date().toISOString().split('T')[0] ?? '', type: 'work' },
    ];
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState<{ title: string; time: string; type: EventType }>({
    title: '',
    time: '',
    type: 'personal'
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(events));
  }, [events]);

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    const event: Event = { 
      id: uuid(), 
      title: newEvent.title, 
      time: newEvent.time || '12:00', 
      date: currentDate.toISOString().split('T')[0] ?? '', 
      type: newEvent.type 
    };
    setEvents([...events, event]);
    setNewEvent({ title: '', time: '', type: 'personal' });
    setShowAdd(false);
    addNotification({ title: 'Event Logged', message: `Scheduled: ${event.title}`, type: 'success' });
  };

  const deleteEvent = (id: string) => setEvents(events.filter(e => e.id !== id));

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const selectedDateStr = currentDate.toISOString().split('T')[0];
  const dayEvents = events.filter(e => e.date === selectedDateStr);

  return (
    <div className="h-full bg-[#050508] text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="min-h-12 sm:h-16 px-3 sm:px-6 py-2 border-b border-white/5 flex items-center justify-between gap-2 bg-black/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] truncate">Neural Chronos</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase truncate">{monthName} {currentDate.getFullYear()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-all" aria-label="Previous month"><ChevronLeft size={18}/></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-2.5 sm:px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Today</button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-all" aria-label="Next month"><ChevronRight size={18}/></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">
        <div className="sm:flex-1 p-3 sm:p-6 bg-black/20 overflow-y-auto custom-scrollbar shrink-0 sm:shrink">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {(isMobileView ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((d, i) => (
              <div key={`${d}-${i}`} className="text-center text-[10px] font-black text-zinc-600 uppercase mb-1 sm:mb-2">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
              const d = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
              const hasEvents = events.some(e => e.date === dateStr);
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              const isSelected = selectedDateStr === dateStr;

              return (
                <button 
                  key={d} 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))}
                  className={`${isMobileView ? 'h-10' : 'h-20'} rounded-xl sm:rounded-2xl border transition-all flex flex-col items-center justify-center relative group ${isSelected ? 'bg-purple-500/20 border-purple-500/50 shadow-lg' : isToday ? 'bg-white/5 border-white/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/10'}`}
                >
                  <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-purple-400' : 'text-zinc-400'}`}>{d}</span>
                  {hasEvents && <div className="mt-0.5 flex gap-0.5">{events.filter(e => e.date === dateStr).slice(0, 3).map((_, idx) => <div key={idx} className="w-1 h-1 rounded-full bg-purple-500" />)}</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l border-white/5 bg-black/40 flex flex-col min-h-0 flex-1 sm:flex-none sm:max-h-none max-h-[42%]">
          <div className="p-3 sm:p-6 border-b border-white/5 flex items-center justify-between gap-2">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-400 truncate">Events: {currentDate.toLocaleDateString('en-US')}</h2>
            <button onClick={() => setShowAdd(true)} className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all"><Plus size={16}/></button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {showAdd && (
              <form onSubmit={addEvent} className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-4 animate-in slide-in-from-top-2 mb-4">
                <input autoFocus placeholder="Event title..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-3 outline-none focus:border-purple-500/50" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                <div className="flex gap-2 mb-4">
                  <input type="time" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-400 outline-none focus:border-purple-500/50" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                  <select className="bg-black/40 border border-white/10 rounded-xl px-2 text-[10px] text-zinc-400 uppercase font-black tracking-widest outline-none" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})}>
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">Schedule</button>
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 bg-white/5 hover:bg-white/10 text-zinc-500 rounded-xl transition-all"><Trash2 size={14}/></button>
                </div>
              </form>
            )}

            {dayEvents.map(e => (
              <div key={e.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${e.type === 'system' ? 'bg-red-500/10 text-red-400 border-red-500/20' : e.type === 'work' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
                    {e.type}
                  </span>
                  <button onClick={() => deleteEvent(e.id)} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"><Trash2 size={12}/></button>
                </div>
                <div className="text-xs font-bold text-zinc-200 mb-2">{e.title}</div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1"><Clock size={10}/> {e.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={10}/> Local Node</span>
                </div>
              </div>
            ))}

            {dayEvents.length === 0 && !showAdd && (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                <Sparkles size={32} className="mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No scheduled events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

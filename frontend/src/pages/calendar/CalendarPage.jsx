import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Files, 
  CheckSquare, 
  FolderKanban, 
  ArrowRight,
  User
} from 'lucide-react';
import Drawer from '../../components/common/Drawer';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewType, setViewType] = useState('month'); // 'month' | 'upcoming'

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await api.getCalendarEvents();
        if (res.success) {
          setEvents(res.events || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getEventsForDay = (day) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dStr);
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'document_expiry':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-900';
      case 'task_deadline':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-900';
      case 'workflow_deadline':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-900';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Deadline Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated timeline of document renewals, tasks, and application submission dates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-sm text-xs font-semibold">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewType === 'month' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewType('upcoming')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewType === 'upcoming' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Upcoming List
            </button>
          </div>
        </div>
      </div>

      {viewType === 'month' ? (
        /* MONTH CALENDAR VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800 min-h-[480px]">
            {/* Blank offset days */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`offset-${i}`} className="bg-slate-50/30 dark:bg-slate-950/30 p-2 min-h-[90px]" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  className={`p-2 min-h-[90px] flex flex-col justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                    isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Day Events Pills */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-16 scrollbar-none">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate cursor-pointer border ${getEventBadge(evt.type)}`}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* UPCOMING EVENTS LIST */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Chronological Schedule</h3>
          {events.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center">No upcoming events or deadlines.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300">
                      <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                        {new Date(evt.date).toLocaleDateString([], { month: 'short' })}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-none">
                        {new Date(evt.date).getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{evt.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${getEventBadge(evt.type)}`}>
                          {evt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{evt.description}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Side Panel Drawer on Event Click (Section 16) */}
      {selectedEvent && (
        <Drawer
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title="Event Details"
          subtitle={`Scheduled for ${selectedEvent.date}`}
          width="max-w-md"
        >
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getEventBadge(selectedEvent.type)}`}>
                {selectedEvent.badge}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedEvent.description}</p>
            </div>

            <div className="space-y-3 text-xs bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Date</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedEvent.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Responsible Member</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedEvent.owner || 'Family'}</span>
              </div>
              {selectedEvent.priority && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Priority</span>
                  <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">{selectedEvent.priority}</span>
                </div>
              )}
              {selectedEvent.status && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Current Status</span>
                  <span className="font-semibold uppercase text-slate-900 dark:text-slate-100">{selectedEvent.status}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const link = selectedEvent.link;
                setSelectedEvent(null);
                if (link) navigate(link);
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Go to Relevant Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Drawer>
      )}
    </div>
  );
}

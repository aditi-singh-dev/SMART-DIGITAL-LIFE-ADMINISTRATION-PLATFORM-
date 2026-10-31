import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Clock, 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  Calendar,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import DocumentDetailModal from '../documents/DocumentDetailModal';
import RenewalCostTracker from '../../components/finance/RenewalCostTracker';
import WhatsAppReminderModal from '../../components/common/WhatsAppReminderModal';
import Modal from '../../components/common/Modal';

export default function ExpiryTrackerPage() {
  const { success, error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reminderModalDoc, setReminderModalDoc] = useState(null);
  const [whatsappModalItem, setWhatsappModalItem] = useState(null);
  const [reminderDays, setReminderDays] = useState(7);
  const [savingReminder, setSavingReminder] = useState(false);

  const fetchExpiry = async () => {
    try {
      setLoading(true);
      const res = await api.getExpiryOverview();
      if (res.success) {
        setData(res.expiryData);
      }
    } catch (e) {
      error('Failed to load expiry tracker.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiry();
  }, []);

  const handleSetReminder = async () => {
    if (!reminderModalDoc) return;
    setSavingReminder(true);
    try {
      const res = await api.setCustomReminder({
        document_id: reminderModalDoc.id,
        days_before: reminderDays
      });
      if (res.success) {
        success(res.message);
        setReminderModalDoc(null);
      }
    } catch (err) {
      error(err.message || 'Failed to configure reminder.');
    } finally {
      setSavingReminder(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading renewal timeline...</div>;
  }

  const { expired, next7Days, next30Days, next90Days, later, stats } = data || {
    expired: [],
    next7Days: [],
    next30Days: [],
    next90Days: [],
    later: [],
    stats: { totalExpiringTracked: 0, expiredCount: 0, next7DaysCount: 0, next30DaysCount: 0, next90DaysCount: 0 }
  };

  const renderSection = (title, items, borderStyle, badgeBg) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{title}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {items.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map((doc) => (
            <div
              key={doc.id}
              className={`p-4 bg-white dark:bg-slate-900 rounded-xl border ${borderStyle} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{doc.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
                      {doc.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {doc.document_type || doc.category} · {doc.owner_name} {doc.issuing_authority ? `· ${doc.issuing_authority}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Expiry: {doc.expiry_date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setWhatsappModalItem(doc)}
                  className="px-2.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1 transition-all shadow-2xs active:scale-95"
                  title="Share WhatsApp Reminder"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  onClick={() => setReminderModalDoc(doc)}
                  className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                  title="Configure alert"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Set Alert</span>
                </button>
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1 transition-colors"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Deadlines & Expiry Tracker</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Timeline tracker monitoring upcoming renewals and expirations across household documents.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Expired</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.expiredCount}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Action overdue</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Next 7 Days</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.next7DaysCount}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Critical urgency</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Next 30 Days</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.next30DaysCount}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Approaching renewal</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tracked Total</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalExpiringTracked}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Policies with dates</span>
        </div>
      </div>

      {/* Financial Renewal Impact & Premium Forecast Tracker */}
      <RenewalCostTracker />

      {/* Timeline Sections */}
      <div className="space-y-8">
        {stats.totalExpiringTracked === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No expiring documents are currently logged in your family vault.
          </div>
        ) : (
          <>
            {renderSection('Expired Records', expired, 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20', 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300')}
            {renderSection('Next 7 Days (Critical)', next7Days, 'border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/20', 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300')}
            {renderSection('Next 30 Days', next30Days, 'border-slate-200 dark:border-slate-800', 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300')}
            {renderSection('Next 90 Days', next90Days, 'border-slate-200 dark:border-slate-800', 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}
            {renderSection('Later / Long Term', later, 'border-slate-200 dark:border-slate-800', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300')}
          </>
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <DocumentDetailModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          onUpdated={fetchExpiry}
          onDeleted={fetchExpiry}
        />
      )}

      {/* Configure Custom Reminder Modal */}
      {reminderModalDoc && (
        <Modal
          isOpen={!!reminderModalDoc}
          onClose={() => setReminderModalDoc(null)}
          title="Configure Renewal Reminder"
          subtitle={`Schedule automated reminder alerts for "${reminderModalDoc.title}"`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              When would you like to receive an in-app and email reminder prior to the expiration date (<b>{reminderModalDoc.expiry_date}</b>)?
            </p>

            <div className="space-y-2">
              {[
                { days: 90, label: '90 days before (Standard for Passports & Long Policies)' },
                { days: 30, label: '30 days before (Recommended for Insurance & Subscriptions)' },
                { days: 15, label: '15 days before' },
                { days: 7, label: '7 days before (Critical deadline approaching)' },
                { days: 1, label: '1 day before' }
              ].map(opt => (
                <label 
                  key={opt.days}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    reminderDays === opt.days 
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-semibold' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reminder_days"
                    checked={reminderDays === opt.days}
                    onChange={() => setReminderDays(opt.days)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReminderModalDoc(null)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetReminder}
                disabled={savingReminder}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                {savingReminder ? 'Saving...' : 'Set Reminder'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* WhatsApp Reminder Modal */}
      {whatsappModalItem && (
        <WhatsAppReminderModal
          isOpen={!!whatsappModalItem}
          onClose={() => setWhatsappModalItem(null)}
          targetItem={whatsappModalItem}
        />
      )}
    </div>
  );
}

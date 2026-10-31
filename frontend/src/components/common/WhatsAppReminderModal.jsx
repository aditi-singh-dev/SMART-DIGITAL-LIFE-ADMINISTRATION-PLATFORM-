import React, { useState } from 'react';
import { 
  MessageSquare, 
  Copy, 
  Check, 
  Send, 
  User, 
  Clock, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import Modal from './Modal';
import { useToast } from '../../context/ToastContext';

export default function WhatsAppReminderModal({ isOpen, onClose, targetItem = null }) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!targetItem) return null;

  const defaultAssignee = targetItem.assignee_name || targetItem.owner_name || 'Rajesh ji';
  const itemTitle = targetItem.title || targetItem.task_name || 'Document Renewal';
  const dueDate = targetItem.due_date || targetItem.expiry_date || 'this week';
  const priority = targetItem.priority || 'High';

  const defaultMessage = `Namaste ${defaultAssignee},
Reminder from GharSahayak (Singh Family Workspace):
📌 *Item:* ${itemTitle}
⏰ *Due Date:* ${dueDate}
🚨 *Priority:* ${priority.toUpperCase()}

Please review or update the document status when free:
https://gharsahayak.in/dashboard

Dhanyawad! 🙏`;

  const [message, setMessage] = useState(defaultMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    success('WhatsApp reminder text copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    success('Opening WhatsApp web...');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Family WhatsApp Reminder Dispatch">
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
              Direct Household Coordination
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Indian families coordinate primarily on WhatsApp. Dispatch reminders without awkward follow-ups.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Personalized Message Preview
          </label>
          <textarea
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send via WhatsApp</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

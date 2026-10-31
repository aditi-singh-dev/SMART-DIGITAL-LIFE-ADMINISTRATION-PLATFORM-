import React from 'react';
import Drawer from '../common/Drawer';
import { Bell, AlertTriangle, CheckCircle, FileText, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationDrawer({ isOpen, onClose, notifications = [], onMarkRead, onMarkAllRead }) {
  const navigate = useNavigate();

  const handleItemClick = (notif) => {
    if (notif.is_read === 0) {
      onMarkRead(notif.id);
    }
    if (notif.link) {
      onClose();
      navigate(notif.link);
    }
  };

  const unreadList = notifications.filter(n => n.is_read === 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      subtitle={`${unreadList.length} unread updates`}
      width="max-w-md"
    >
      <div className="space-y-4">
        {unreadList.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            No notifications at this time.
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notif) => {
              const isUnread = notif.is_read === 0;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isUnread
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {notif.type === 'expiry' && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                      {notif.type === 'task' && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                      {notif.type === 'workflow' && <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                      {notif.type === 'system' && <Bell className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`font-bold truncate ${isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}

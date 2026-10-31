import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import GlobalSearchModal from '../search/GlobalSearchModal';
import NotificationDrawer from '../notifications/NotificationDrawer';
import DocumentUploadModal from '../../pages/documents/DocumentUploadModal';
import TaskModal from '../../pages/tasks/TaskModal';
import CreateWorkflowModal from '../../pages/workflows/CreateWorkflowModal';
import EmergencyKitModal from '../common/EmergencyKitModal';
import { api } from '../../services/api';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [emergencyKitOpen, setEmergencyKitOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Quick Add Modals
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // sync every 45s

    const handleEmergencyKit = () => setEmergencyKitOpen(true);
    window.addEventListener('open:emergencykit', handleEmergencyKit);

    return () => {
      clearInterval(interval);
      window.removeEventListener('open:emergencykit', handleEmergencyKit);
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (e) {}
  };

  const handleQuickAdd = (type) => {
    if (type === 'upload_document') setUploadDocOpen(true);
    if (type === 'create_task') setCreateTaskOpen(true);
    if (type === 'create_workflow') setCreateWorkflowOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <TopNav
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenEmergencyKit={() => setEmergencyKitOpen(true)}
          onQuickAdd={handleQuickAdd}
          unreadCount={unreadCount}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshNotifications: fetchNotifications, onOpenEmergencyKit: () => setEmergencyKitOpen(true) }} />
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />

      <EmergencyKitModal
        isOpen={emergencyKitOpen}
        onClose={() => setEmergencyKitOpen(false)}
      />

      {uploadDocOpen && (
        <DocumentUploadModal
          isOpen={uploadDocOpen}
          onClose={() => setUploadDocOpen(false)}
          onUploaded={() => {
            setUploadDocOpen(false);
            window.dispatchEvent(new Event('refresh:documents'));
            window.dispatchEvent(new Event('refresh:dashboard'));
          }}
        />
      )}

      {createTaskOpen && (
        <TaskModal
          isOpen={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          onSaved={() => {
            setCreateTaskOpen(false);
            window.dispatchEvent(new Event('refresh:tasks'));
            window.dispatchEvent(new Event('refresh:dashboard'));
          }}
        />
      )}

      {createWorkflowOpen && (
        <CreateWorkflowModal
          isOpen={createWorkflowOpen}
          onClose={() => setCreateWorkflowOpen(false)}
          onCreated={() => {
            setCreateWorkflowOpen(false);
            window.dispatchEvent(new Event('refresh:workflows'));
            window.dispatchEvent(new Event('refresh:dashboard'));
          }}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import DemoBanner from '../components/common/DemoBanner';
import '../styles/dashboard.css';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DemoBanner />
      
      <div className="dashboard-layout" style={{ flex: 1 }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              zIndex: 35
            }}
          />
        )}

        <div className="dashboard-main">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="page-container">{children}</main>
        </div>
      </div>
    </div>
  );
}

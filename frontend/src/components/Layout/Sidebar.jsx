import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Building2,
  CheckSquare,
  History,
  Info,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats = {} }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'parcels', label: 'Parcels', icon: MapPin, count: stats.totalParcels },
    { id: 'conflicts', label: 'Conflict Review', icon: AlertTriangle, count: stats.pendingReview, badgeColor: 'badge-conflict' },
    { id: 'buildings', label: 'Building & Changes', icon: Building2, count: stats.potentiallyUnrecorded, badgeColor: 'badge-unrecorded' },
    { id: 'verification', label: 'Human Verification', icon: CheckSquare },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`badge ${item.badgeColor || 'badge-gray'}`}
                  style={{ padding: '2px 7px', fontSize: '0.7rem' }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Info size={14} />
          <strong>Gota TP-33 Study Area</strong>
        </div>
        <p>Ahmedabad, Gujarat</p>
        <p style={{ marginTop: '6px', color: '#475569' }}>Decision-Support Mode &bull; Non-destructive</p>
      </div>
    </aside>
  );
}

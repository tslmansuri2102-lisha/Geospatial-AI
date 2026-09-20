import React from 'react';
import {
  MapPin,
  AlertOctagon,
  Clock,
  CheckCircle2,
  GitCompare,
  Building,
} from 'lucide-react';

export default function DashboardStats({ stats = {} }) {
  const statCards = [
    {
      title: 'Total Parcels',
      value: stats.totalParcels ?? 0,
      icon: MapPin,
      color: '#2563eb',
      bg: '#eff6ff',
      description: 'Master harmonized parcels',
    },
    {
      title: 'Conflicts Detected',
      value: stats.totalConflicts ?? 0,
      icon: AlertOctagon,
      color: '#ef4444',
      bg: '#fef2f2',
      description: 'Spatial & attribute issues',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview ?? 0,
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb',
      description: 'Awaiting human decision',
    },
    {
      title: 'Resolved Conflicts',
      value: stats.resolvedConflicts ?? 0,
      icon: CheckCircle2,
      color: '#10b981',
      bg: '#ecfdf5',
      description: 'Verified & finalized',
    },
    {
      title: 'Detected Changes',
      value: stats.detectedChanges ?? 0,
      icon: GitCompare,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      description: 'Temporal footprint changes',
    },
    {
      title: 'Potentially Unrecorded',
      value: stats.potentiallyUnrecorded ?? 0,
      icon: Building,
      color: '#ea580c',
      bg: '#fff7ed',
      description: 'Structures pending record match',
    },
  ];

  return (
    <div className="stats-grid">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="stat-card">
            <div>
              <div className="stat-title">{card.title}</div>
              <div className="stat-value">{card.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                {card.description}
              </div>
            </div>
            <div
              style={{
                background: card.bg,
                color: card.color,
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

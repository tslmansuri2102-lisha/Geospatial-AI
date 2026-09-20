import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ConflictList({
  conflicts = [],
  selectedConflict = null,
  onSelectConflict = () => {},
}) {
  if (conflicts.length === 0) {
    return (
      <div className="state-box">
        <CheckCircle2 size={32} color="#10b981" />
        <p>No active spatial or attribute conflicts detected in the current filter.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <span className="badge badge-conflict">HIGH SEVERITY</span>;
      case 'MEDIUM':
        return <span className="badge badge-pending">MEDIUM</span>;
      case 'LOW':
        return <span className="badge badge-gray">LOW</span>;
      default:
        return <span className="badge badge-gray">{severity}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DETECTED':
        return <span className="badge badge-pending">DETECTED</span>;
      case 'AI_PROPOSED':
        return <span className="badge badge-conflict">AI PROPOSED</span>;
      case 'ACCEPTED':
        return <span className="badge badge-verified">ACCEPTED</span>;
      case 'REJECTED':
        return <span className="badge badge-gray">REJECTED</span>;
      case 'MODIFIED':
        return <span className="badge badge-changed">MODIFIED</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {conflicts.map((conflict) => {
        const isSelected = selectedConflict && selectedConflict.conflict_id === conflict.conflict_id;
        return (
          <div
            key={conflict.conflict_id}
            onClick={() => onSelectConflict(conflict)}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: isSelected ? '#eff6ff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  {conflict.conflict_id}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Parcel {conflict.parcel_id}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {getSeverityBadge(conflict.severity)}
                {getStatusBadge(conflict.status)}
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '6px' }}>
              {conflict.description}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <div>
                Type: <strong>{conflict.conflict_type}</strong>
                {conflict.difference_value !== undefined && (
                  <span style={{ marginLeft: '8px' }}>
                    Diff: <strong>{conflict.difference_value}</strong>
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 600 }}>
                <span>Inspect</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

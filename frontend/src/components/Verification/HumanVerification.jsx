import React from 'react';
import {
  CheckSquare,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Clock,
} from 'lucide-react';
import ConflictList from '../Conflicts/ConflictList';
import ConflictDetails from '../Conflicts/ConflictDetails';

export default function HumanVerification({
  conflicts = [],
  selectedConflict,
  onSelectConflict,
  proposal,
  parcel,
  onOpenDecisionModal,
  feedback,
}) {
  const pendingConflicts = conflicts.filter((c) => c.status !== 'ACCEPTED');
  const resolvedConflicts = conflicts.filter((c) => c.status === 'ACCEPTED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Human Verification &amp; Official Certification
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Authoritative decision-support review for spatial and attribute conflicts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-pending">
            <Clock size={12} />
            {pendingConflicts.length} Pending Decision
          </span>
          <span className="badge badge-verified">
            <FileCheck2 size={12} />
            {resolvedConflicts.length} Certified
          </span>
        </div>
      </div>

      {/* Decision feedback banner if present */}
      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
          }}
        >
          <ShieldCheck size={18} />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="dashboard-grid">
        {/* Left: Pending Conflicts List */}
        <div className="panel-card">
          <div className="panel-header">
            <span className="panel-title">
              <CheckSquare size={16} />
              Review Queue ({pendingConflicts.length})
            </span>
          </div>
          <div className="panel-body">
            <ConflictList
              conflicts={pendingConflicts}
              selectedConflict={selectedConflict}
              onSelectConflict={onSelectConflict}
            />
          </div>
        </div>

        {/* Right: Selected Conflict Details & Verification Actions */}
        <div className="panel-card">
          <div className="panel-header">
            <span className="panel-title">
              <ShieldCheck size={16} />
              Inspection &amp; Determination
            </span>
          </div>
          <div className="panel-body">
            <ConflictDetails
              conflict={selectedConflict}
              proposal={proposal}
              parcel={parcel}
              onOpenDecisionModal={onOpenDecisionModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import ConfidencePanel from './ConfidencePanel';
import { AlertTriangle, Layers, Sparkles, CheckSquare, ArrowRight } from 'lucide-react';

export default function ConflictDetails({
  conflict,
  proposal,
  parcel,
  onOpenDecisionModal,
}) {
  if (!conflict) {
    return (
      <div className="state-box">
        <AlertTriangle size={36} color="#94a3b8" />
        <h3>No Conflict Selected</h3>
        <p>Select a conflict from the list or map to inspect spatial discrepancies and AI proposals.</p>
      </div>
    );
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              {conflict.conflict_id}
            </h2>
            {getStatusBadge(conflict.status)}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
            Target Parcel: <strong>{conflict.parcel_id}</strong> &bull; Conflict Type: <strong>{conflict.conflict_type}</strong>
          </p>
        </div>

        {/* Human Verification Trigger Button */}
        {conflict.status !== 'ACCEPTED' && (
          <button
            className="btn btn-primary"
            onClick={() => onOpenDecisionModal(conflict)}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <CheckSquare size={16} />
            <span>Verify &amp; Decide</span>
          </button>
        )}
      </div>

      {/* Description Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
          Conflict Summary
        </div>
        <p style={{ fontSize: '0.88rem', color: '#1e293b' }}>{conflict.description}</p>
        {conflict.difference_value !== undefined && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
            Measured Spatial Difference:{' '}
            <strong style={{ color: '#ef4444' }}>{conflict.difference_value} m</strong>
          </div>
        )}
        <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Affected Source Records:</span>
          {conflict.source_ids?.map((srcId) => (
            <span key={srcId} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
              {srcId}
            </span>
          ))}
        </div>
      </div>

      {/* AI Resolution Proposal */}
      {proposal ? (
        <div style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="#2563eb" />
            <strong style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>AI Resolution Recommendation</strong>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#1e3a8a', fontWeight: 500, marginBottom: '12px' }}>
            {proposal.recommendation}
          </p>

          <ConfidencePanel proposal={proposal} />
        </div>
      ) : (
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#64748b' }}>
          Loading AI resolution recommendation from conflict resolution engine...
        </div>
      )}
    </div>
  );
}

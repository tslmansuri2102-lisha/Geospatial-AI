import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Edit3,
  AlertTriangle,
  HelpCircle,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function DecisionModal({
  conflict,
  proposal,
  parcel,
  reviewerId = 'OFFICER-001',
  isOpen,
  onClose,
  onSubmitDecision,
  isSubmitting = false,
}) {
  if (!isOpen || !conflict) return null;

  const [decision, setDecision] = useState('ACCEPT');
  const [remarks, setRemarks] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [modifiedAttributes, setModifiedAttributes] = useState({
    land_use: parcel?.attributes?.land_use || 'Residential',
    municipal_zone: parcel?.attributes?.municipal_zone || 'R2',
    survey_number: parcel?.attributes?.survey_number || '',
  });

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleFinalConfirm = () => {
    const payload = {
      decision,
      reviewer_id: reviewerId,
      remarks,
    };

    if (decision === 'MODIFY') {
      payload.modified_attributes = modifiedAttributes;
      if (proposal?.proposed_geometry) {
        payload.modified_geometry = proposal.proposed_geometry;
      }
    }

    onSubmitDecision(conflict.conflict_id, payload);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Human Verification &bull; {conflict.conflict_id}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Authoritative Certification &bull; Target: Parcel {conflict.parcel_id}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {!showConfirm ? (
            <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Proposal Summary */}
              {proposal && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    AI Recommended Resolution ({(proposal.confidence * 100).toFixed(0)}% Confidence)
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#14532d', marginTop: '4px' }}>
                    {proposal.recommendation}
                  </p>
                </div>
              )}

              {/* Decision Options */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
                  Select Reviewer Action:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    className={`btn ${decision === 'ACCEPT' ? 'btn-accept' : 'btn-secondary'}`}
                    onClick={() => setDecision('ACCEPT')}
                    style={{ flexDirection: 'column', padding: '12px 8px' }}
                  >
                    <CheckCircle size={20} />
                    <span style={{ marginTop: '4px' }}>ACCEPT</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 400, opacity: 0.8 }}>Adopt AI Proposal</span>
                  </button>

                  <button
                    type="button"
                    className={`btn ${decision === 'REJECT' ? 'btn-reject' : 'btn-secondary'}`}
                    onClick={() => setDecision('REJECT')}
                    style={{ flexDirection: 'column', padding: '12px 8px' }}
                  >
                    <XCircle size={20} />
                    <span style={{ marginTop: '4px' }}>REJECT</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 400, opacity: 0.8 }}>Dismiss AI Proposal</span>
                  </button>

                  <button
                    type="button"
                    className={`btn ${decision === 'MODIFY' ? 'btn-modify' : 'btn-secondary'}`}
                    onClick={() => setDecision('MODIFY')}
                    style={{ flexDirection: 'column', padding: '12px 8px' }}
                  >
                    <Edit3 size={20} />
                    <span style={{ marginTop: '4px' }}>MODIFY</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 400, opacity: 0.8 }}>Adjust Values</span>
                  </button>
                </div>
              </div>

              {/* MODIFY Workflow - Comparison & Input */}
              {decision === 'MODIFY' && (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                    Adjust Supported Attributes:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#475569', display: 'block', marginBottom: '2px' }}>
                        Land Use Classification:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Original: {parcel?.attributes?.land_use || 'N/A'}</span>
                        <span style={{ fontSize: '0.72rem', color: '#2563eb' }}>AI: {proposal?.proposed_attributes?.land_use || 'Residential'}</span>
                        <input
                          type="text"
                          className="input-field"
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          value={modifiedAttributes.land_use}
                          onChange={(e) => setModifiedAttributes({ ...modifiedAttributes, land_use: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#475569', display: 'block', marginBottom: '2px' }}>
                        Municipal Zone:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Original: {parcel?.attributes?.municipal_zone || 'N/A'}</span>
                        <span style={{ fontSize: '0.72rem', color: '#2563eb' }}>AI: {proposal?.proposed_attributes?.municipal_zone || 'R2'}</span>
                        <input
                          type="text"
                          className="input-field"
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          value={modifiedAttributes.municipal_zone}
                          onChange={(e) => setModifiedAttributes({ ...modifiedAttributes, municipal_zone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviewer remarks */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Official Remarks / Justification:
                </label>
                <textarea
                  className="input-field"
                  style={{ width: '100%', minHeight: '70px', resize: 'vertical' }}
                  placeholder="Enter official reason, field verification notes, or scheme references..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="modal-footer" style={{ padding: 0, background: 'transparent', borderTop: 'none' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Review &amp; Confirm
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Step */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d97706' }}>
                <ShieldAlert size={28} />
                <h4 style={{ fontSize: '1rem', color: '#92400e' }}>
                  Confirm Verification Decision
                </h4>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#334155' }}>
                You are about to record a permanent <strong>{decision}</strong> decision for conflict{' '}
                <strong>{conflict.conflict_id}</strong> on Parcel <strong>{conflict.parcel_id}</strong> as reviewer{' '}
                <strong>{reviewerId}</strong>.
              </p>

              {decision === 'ACCEPT' && (
                <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: '#065f46' }}>
                  The harmonized boundary/attributes proposed by the AI engine will be certified as authoritative for this parcel.
                </div>
              )}

              {decision === 'REJECT' && (
                <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: '#991b1b' }}>
                  The AI proposal will be discarded. The previous baseline cadastral record will remain authoritative.
                </div>
              )}

              {decision === 'MODIFY' && (
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: '#1e40af' }}>
                  The specified modified attributes will be applied to the master record along with your review remarks.
                </div>
              )}

              <div className="modal-footer" style={{ padding: 0, background: 'transparent', borderTop: 'none', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirm(false)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={`btn ${decision === 'ACCEPT' ? 'btn-accept' : decision === 'REJECT' ? 'btn-reject' : 'btn-modify'}`}
                  disabled={isSubmitting}
                  onClick={handleFinalConfirm}
                >
                  {isSubmitting ? 'Recording Decision...' : `Confirm ${decision}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

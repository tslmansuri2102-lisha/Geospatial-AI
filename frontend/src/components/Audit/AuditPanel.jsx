import React from 'react';
import { History, ShieldCheck, User, Calendar, Tag } from 'lucide-react';

export default function AuditPanel({ audits = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
          Official Audit Trail &bull; Governance Log
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Immutable ledger of human certification actions, determinations, and status transitions
        </p>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <span className="panel-title">
            <History size={16} />
            Certified Determinations ({audits.length})
          </span>
        </div>

        <div className="panel-body">
          {audits.length === 0 ? (
            <div className="state-box">
              <History size={32} color="#94a3b8" />
              <p>No certification decisions have been recorded in this session yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {audits.map((record) => (
                <div
                  key={record.audit_id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {record.audit_id}
                      </span>
                      <span
                        className={`badge ${
                          record.decision === 'ACCEPT'
                            ? 'badge-verified'
                            : record.decision === 'REJECT'
                            ? 'badge-conflict'
                            : 'badge-changed'
                        }`}
                      >
                        {record.decision}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                      <Calendar size={13} />
                      <span>{new Date(record.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Reviewer ID:</span>{' '}
                      <strong>{record.reviewer_id}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Target Conflict:</span>{' '}
                      <strong>{record.conflict_id}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Target Parcel:</span>{' '}
                      <strong>{record.parcel_id}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Status Transition:</span>{' '}
                      <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                        {record.previous_status} &rarr; {record.final_status}
                      </span>
                    </div>
                  </div>

                  {record.remarks && (
                    <div style={{ marginTop: '8px', padding: '6px 10px', background: '#f8fafc', borderRadius: '4px', fontSize: '0.78rem', color: '#475569' }}>
                      <strong>Remarks:</strong> {record.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

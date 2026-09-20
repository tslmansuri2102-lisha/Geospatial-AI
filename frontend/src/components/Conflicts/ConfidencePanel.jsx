import React from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

export default function ConfidencePanel({ proposal }) {
  if (!proposal) {
    return (
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
        No AI resolution proposal currently loaded for this conflict.
      </div>
    );
  }

  const confidencePercent = Math.round((proposal.confidence || 0) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Confidence Header */}
      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#2563eb" />
            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>AI Proposal Confidence</strong>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: confidencePercent >= 80 ? '#10b981' : '#f59e0b' }}>
            {confidencePercent}%
          </span>
        </div>

        <div className="confidence-bar-container" style={{ height: '10px', marginTop: '8px' }}>
          <div
            className="confidence-bar-fill"
            style={{
              width: `${confidencePercent}%`,
              background: confidencePercent >= 80 ? '#10b981' : '#f59e0b',
            }}
          />
        </div>
      </div>

      {/* Measurable Factors Breakdown */}
      {proposal.explanation && proposal.explanation.length > 0 && (
        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Measurable Contributing Factors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {proposal.explanation.map((factor, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.82rem',
                  color: '#334155',
                }}
              >
                <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contributing Sources */}
      {proposal.contributing_sources && proposal.contributing_sources.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
          <span style={{ fontWeight: 600 }}>Contributing Sources:</span>
          {proposal.contributing_sources.map((srcId) => (
            <span key={srcId} className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
              {srcId}
            </span>
          ))}
        </div>
      )}

      {/* Authoritative Warning Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.78rem',
          color: '#b45309',
        }}
      >
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Decision Support:</strong> This AI proposal does NOT overwrite master cadastral records until certified by an authorized human reviewer.
        </span>
      </div>
    </div>
  );
}

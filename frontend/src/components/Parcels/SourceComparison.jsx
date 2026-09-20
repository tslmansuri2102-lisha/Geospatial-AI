import React from 'react';
import { Database, FileCheck, Layers, Sparkles } from 'lucide-react';

export default function SourceComparison({ parcel, sources = [], proposal = null }) {
  if (!parcel) {
    return (
      <div className="state-box">
        <Database size={32} color="#94a3b8" />
        <p>Select a parcel to compare contributing data sources and harmonization factors.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
            Multi-Source Comparison &bull; Parcel {parcel.parcel_id}
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Cross-referencing authoritative cadastral, municipal, and revenue datasets
          </p>
        </div>
      </div>

      <div className="comparison-grid">
        {/* Source Records from sources array */}
        {sources.map((src) => (
          <div key={src.source_id} className="comparison-card">
            <div className="comparison-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} />
              <span>{src.source_name || `${src.source_type.toUpperCase()} Record`}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Source ID:</span>{' '}
                <strong>{src.source_id}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Type:</span>{' '}
                <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                  {src.source_type}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Survey Date:</span>{' '}
                {src.survey_date || 'N/A'}
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Record Date:</span>{' '}
                {src.source_date || 'N/A'}
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Native CRS:</span>{' '}
                <code>{src.crs || 'EPSG:4326'}</code>
              </div>
              {src.reliability_score !== undefined && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem' }}>
                    <span>Reliability Score:</span>
                    <strong>{Math.round(src.reliability_score * 100)}%</strong>
                  </div>
                  <div className="confidence-bar-container">
                    <div
                      className="confidence-bar-fill"
                      style={{
                        width: `${Math.round(src.reliability_score * 100)}%`,
                        background: '#0284c7',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Harmonized / AI Proposal Card if available */}
        {proposal && (
          <div
            className="comparison-card"
            style={{ borderColor: '#93c5fd', background: '#eff6ff' }}
          >
            <div
              className="comparison-title"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8' }}
            >
              <Sparkles size={14} />
              <span>AI Proposal &bull; {proposal.conflict_id}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Recommendation:</span>
                <p style={{ fontWeight: 600, color: '#1e3a8a', marginTop: '2px' }}>
                  {proposal.recommendation}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem' }}>
                  <span>AI Confidence:</span>
                  <strong>{Math.round((proposal.confidence || 0) * 100)}%</strong>
                </div>
                <div className="confidence-bar-container">
                  <div
                    className="confidence-bar-fill"
                    style={{
                      width: `${Math.round((proposal.confidence || 0) * 100)}%`,
                      background: '#10b981',
                    }}
                  />
                </div>
              </div>

              {proposal.explanation && (
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                    Reasoning Factors:
                  </span>
                  <ul style={{ paddingLeft: '16px', marginTop: '4px', fontSize: '0.75rem', color: '#334155' }}>
                    {proposal.explanation.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

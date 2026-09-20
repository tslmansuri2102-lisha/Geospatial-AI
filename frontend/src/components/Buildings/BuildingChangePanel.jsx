import React from 'react';
import {
  Building2,
  AlertTriangle,
  GitCommit,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function BuildingChangePanel({ buildings = [], changes = [], onSelectParcel }) {
  const unrecordedBuildings = buildings.filter(
    (b) => b.record_status === 'POTENTIALLY_UNRECORDED'
  );
  const recordedBuildings = buildings.filter(
    (b) => b.record_status === 'RECORDED'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Building &amp; Change Detection Intelligence
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            AI-detected footprints from high-resolution satellite imagery compared with official land records
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-unrecorded">
            {unrecordedBuildings.length} Potentially Unrecorded
          </span>
          <span className="badge badge-verified">
            {recordedBuildings.length} Recorded Structures
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Buildings Panel */}
        <div className="panel-card">
          <div className="panel-header">
            <span className="panel-title">
              <Building2 size={16} />
              Detected Building Footprints ({buildings.length})
            </span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {buildings.length === 0 ? (
              <div className="state-box">
                <Building2 size={32} color="#94a3b8" />
                <p>No building footprints detected in the selected scope.</p>
              </div>
            ) : (
              buildings.map((building) => {
                const isUnrecorded = building.record_status === 'POTENTIALLY_UNRECORDED';
                return (
                  <div
                    key={building.building_id}
                    style={{
                      border: isUnrecorded ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                      background: isUnrecorded ? '#fffaf5' : '#ffffff',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          Building {building.building_id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Parcel {building.parcel_id}
                        </span>
                      </div>
                      <span className={`badge ${isUnrecorded ? 'badge-unrecorded' : 'badge-verified'}`}>
                        {building.record_status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: '#334155', marginTop: '6px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Footprint Area:</span>{' '}
                        <strong>{building.area_sq_m} m²</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Detection Source:</span>{' '}
                        {building.detection_source}
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Detection Date:</span>{' '}
                        {building.detection_date}
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Confidence:</span>{' '}
                        <strong>{Math.round((building.detection_confidence || 0) * 100)}%</strong>
                      </div>
                    </div>

                    {isUnrecorded && (
                      <div
                        style={{
                          marginTop: '8px',
                          background: '#fff7ed',
                          border: '1px solid #ffedd5',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          color: '#9a3412',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <AlertTriangle size={14} />
                        <span>
                          Structure detected by imagery without matching municipal tax/cadastral building ledger record. Field verification recommended.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Change Events Timeline */}
        <div className="panel-card">
          <div className="panel-header">
            <span className="panel-title">
              <GitCommit size={16} />
              Historical Change Events ({changes.length})
            </span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {changes.length === 0 ? (
              <div className="state-box">
                <GitCommit size={32} color="#94a3b8" />
                <p>No historical change events logged for this parcel dataset.</p>
              </div>
            ) : (
              changes.map((change) => (
                <div
                  key={change.change_id}
                  style={{
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {change.change_id}
                      </span>
                      <span className="badge badge-changed" style={{ fontSize: '0.7rem' }}>
                        {change.change_type}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {change.detected_on}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <div>
                      Target Parcel: <strong>{change.parcel_id}</strong>
                    </div>
                    {change.confidence !== undefined && (
                      <div style={{ marginTop: '2px' }}>
                        Detection Confidence: <strong>{Math.round(change.confidence * 100)}%</strong>
                      </div>
                    )}
                  </div>

                  {/* Previous vs Current Value */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      background: '#f8fafc',
                      padding: '8px',
                      borderRadius: '4px',
                      marginTop: '8px',
                      fontSize: '0.72rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#64748b' }}>PREVIOUS STATE</div>
                      <pre style={{ whiteSpace: 'pre-wrap', color: '#334155', marginTop: '2px' }}>
                        {JSON.stringify(change.previous_value, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#2563eb' }}>DETECTED STATE</div>
                      <pre style={{ whiteSpace: 'pre-wrap', color: '#1e3a8a', marginTop: '2px' }}>
                        {JSON.stringify(change.current_value, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

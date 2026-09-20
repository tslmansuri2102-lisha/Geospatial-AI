import React from 'react';
import {
  FileText,
  MapPin,
  Maximize2,
  Calendar,
  AlertTriangle,
  Building,
  GitCompare,
  Layers,
  CheckCircle,
} from 'lucide-react';

export default function ParcelDetails({
  parcel,
  sources = [],
  conflicts = [],
  buildings = [],
  changes = [],
  onSelectConflict = () => {},
}) {
  if (!parcel) {
    return (
      <div className="state-box">
        <MapPin size={36} color="#94a3b8" />
        <h3>No Parcel Selected</h3>
        <p>Select a parcel from the map or explorer list to inspect authoritative records, sources, and conflicts.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="badge badge-verified">VERIFIED</span>;
      case 'PENDING_REVIEW':
        return <span className="badge badge-pending">PENDING_REVIEW</span>;
      case 'CONFLICT':
        return <span className="badge badge-conflict">CONFLICT</span>;
      case 'CHANGED':
        return <span className="badge badge-changed">CHANGED</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const confidencePercent = Math.round((parcel.confidence || 0) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Parcel {parcel.parcel_id}
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Authoritative Master Record
          </span>
        </div>
        {getStatusBadge(parcel.status)}
      </div>

      {/* Confidence Meter */}
      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
          <span style={{ color: '#475569' }}>Overall Harmonization Confidence</span>
          <span style={{ color: confidencePercent >= 80 ? '#10b981' : '#f59e0b' }}>
            {confidencePercent}%
          </span>
        </div>
        <div className="confidence-bar-container">
          <div
            className="confidence-bar-fill"
            style={{
              width: `${confidencePercent}%`,
              background: confidencePercent >= 80 ? '#10b981' : '#f59e0b',
            }}
          />
        </div>
      </div>

      {/* Primary Attributes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Area (sq m)</div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{parcel.area_sq_m} m²</div>
        </div>
        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Land Use</div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{parcel.attributes?.land_use || 'N/A'}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Survey Number</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{parcel.attributes?.survey_number || 'N/A'}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Property ID</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{parcel.attributes?.property_id || 'N/A'}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Municipal Zone</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{parcel.attributes?.municipal_zone || 'N/A'}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Owner Reference</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{parcel.attributes?.owner_reference || 'N/A'}</div>
        </div>
      </div>

      {/* Geometry Metadata */}
      <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
        <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Geometry Convention</div>
        <div style={{ color: '#475569' }}>Type: {parcel.geometry?.type || 'Polygon'}</div>
        <div style={{ color: '#475569' }}>CRS: Standard EPSG:4326 (WGS84 Lat/Lon)</div>
        <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>
          Last Updated: {parcel.last_updated ? new Date(parcel.last_updated).toLocaleString() : 'N/A'}
        </div>
      </div>

      {/* Conflicts Alert Section if any */}
      {conflicts.length > 0 && (
        <div style={{ border: '1px solid #fecaca', background: '#fef2f2', padding: '12px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 600, marginBottom: '6px' }}>
            <AlertTriangle size={16} />
            <span>Active Conflicts ({conflicts.length})</span>
          </div>
          {conflicts.map((c) => (
            <div
              key={c.conflict_id}
              onClick={() => onSelectConflict(c)}
              style={{
                background: '#ffffff',
                border: '1px solid #fca5a5',
                padding: '8px 10px',
                borderRadius: '4px',
                marginTop: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>{c.conflict_id} ({c.conflict_type})</span>
                <span className={`badge ${c.severity === 'HIGH' ? 'badge-conflict' : 'badge-pending'}`}>
                  {c.severity}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

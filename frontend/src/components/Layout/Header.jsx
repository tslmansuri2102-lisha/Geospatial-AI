import React from 'react';
import { Layers, ShieldCheck, User, Radio, RefreshCw } from 'lucide-react';

export default function Header({ isLive, isMock, onToggleMock, onRefresh, reviewerId = 'OFFICER-001' }) {
  return (
    <header className="top-header">
      <div className="header-brand">
        <div style={{ background: '#2563eb', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Layers size={22} color="#ffffff" />
        </div>
        <div className="header-title-box">
          <h1>Urban Land Record Intelligence Dashboard</h1>
          <p>Multi-source Geospatial Data Harmonization &amp; Human Verification &bull; SIH PS13</p>
        </div>
      </div>

      <div className="header-meta">
        {/* System connection indicator */}
        <div
          className={`badge ${isLive ? 'badge-verified' : 'badge-pending'}`}
          title={isLive ? 'Connected to backend server at http://localhost:8000/api/v1' : 'Running in Offline / Contract Mock Mode'}
          style={{ cursor: 'pointer' }}
          onClick={onToggleMock}
        >
          <Radio size={14} className={isLive ? '' : 'pulse'} />
          <span>{isLive ? 'Backend: Connected' : 'Demo / Standalone Mode'}</span>
        </div>

        {/* Reviewer / Officer indicator */}
        <div className="badge badge-gray" title="Authenticated decision support reviewer">
          <User size={14} />
          <span>{reviewerId}</span>
        </div>

        {/* Quick reload */}
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          title="Refresh dataset from API"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
        >
          <RefreshCw size={14} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
}

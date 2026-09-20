import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function ParcelSearch({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  totalCount,
}) {
  return (
    <div className="search-bar-box" style={{ alignItems: 'center' }}>
      {/* Search by Parcel ID */}
      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
        />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: '32px', width: '100%' }}
          placeholder="Search by Parcel ID (e.g. P001)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter by Status supported in docs/api-contract.yaml */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={16} color="#64748b" />
        <select
          className="input-field"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses ({totalCount})</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="PENDING_REVIEW">PENDING_REVIEW</option>
          <option value="CONFLICT">CONFLICT</option>
          <option value="CHANGED">CHANGED</option>
        </select>
      </div>
    </div>
  );
}

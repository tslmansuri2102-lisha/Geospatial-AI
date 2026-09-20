/**
 * SIH 2026 PS13 API Client
 * Strictly adheres to docs/api-contract.yaml:
 *  - GET  /parcels
 *  - GET  /parcels/{parcel_id}
 *  - GET  /parcels/{parcel_id}/sources
 *  - GET  /parcels/{parcel_id}/conflicts
 *  - GET  /parcels/{parcel_id}/buildings
 *  - GET  /parcels/{parcel_id}/changes
 *  - POST /conflicts/{conflict_id}/resolve
 *  - POST /conflicts/{conflict_id}/decision
 */

import {
  INITIAL_PARCELS,
  INITIAL_CONFLICTS,
  INITIAL_PROPOSALS,
  INITIAL_BUILDINGS,
  INITIAL_CHANGES,
  INITIAL_AUDIT,
} from './mockData';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api/v1';

// In-memory demo store for fallback / offline mode
class MockStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.parcels = JSON.parse(JSON.stringify(INITIAL_PARCELS));
    this.conflicts = JSON.parse(JSON.stringify(INITIAL_CONFLICTS));
    this.proposals = JSON.parse(JSON.stringify(INITIAL_PROPOSALS));
    this.buildings = JSON.parse(JSON.stringify(INITIAL_BUILDINGS));
    this.changes = JSON.parse(JSON.stringify(INITIAL_CHANGES));
    this.audits = JSON.parse(JSON.stringify(INITIAL_AUDIT));
  }

  getParcels(status, limit = 50) {
    let list = this.parcels;
    if (status) {
      list = list.filter((p) => p.status === status);
    }
    return {
      count: list.length,
      parcels: list.slice(0, limit),
    };
  }

  getParcelById(id) {
    return this.parcels.find((p) => p.parcel_id === id) || null;
  }

  getParcelSources(id) {
    const p = this.getParcelById(id);
    return {
      parcel_id: id,
      sources: p ? p.sources || [] : [],
    };
  }

  getParcelConflicts(id) {
    const list = this.conflicts.filter((c) => c.parcel_id === id);
    return {
      parcel_id: id,
      conflicts: list,
    };
  }

  getParcelBuildings(id) {
    const list = this.buildings.filter((b) => b.parcel_id === id);
    return {
      parcel_id: id,
      buildings: list,
    };
  }

  getParcelChanges(id) {
    const list = this.changes.filter((c) => c.parcel_id === id);
    return {
      parcel_id: id,
      changes: list,
    };
  }

  getConflictProposal(conflictId) {
    return (
      this.proposals[conflictId] || {
        conflict_id: conflictId,
        recommendation: 'Proposal pending from conflict resolution engine.',
        confidence: 0.85,
        explanation: ['Awaiting algorithmic consensus from spatial engine'],
        contributing_sources: [],
      }
    );
  }

  recordDecision(conflictId, { decision, reviewer_id, modified_geometry, modified_attributes, remarks }) {
    const conflictIndex = this.conflicts.findIndex((c) => c.conflict_id === conflictId);
    let finalStatus = 'PENDING_REVIEW';

    if (decision === 'ACCEPT') {
      finalStatus = 'VERIFIED';
    } else if (decision === 'REJECT') {
      finalStatus = 'REJECTED';
    } else if (decision === 'MODIFY') {
      finalStatus = 'MODIFIED';
    }

    if (conflictIndex >= 0) {
      this.conflicts[conflictIndex].status = decision === 'ACCEPT' ? 'ACCEPTED' : decision === 'REJECT' ? 'REJECTED' : 'MODIFIED';
      const parcel = this.parcels.find((p) => p.parcel_id === this.conflicts[conflictIndex].parcel_id);
      if (parcel) {
        parcel.status = finalStatus;
        if (decision === 'MODIFY') {
          if (modified_attributes) {
            parcel.attributes = { ...parcel.attributes, ...modified_attributes };
          }
          if (modified_geometry) {
            parcel.geometry = modified_geometry;
          }
        }
      }
    }

    const auditRecord = {
      audit_id: `AUDIT-00${this.audits.length + 1}`,
      conflict_id: conflictId,
      parcel_id: conflictIndex >= 0 ? this.conflicts[conflictIndex].parcel_id : 'UNKNOWN',
      reviewer_id,
      decision,
      previous_status: 'AI_PROPOSED',
      final_status: finalStatus,
      timestamp: new Date().toISOString(),
      remarks: remarks || '',
    };

    this.audits.unshift(auditRecord);

    return {
      conflict_id: conflictId,
      decision,
      final_status: finalStatus,
      audit_id: auditRecord.audit_id,
      timestamp: auditRecord.timestamp,
      message: `Decision '${decision}' recorded successfully by ${reviewer_id}.`,
    };
  }
}

export const mockStore = new MockStore();
let useMockFallback = true;
let isConnectedToRealBackend = false;

export function setMockMode(enabled) {
  useMockFallback = enabled;
}

export function isMockMode() {
  return useMockFallback;
}

export function isBackendOnline() {
  return isConnectedToRealBackend;
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || errBody.detail || `HTTP Error ${res.status}: ${res.statusText}`);
    }

    isConnectedToRealBackend = true;
    return await res.json();
  } catch (error) {
    if (useMockFallback) {
      isConnectedToRealBackend = false;
      return handleMockFallback(endpoint, options);
    }
    throw new Error(`API Service Unavailable: ${error.message}`);
  }
}

function handleMockFallback(endpoint, options) {
  const method = options.method || 'GET';

  // GET /parcels
  if (method === 'GET' && endpoint.startsWith('/parcels')) {
    const matchDetail = endpoint.match(/^\/parcels\/([A-Za-z0-9_-]+)$/);
    if (matchDetail) {
      const p = mockStore.getParcelById(matchDetail[1]);
      if (!p) throw new Error(`Parcel not found: ${matchDetail[1]}`);
      return p;
    }

    const matchSources = endpoint.match(/^\/parcels\/([A-Za-z0-9_-]+)\/sources$/);
    if (matchSources) {
      return mockStore.getParcelSources(matchSources[1]);
    }

    const matchConflicts = endpoint.match(/^\/parcels\/([A-Za-z0-9_-]+)\/conflicts$/);
    if (matchConflicts) {
      return mockStore.getParcelConflicts(matchConflicts[1]);
    }

    const matchBuildings = endpoint.match(/^\/parcels\/([A-Za-z0-9_-]+)\/buildings$/);
    if (matchBuildings) {
      return mockStore.getParcelBuildings(matchBuildings[1]);
    }

    const matchChanges = endpoint.match(/^\/parcels\/([A-Za-z0-9_-]+)\/changes$/);
    if (matchChanges) {
      return mockStore.getParcelChanges(matchChanges[1]);
    }

    if (endpoint === '/parcels' || endpoint.startsWith('/parcels?')) {
      const url = new URL(`http://localhost${endpoint}`);
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      return mockStore.getParcels(status, limit);
    }
  }

  // POST /conflicts/{conflict_id}/resolve
  if (method === 'POST' && endpoint.match(/^\/conflicts\/([A-Za-z0-9_-]+)\/resolve$/)) {
    const conflictId = endpoint.match(/^\/conflicts\/([A-Za-z0-9_-]+)\/resolve$/)[1];
    return mockStore.getConflictProposal(conflictId);
  }

  // POST /conflicts/{conflict_id}/decision
  if (method === 'POST' && endpoint.match(/^\/conflicts\/([A-Za-z0-9_-]+)\/decision$/)) {
    const conflictId = endpoint.match(/^\/conflicts\/([A-Za-z0-9_-]+)\/decision$/)[1];
    const body = options.body ? JSON.parse(options.body) : {};
    return mockStore.recordDecision(conflictId, body);
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
}

// Public API methods matching docs/api-contract.yaml
export const api = {
  // Parcels
  getParcels: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/parcels${qs}`);
  },

  getParcelById: (parcelId) => request(`/parcels/${parcelId}`),

  getParcelSources: (parcelId) => request(`/parcels/${parcelId}/sources`),

  getParcelConflicts: (parcelId) => request(`/parcels/${parcelId}/conflicts`),

  getParcelBuildings: (parcelId) => request(`/parcels/${parcelId}/buildings`),

  getParcelChanges: (parcelId) => request(`/parcels/${parcelId}/changes`),

  // Conflicts & AI Proposals
  resolveConflict: (conflictId) =>
    request(`/conflicts/${conflictId}/resolve`, {
      method: 'POST',
    }),

  submitConflictDecision: (conflictId, decisionData) =>
    request(`/conflicts/${conflictId}/decision`, {
      method: 'POST',
      body: JSON.stringify(decisionData),
    }),

  // Audit records from mock store
  getAuditTrail: () => mockStore.audits,
};

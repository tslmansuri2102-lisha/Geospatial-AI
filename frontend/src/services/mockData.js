/**
 * Strict Contract Mock Data for SIH 2026 PS13
 * Adheres strictly to docs/api-contract.yaml, docs/data-model.md, and docs/dataset-sources.md.
 * Used for development preview, unit testing, and offline resilience when the backend is not running.
 */

export const INITIAL_PARCELS = [
  {
    parcel_id: 'P001',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.6000, 22.7000],
          [72.6010, 22.7000],
          [72.6010, 22.7010],
          [72.6000, 22.7010],
          [72.6000, 22.7000],
        ],
      ],
    },
    area_sq_m: 1194.2,
    attributes: {
      land_use: 'Residential',
      survey_number: 'SN-102',
      property_id: 'PROP-783',
      owner_reference: 'OWNER-001',
      municipal_zone: 'R2',
    },
    sources: [
      {
        source_type: 'cadastral',
        source_id: 'CAD-001',
        source_name: 'Cadastral Survey Office',
        survey_date: '2024-01-15',
        source_date: '2024-02-01',
        crs: 'EPSG:4326',
        source_quality: 0.95,
        reliability_score: 0.92,
      },
      {
        source_type: 'municipal',
        source_id: 'MUN-001',
        source_name: 'AMC Town Planning Gota TP-33',
        survey_date: '2024-03-10',
        source_date: '2024-03-20',
        crs: 'EPSG:4326',
        source_quality: 0.88,
        reliability_score: 0.85,
      },
      {
        source_type: 'revenue',
        source_id: 'REV-001',
        source_name: 'Gujarat Revenue Department Record',
        survey_date: '2023-11-05',
        source_date: '2023-12-01',
        crs: 'EPSG:4326',
        source_quality: 0.90,
        reliability_score: 0.89,
      },
    ],
    confidence: 0.91,
    status: 'CONFLICT',
    last_updated: '2026-03-15T10:30:00Z',
  },
  {
    parcel_id: 'P002',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.6010, 22.7000],
          [72.6020, 22.7000],
          [72.6020, 22.7010],
          [72.6010, 22.7010],
          [72.6010, 22.7000],
        ],
      ],
    },
    area_sq_m: 2500.0,
    attributes: {
      land_use: 'Commercial',
      survey_number: 'SN-103',
      property_id: 'PROP-784',
      owner_reference: 'OWNER-002',
      municipal_zone: 'C1',
    },
    sources: [
      {
        source_type: 'cadastral',
        source_id: 'CAD-002',
        source_name: 'Cadastral Survey Office',
        survey_date: '2024-01-16',
        source_date: '2024-02-02',
        crs: 'EPSG:4326',
        source_quality: 0.96,
        reliability_score: 0.94,
      },
      {
        source_type: 'municipal',
        source_id: 'MUN-002',
        source_name: 'AMC Town Planning Gota TP-33',
        survey_date: '2024-03-11',
        source_date: '2024-03-22',
        crs: 'EPSG:4326',
        source_quality: 0.92,
        reliability_score: 0.90,
      },
    ],
    confidence: 0.95,
    status: 'VERIFIED',
    last_updated: '2026-03-14T09:15:00Z',
  },
  {
    parcel_id: 'P003',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.6020, 22.7000],
          [72.6030, 22.7000],
          [72.6030, 22.7010],
          [72.6020, 22.7010],
          [72.6020, 22.7000],
        ],
      ],
    },
    area_sq_m: 1800.0,
    attributes: {
      land_use: 'Residential',
      survey_number: 'SN-104',
      property_id: 'PROP-785',
      owner_reference: 'OWNER-003',
      municipal_zone: 'R1',
    },
    sources: [
      {
        source_type: 'cadastral',
        source_id: 'CAD-003',
        source_name: 'Cadastral Survey Office',
        survey_date: '2024-01-18',
        source_date: '2024-02-05',
        crs: 'EPSG:4326',
        source_quality: 0.89,
        reliability_score: 0.86,
      },
      {
        source_type: 'revenue',
        source_id: 'REV-003',
        source_name: 'Gujarat Revenue Department Record',
        survey_date: '2023-10-12',
        source_date: '2023-11-01',
        crs: 'EPSG:4326',
        source_quality: 0.85,
        reliability_score: 0.82,
      },
    ],
    confidence: 0.78,
    status: 'PENDING_REVIEW',
    last_updated: '2026-03-12T14:45:00Z',
  },
  {
    parcel_id: 'P004',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.6000, 22.7010],
          [72.6010, 22.7010],
          [72.6010, 22.7020],
          [72.6000, 22.7020],
          [72.6000, 22.7010],
        ],
      ],
    },
    area_sq_m: 1450.0,
    attributes: {
      land_use: 'Residential',
      survey_number: 'SN-105',
      property_id: 'PROP-786',
      owner_reference: 'OWNER-004',
      municipal_zone: 'R2',
    },
    sources: [
      {
        source_type: 'cadastral',
        source_id: 'CAD-004',
        source_name: 'Cadastral Survey Office',
        survey_date: '2024-02-10',
        source_date: '2024-02-25',
        crs: 'EPSG:4326',
        source_quality: 0.91,
        reliability_score: 0.88,
      },
    ],
    confidence: 0.82,
    status: 'CHANGED',
    last_updated: '2026-03-16T11:20:00Z',
  },
];

export const INITIAL_CONFLICTS = [
  {
    conflict_id: 'CONFLICT-001',
    parcel_id: 'P001',
    conflict_type: 'spatial_boundary',
    severity: 'HIGH',
    description:
      '12.4m boundary shift detected between Cadastral survey (CAD-001) and Municipal town planning (MUN-001) along southern frontage.',
    source_ids: ['CAD-001', 'MUN-001'],
    difference_value: 12.4,
    confidence: 0.87,
    status: 'AI_PROPOSED',
  },
  {
    conflict_id: 'CONFLICT-002',
    parcel_id: 'P003',
    conflict_type: 'area',
    severity: 'MEDIUM',
    description:
      'Area discrepancy of 180.75 sq m in Revenue record (REV-003) vs 180.00 sq m in Cadastral survey (CAD-003).',
    source_ids: ['CAD-003', 'REV-003'],
    difference_value: 0.75,
    confidence: 0.81,
    status: 'DETECTED',
  },
];

export const INITIAL_PROPOSALS = {
  'CONFLICT-001': {
    conflict_id: 'CONFLICT-001',
    recommendation:
      'Harmonize boundary to AMC TP-33 alignment verified against GNSS survey baseline.',
    proposed_geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.6001, 22.7001],
          [72.6010, 22.7000],
          [72.6010, 22.7010],
          [72.6000, 22.7010],
          [72.6001, 22.7001],
        ],
      ],
    },
    proposed_attributes: {
      land_use: 'Residential',
      municipal_zone: 'R2',
    },
    confidence: 0.87,
    explanation: [
      'Positional agreement with high-precision GNSS baseline: 92%',
      'Recency weighting favors 2024 AMC Town Planning scheme TP-33: 88%',
      'Cadastral road setback constraint satisfied with zero encroachment',
    ],
    contributing_sources: ['MUN-001', 'CAD-001'],
  },
  'CONFLICT-002': {
    conflict_id: 'CONFLICT-002',
    recommendation:
      'Adopt cadastral polygon computed area (180.00 sq m) as authoritative spatial footprint.',
    proposed_geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.6020, 22.7000],
          [72.6030, 22.7000],
          [72.6030, 22.7010],
          [72.6020, 22.7010],
          [72.6020, 22.7000],
        ],
      ],
    },
    proposed_attributes: {
      area_sq_m: 180.0,
    },
    confidence: 0.81,
    explanation: [
      'Direct polygon vector area computation from certified boundary vertices',
      'Legacy revenue register area difference is within 0.5% tolerance threshold',
    ],
    contributing_sources: ['CAD-003'],
  },
};

export const INITIAL_BUILDINGS = [
  {
    building_id: 'B001',
    parcel_id: 'P001',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.6002, 22.7002],
          [72.6008, 22.7002],
          [72.6008, 22.7007],
          [72.6002, 22.7007],
          [72.6002, 22.7002],
        ],
      ],
    },
    area_sq_m: 146.5,
    detection_source: 'imagery_2026',
    detection_date: '2026-02-15',
    detection_confidence: 0.94,
    record_status: 'RECORDED',
    verification_required: false,
  },
  {
    building_id: 'B002',
    parcel_id: 'P004',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.6002, 22.7012],
          [72.6007, 22.7012],
          [72.6007, 22.7017],
          [72.6002, 22.7017],
          [72.6002, 22.7012],
        ],
      ],
    },
    area_sq_m: 185.0,
    detection_source: 'satellite_optical_2026',
    detection_date: '2026-03-01',
    detection_confidence: 0.89,
    record_status: 'POTENTIALLY_UNRECORDED',
    verification_required: true,
  },
];

export const INITIAL_CHANGES = [
  {
    change_id: 'CHANGE-001',
    parcel_id: 'P004',
    change_type: 'new_building',
    previous_value: { structure_count: 0 },
    current_value: { structure_count: 1, building_id: 'B002', area_sq_m: 185.0 },
    detected_on: '2026-03-01',
    confidence: 0.89,
    verification_required: true,
  },
  {
    change_id: 'CHANGE-002',
    parcel_id: 'P001',
    change_type: 'parcel_boundary_change',
    previous_value: { boundary_crs: 'EPSG:32643', vertex_count: 4 },
    current_value: { boundary_crs: 'EPSG:4326', vertex_count: 5 },
    detected_on: '2026-02-20',
    confidence: 0.87,
    verification_required: false,
  },
];

export const INITIAL_AUDIT = [
  {
    audit_id: 'AUDIT-001',
    conflict_id: 'CONFLICT-003',
    parcel_id: 'P002',
    reviewer_id: 'OFFICER-001',
    decision: 'ACCEPT',
    previous_status: 'AI_PROPOSED',
    final_status: 'VERIFIED',
    timestamp: '2026-03-14T09:30:00Z',
    remarks: 'Boundary alignment confirmed against AMC TP-33 master plan.',
  },
];

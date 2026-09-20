import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BuildingChangePanel from '../components/Buildings/BuildingChangePanel';

const mockBuildings = [
  {
    building_id: 'B001',
    parcel_id: 'P001',
    geometry: { type: 'Polygon', coordinates: [] },
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
    geometry: { type: 'Polygon', coordinates: [] },
    area_sq_m: 185.0,
    detection_source: 'satellite_optical_2026',
    detection_date: '2026-03-01',
    detection_confidence: 0.89,
    record_status: 'POTENTIALLY_UNRECORDED',
    verification_required: true,
  },
];

const mockChanges = [
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
];

describe('Building, Change Detection & Resilience Suite', () => {
  it('renders buildings and distinguishes RECORDED vs POTENTIALLY_UNRECORDED', () => {
    render(<BuildingChangePanel buildings={mockBuildings} changes={mockChanges} />);

    expect(screen.getByText('Building B001')).toBeInTheDocument();
    expect(screen.getByText('RECORDED')).toBeInTheDocument();

    expect(screen.getByText('Building B002')).toBeInTheDocument();
    expect(screen.getByText('POTENTIALLY_UNRECORDED')).toBeInTheDocument();

    // Verify neutral non-judgmental language: no words like illegal or fraudulent
    expect(screen.queryByText(/illegal/i)).toBeNull();
    expect(screen.queryByText(/unauthorized/i)).toBeNull();
    expect(screen.queryByText(/fraudulent/i)).toBeNull();
  });

  it('renders historical change events timeline with previous and current values', () => {
    render(<BuildingChangePanel buildings={mockBuildings} changes={mockChanges} />);

    expect(screen.getByText('CHANGE-001')).toBeInTheDocument();
    expect(screen.getByText('new_building')).toBeInTheDocument();
    expect(screen.getByText('PREVIOUS STATE')).toBeInTheDocument();
    expect(screen.getByText('DETECTED STATE')).toBeInTheDocument();
  });

  it('renders empty states gracefully when buildings and changes arrays are empty', () => {
    render(<BuildingChangePanel buildings={[]} changes={[]} />);

    expect(screen.getByText(/No building footprints detected/i)).toBeInTheDocument();
    expect(screen.getByText(/No historical change events logged/i)).toBeInTheDocument();
  });
});

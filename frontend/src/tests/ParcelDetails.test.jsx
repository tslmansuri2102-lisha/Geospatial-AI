import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ParcelDetails from '../components/Parcels/ParcelDetails';
import SourceComparison from '../components/Parcels/SourceComparison';
import ParcelSearch from '../components/Parcels/ParcelSearch';

const mockParcel = {
  parcel_id: 'P001',
  geometry: {
    type: 'Polygon',
    coordinates: [[[72.6000, 22.7000], [72.6010, 22.7000], [72.6010, 22.7010], [72.6000, 22.7010], [72.6000, 22.7000]]],
  },
  area_sq_m: 1194.2,
  attributes: {
    land_use: 'Residential',
    survey_number: 'SN-102',
    property_id: 'PROP-783',
    owner_reference: 'OWNER-001',
    municipal_zone: 'R2',
  },
  confidence: 0.91,
  status: 'CONFLICT',
  last_updated: '2026-03-15T10:30:00Z',
};

const mockSources = [
  {
    source_type: 'cadastral',
    source_id: 'CAD-001',
    source_name: 'Cadastral Survey Office',
    survey_date: '2024-01-15',
    crs: 'EPSG:4326',
    reliability_score: 0.92,
  },
  {
    source_type: 'municipal',
    source_id: 'MUN-001',
    source_name: 'AMC Town Planning Gota TP-33',
    survey_date: '2024-03-10',
    crs: 'EPSG:4326',
    reliability_score: 0.85,
  },
];

describe('Parcel Inspection & Comparison Suite', () => {
  it('renders complete parcel attributes conforming to docs/data-model.md', () => {
    render(<ParcelDetails parcel={mockParcel} sources={mockSources} conflicts={[]} />);

    expect(screen.getByText('Parcel P001')).toBeInTheDocument();
    expect(screen.getByText('1194.2 m²')).toBeInTheDocument();
    expect(screen.getByText('Residential')).toBeInTheDocument();
    expect(screen.getByText('SN-102')).toBeInTheDocument();
    expect(screen.getByText('PROP-783')).toBeInTheDocument();
    expect(screen.getByText('R2')).toBeInTheDocument();
    expect(screen.getByText('OWNER-001')).toBeInTheDocument();
    expect(screen.getByText('91%')).toBeInTheDocument();
    expect(screen.getByText('CONFLICT')).toBeInTheDocument();
  });

  it('renders graceful empty state when no parcel is selected', () => {
    render(<ParcelDetails parcel={null} />);
    expect(screen.getByText('No Parcel Selected')).toBeInTheDocument();
  });

  it('renders multi-source cross comparison with Cadastral and Municipal records', () => {
    render(<SourceComparison parcel={mockParcel} sources={mockSources} />);

    expect(screen.getByText(/Multi-Source Comparison • Parcel P001/i)).toBeInTheDocument();
    expect(screen.getByText('Cadastral Survey Office')).toBeInTheDocument();
    expect(screen.getByText('CAD-001')).toBeInTheDocument();
    expect(screen.getByText('AMC Town Planning Gota TP-33')).toBeInTheDocument();
    expect(screen.getByText('MUN-001')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders search and filter bar with supported status options', () => {
    render(
      <ParcelSearch
        searchQuery=""
        setSearchQuery={() => {}}
        statusFilter=""
        setStatusFilter={() => {}}
        totalCount={4}
      />
    );

    expect(screen.getByPlaceholderText(/Search by Parcel ID/i)).toBeInTheDocument();
    expect(screen.getByText(/All Statuses \(4\)/i)).toBeInTheDocument();
  });
});

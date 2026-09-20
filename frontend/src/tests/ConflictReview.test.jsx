import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConflictList from '../components/Conflicts/ConflictList';
import ConflictDetails from '../components/Conflicts/ConflictDetails';
import ConfidencePanel from '../components/Conflicts/ConfidencePanel';

const mockConflict = {
  conflict_id: 'CONFLICT-001',
  parcel_id: 'P001',
  conflict_type: 'spatial_boundary',
  severity: 'HIGH',
  description: '12.4m boundary shift detected between Cadastral survey and Municipal plan.',
  source_ids: ['CAD-001', 'MUN-001'],
  difference_value: 12.4,
  confidence: 0.87,
  status: 'AI_PROPOSED',
};

const mockProposal = {
  conflict_id: 'CONFLICT-001',
  recommendation: 'Harmonize boundary to AMC TP-33 alignment verified against GNSS survey baseline.',
  confidence: 0.87,
  explanation: [
    'Positional agreement with high-precision GNSS baseline: 92%',
    'Recency weighting favors 2024 AMC Town Planning scheme TP-33: 88%',
    'Cadastral road setback constraint satisfied with zero encroachment',
  ],
  contributing_sources: ['MUN-001', 'CAD-001'],
};

describe('Conflict Review & Explainable AI Suite', () => {
  it('renders conflict list with severity badge, difference value, and status', () => {
    render(
      <ConflictList
        conflicts={[mockConflict]}
        selectedConflict={mockConflict}
        onSelectConflict={() => {}}
      />
    );

    expect(screen.getByText('CONFLICT-001')).toBeInTheDocument();
    expect(screen.getByText(/Parcel P001/i)).toBeInTheDocument();
    expect(screen.getByText('HIGH SEVERITY')).toBeInTheDocument();
    expect(screen.getByText('AI PROPOSED')).toBeInTheDocument();
    expect(screen.getByText('12.4')).toBeInTheDocument();
  });

  it('renders explainable AI confidence panel with measurable factors', () => {
    render(<ConfidencePanel proposal={mockProposal} />);

    expect(screen.getByText('AI Proposal Confidence')).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('Measurable Contributing Factors')).toBeInTheDocument();
    expect(
      screen.getByText(/Positional agreement with high-precision GNSS baseline: 92%/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Recency weighting favors 2024 AMC Town Planning scheme TP-33: 88%/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This AI proposal does NOT overwrite master cadastral records/i)
    ).toBeInTheDocument();

    // Verify no vague statements are fabricated
    expect(screen.queryByText(/AI says this is correct/i)).toBeNull();
  });

  it('renders empty conflict state when no conflicts are present', () => {
    render(<ConflictList conflicts={[]} />);
    expect(screen.getByText(/No active spatial or attribute conflicts/i)).toBeInTheDocument();
  });
});

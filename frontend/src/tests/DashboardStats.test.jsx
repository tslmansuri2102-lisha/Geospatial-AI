import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardStats from '../components/Dashboard/DashboardStats';
import Header from '../components/Layout/Header';

describe('Dashboard Component Suite', () => {
  it('renders Header with government title, subtitle, and reviewer indicator', () => {
    render(
      <Header
        isLive={false}
        isMock={true}
        onToggleMock={() => {}}
        onRefresh={() => {}}
        reviewerId="OFFICER-001"
      />
    );

    expect(
      screen.getByText('Urban Land Record Intelligence Dashboard')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Multi-source Geospatial Data Harmonization & Human Verification/i)
    ).toBeInTheDocument();
    expect(screen.getByText('OFFICER-001')).toBeInTheDocument();
    expect(screen.getByText(/Demo \/ Standalone Mode/i)).toBeInTheDocument();
  });

  it('renders all 6 required summary statistics cards with exact computed values', () => {
    const stats = {
      totalParcels: 4,
      totalConflicts: 2,
      pendingReview: 1,
      resolvedConflicts: 1,
      detectedChanges: 2,
      potentiallyUnrecorded: 1,
    };

    render(<DashboardStats stats={stats} />);

    expect(screen.getByText('Total Parcels')).toBeInTheDocument();
    expect(screen.getByText('Conflicts Detected')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
    expect(screen.getByText('Resolved Conflicts')).toBeInTheDocument();
    expect(screen.getByText('Detected Changes')).toBeInTheDocument();
    expect(screen.getByText('Potentially Unrecorded')).toBeInTheDocument();

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getAllByText('2')).toHaveLength(2); // totalConflicts and detectedChanges
    expect(screen.getAllByText('1')).toHaveLength(3); // pendingReview, resolvedConflicts, potentiallyUnrecorded
  });

  it('renders zero counts gracefully when empty stats are passed', () => {
    render(<DashboardStats stats={{}} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(6);
  });
});

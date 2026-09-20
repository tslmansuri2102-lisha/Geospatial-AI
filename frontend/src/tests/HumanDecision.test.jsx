import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DecisionModal from '../components/Verification/DecisionModal';
import HumanVerification from '../components/Verification/HumanVerification';
import AuditPanel from '../components/Audit/AuditPanel';

const mockConflict = {
  conflict_id: 'CONFLICT-001',
  parcel_id: 'P001',
  conflict_type: 'spatial_boundary',
  severity: 'HIGH',
  description: 'Boundary shift detected',
  status: 'AI_PROPOSED',
};

const mockProposal = {
  conflict_id: 'CONFLICT-001',
  recommendation: 'Align to AMC TP-33',
  confidence: 0.87,
  proposed_geometry: { type: 'Polygon', coordinates: [] },
  proposed_attributes: { land_use: 'Residential', municipal_zone: 'R2' },
};

const mockParcel = {
  parcel_id: 'P001',
  attributes: { land_use: 'Residential', municipal_zone: 'R2' },
};

describe('Human Verification & Audit Trail Suite', () => {
  it('renders decision modal with ACCEPT, REJECT, and MODIFY actions', () => {
    render(
      <DecisionModal
        conflict={mockConflict}
        proposal={mockProposal}
        parcel={mockParcel}
        reviewerId="OFFICER-001"
        isOpen={true}
        onClose={() => {}}
        onSubmitDecision={() => {}}
      />
    );

    expect(screen.getByText(/Human Verification • CONFLICT-001/i)).toBeInTheDocument();
    expect(screen.getByText('ACCEPT')).toBeInTheDocument();
    expect(screen.getByText('REJECT')).toBeInTheDocument();
    expect(screen.getByText('MODIFY')).toBeInTheDocument();
  });

  it('reveals editable form when MODIFY action is selected', () => {
    render(
      <DecisionModal
        conflict={mockConflict}
        proposal={mockProposal}
        parcel={mockParcel}
        reviewerId="OFFICER-001"
        isOpen={true}
        onClose={() => {}}
        onSubmitDecision={() => {}}
      />
    );

    const modifyBtn = screen.getByText('MODIFY').closest('button');
    fireEvent.click(modifyBtn);

    expect(screen.getByText(/Adjust Supported Attributes:/i)).toBeInTheDocument();
    expect(screen.getByText(/Land Use Classification:/i)).toBeInTheDocument();
    expect(screen.getByText(/Municipal Zone:/i)).toBeInTheDocument();
  });

  it('proceeds to confirmation step before submitting decision to API', () => {
    const handleSubmit = vi.fn();

    render(
      <DecisionModal
        conflict={mockConflict}
        proposal={mockProposal}
        parcel={mockParcel}
        reviewerId="OFFICER-001"
        isOpen={true}
        onClose={() => {}}
        onSubmitDecision={handleSubmit}
      />
    );

    // Click Review & Confirm
    const reviewBtn = screen.getByText(/Review & Confirm/i);
    fireEvent.click(reviewBtn);

    // Confirmation step is displayed
    expect(screen.getByText(/Confirm Verification Decision/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The harmonized boundary\/attributes proposed by the AI engine will be certified/i)
    ).toBeInTheDocument();

    // Confirm submit
    const confirmBtn = screen.getByText('Confirm ACCEPT');
    fireEvent.click(confirmBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('CONFLICT-001', {
      decision: 'ACCEPT',
      reviewer_id: 'OFFICER-001',
      remarks: '',
    });
  });

  it('renders official audit trail entries with reviewer ID and timestamp', () => {
    const mockAudits = [
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

    render(<AuditPanel audits={mockAudits} />);

    expect(screen.getByText('AUDIT-001')).toBeInTheDocument();
    expect(screen.getByText('OFFICER-001')).toBeInTheDocument();
    expect(screen.getByText('CONFLICT-003')).toBeInTheDocument();
    expect(screen.getByText('P002')).toBeInTheDocument();
    expect(screen.getByText(/AI_PROPOSED → VERIFIED/i)).toBeInTheDocument();
    expect(screen.getByText(/Boundary alignment confirmed/i)).toBeInTheDocument();
  });
});

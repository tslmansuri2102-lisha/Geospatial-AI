import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DashboardStats from './components/Dashboard/DashboardStats';
import GISMapView from './components/Map/GISMapView';
import ParcelSearch from './components/Parcels/ParcelSearch';
import ParcelDetails from './components/Parcels/ParcelDetails';
import SourceComparison from './components/Parcels/SourceComparison';
import ConflictList from './components/Conflicts/ConflictList';
import ConflictDetails from './components/Conflicts/ConflictDetails';
import BuildingChangePanel from './components/Buildings/BuildingChangePanel';
import HumanVerification from './components/Verification/HumanVerification';
import DecisionModal from './components/Verification/DecisionModal';
import AuditPanel from './components/Audit/AuditPanel';
import { api, isBackendOnline, isMockMode, setMockMode } from './services/api';
import { AlertCircle, RefreshCw, Loader2, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [sources, setSources] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [activeProposal, setActiveProposal] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [changes, setChanges] = useState([]);
  const [audits, setAudits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const reviewerId = 'OFFICER-001';

  // Load initial dataset
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const parcelsRes = await api.getParcels();
      const parcelList = parcelsRes.parcels || [];
      setParcels(parcelList);

      // Collect initial conflicts, buildings, changes for all parcels
      let allConflicts = [];
      let allBuildings = [];
      let allChanges = [];

      for (const p of parcelList) {
        try {
          const cRes = await api.getParcelConflicts(p.parcel_id);
          if (cRes.conflicts) allConflicts.push(...cRes.conflicts);
        } catch (e) {}

        try {
          const bRes = await api.getParcelBuildings(p.parcel_id);
          if (bRes.buildings) allBuildings.push(...bRes.buildings);
        } catch (e) {}

        try {
          const chRes = await api.getParcelChanges(p.parcel_id);
          if (chRes.changes) allChanges.push(...chRes.changes);
        } catch (e) {}
      }

      setConflicts(allConflicts);
      setBuildings(allBuildings);
      setChanges(allChanges);
      setAudits(api.getAuditTrail());

      // Set default selected parcel
      if (parcelList.length > 0) {
        handleSelectParcel(parcelList[0]);
      }
      if (allConflicts.length > 0) {
        handleSelectConflict(allConflicts[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with the land record API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle parcel selection
  const handleSelectParcel = async (parcel) => {
    setSelectedParcel(parcel);
    try {
      const srcRes = await api.getParcelSources(parcel.parcel_id);
      setSources(srcRes.sources || []);

      const confRes = await api.getParcelConflicts(parcel.parcel_id);
      if (confRes.conflicts && confRes.conflicts.length > 0) {
        handleSelectConflict(confRes.conflicts[0]);
      }
    } catch (e) {
      // maintain previous
    }
  };

  // Handle conflict selection & fetch AI resolution proposal
  const handleSelectConflict = async (conflict) => {
    setSelectedConflict(conflict);
    try {
      const propRes = await api.resolveConflict(conflict.conflict_id);
      setActiveProposal(propRes);
    } catch (e) {
      setActiveProposal(null);
    }
  };

  // Human decision submission (ACCEPT / REJECT / MODIFY)
  const handleSubmitDecision = async (conflictId, payload) => {
    setIsSubmittingDecision(true);
    setFeedback(null);
    try {
      const res = await api.submitConflictDecision(conflictId, payload);
      setFeedback({
        type: 'success',
        message: res.message || `Decision recorded for ${conflictId}. Audit ID: ${res.audit_id}`,
      });
      setIsDecisionModalOpen(false);

      // Refresh data
      await loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit decision to API.',
      });
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Computed summary metrics
  const stats = useMemo(() => {
    const totalParcels = parcels.length;
    const totalConflicts = conflicts.length;
    const pendingReview = conflicts.filter((c) => c.status !== 'ACCEPTED').length;
    const resolvedConflicts = conflicts.filter((c) => c.status === 'ACCEPTED').length;
    const detectedChanges = changes.length;
    const potentiallyUnrecorded = buildings.filter(
      (b) => b.record_status === 'POTENTIALLY_UNRECORDED'
    ).length;

    return {
      totalParcels,
      totalConflicts,
      pendingReview,
      resolvedConflicts,
      detectedChanges,
      potentiallyUnrecorded,
    };
  }, [parcels, conflicts, changes, buildings]);

  // Filtered parcels for search
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const matchId =
        !searchQuery ||
        p.parcel_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.attributes?.survey_number?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchId && matchStatus;
    });
  }, [parcels, searchQuery, statusFilter]);

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        isLive={isBackendOnline()}
        isMock={isMockMode()}
        onToggleMock={() => {
          setMockMode(!isMockMode());
          loadData();
        }}
        onRefresh={loadData}
        reviewerId={reviewerId}
      />

      <div className="main-body">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

        {/* Main Content Area */}
        <main className="content-area">
          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '12px 16px',
                borderRadius: '6px',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={loadData}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <div className="state-box" style={{ height: '50vh' }}>
              <Loader2 size={36} color="#2563eb" className="animate-spin" />
              <h3>Connecting to Urban Land Record API...</h3>
              <p>Harmonizing multi-source geospatial vectors and querying spatial conflict engine.</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <DashboardStats stats={stats} />

                  <div className="dashboard-grid">
                    {/* GIS Central Map */}
                    <div className="panel-card" style={{ minHeight: '520px' }}>
                      <div className="panel-header">
                        <span className="panel-title">
                          <MapPin size={16} />
                          Interactive Master Cadastral Map (Gota TP-33)
                        </span>
                        {selectedParcel && (
                          <span className="badge badge-gray">
                            Selected: {selectedParcel.parcel_id}
                          </span>
                        )}
                      </div>
                      <div className="panel-body" style={{ padding: 0 }}>
                        <GISMapView
                          parcels={parcels}
                          selectedParcel={selectedParcel}
                          onSelectParcel={handleSelectParcel}
                          buildings={buildings}
                          activeProposal={activeProposal}
                        />
                      </div>
                    </div>

                    {/* Right Details: Parcel & Multi-Source */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="panel-card">
                        <div className="panel-header">
                          <span className="panel-title">Active Parcel Record</span>
                        </div>
                        <div className="panel-body">
                          <ParcelDetails
                            parcel={selectedParcel}
                            sources={sources}
                            conflicts={conflicts.filter((c) => c.parcel_id === selectedParcel?.parcel_id)}
                            buildings={buildings.filter((b) => b.parcel_id === selectedParcel?.parcel_id)}
                            changes={changes.filter((ch) => ch.parcel_id === selectedParcel?.parcel_id)}
                            onSelectConflict={(c) => {
                              handleSelectConflict(c);
                              setActiveTab('conflicts');
                            }}
                          />
                        </div>
                      </div>

                      <div className="panel-card">
                        <div className="panel-header">
                          <span className="panel-title">Multi-Source Cross-Verification</span>
                        </div>
                        <div className="panel-body">
                          <SourceComparison
                            parcel={selectedParcel}
                            sources={sources}
                            proposal={activeProposal}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PARCEL EXPLORER */}
              {activeTab === 'parcels' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ParcelSearch
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    totalCount={parcels.length}
                  />

                  <div className="dashboard-grid">
                    {/* Left: Parcel List */}
                    <div className="panel-card">
                      <div className="panel-header">
                        <span className="panel-title">
                          Parcels ({filteredParcels.length})
                        </span>
                      </div>
                      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredParcels.map((p) => (
                          <div
                            key={p.parcel_id}
                            onClick={() => handleSelectParcel(p)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '6px',
                              border: selectedParcel?.parcel_id === p.parcel_id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                              background: selectedParcel?.parcel_id === p.parcel_id ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <strong>Parcel {p.parcel_id}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Survey: {p.attributes?.survey_number || 'N/A'} &bull; {p.area_sq_m} m²
                              </div>
                            </div>
                            <span className={`badge ${p.status === 'VERIFIED' ? 'badge-verified' : p.status === 'CONFLICT' ? 'badge-conflict' : p.status === 'PENDING_REVIEW' ? 'badge-pending' : 'badge-changed'}`}>
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Selected Parcel Details & Source Comparison */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="panel-card">
                        <div className="panel-header">
                          <span className="panel-title">Parcel Properties</span>
                        </div>
                        <div className="panel-body">
                          <ParcelDetails
                            parcel={selectedParcel}
                            sources={sources}
                            conflicts={conflicts.filter((c) => c.parcel_id === selectedParcel?.parcel_id)}
                            buildings={buildings.filter((b) => b.parcel_id === selectedParcel?.parcel_id)}
                            changes={changes.filter((ch) => ch.parcel_id === selectedParcel?.parcel_id)}
                            onSelectConflict={(c) => {
                              handleSelectConflict(c);
                              setActiveTab('conflicts');
                            }}
                          />
                        </div>
                      </div>

                      <div className="panel-card">
                        <div className="panel-header">
                          <span className="panel-title">Data Sources Verification</span>
                        </div>
                        <div className="panel-body">
                          <SourceComparison
                            parcel={selectedParcel}
                            sources={sources}
                            proposal={activeProposal}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONFLICT REVIEW */}
              {activeTab === 'conflicts' && (
                <div className="dashboard-grid">
                  <div className="panel-card">
                    <div className="panel-header">
                      <span className="panel-title">
                        Detected Conflicts ({conflicts.length})
                      </span>
                    </div>
                    <div className="panel-body">
                      <ConflictList
                        conflicts={conflicts}
                        selectedConflict={selectedConflict}
                        onSelectConflict={handleSelectConflict}
                      />
                    </div>
                  </div>

                  <div className="panel-card">
                    <div className="panel-header">
                      <span className="panel-title">Conflict Analysis &amp; AI Proposal</span>
                    </div>
                    <div className="panel-body">
                      <ConflictDetails
                        conflict={selectedConflict}
                        proposal={activeProposal}
                        parcel={selectedParcel}
                        onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BUILDING & CHANGE DETECTION */}
              {activeTab === 'buildings' && (
                <BuildingChangePanel
                  buildings={buildings}
                  changes={changes}
                  onSelectParcel={handleSelectParcel}
                />
              )}

              {/* TAB 5: HUMAN VERIFICATION */}
              {activeTab === 'verification' && (
                <HumanVerification
                  conflicts={conflicts}
                  selectedConflict={selectedConflict}
                  onSelectConflict={handleSelectConflict}
                  proposal={activeProposal}
                  parcel={selectedParcel}
                  onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
                  feedback={feedback}
                />
              )}

              {/* TAB 6: AUDIT TRAIL */}
              {activeTab === 'audit' && <AuditPanel audits={audits} />}
            </>
          )}
        </main>
      </div>

      {/* Decision Modal for Accept / Reject / Modify */}
      <DecisionModal
        conflict={selectedConflict}
        proposal={activeProposal}
        parcel={selectedParcel}
        reviewerId={reviewerId}
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onSubmitDecision={handleSubmitDecision}
        isSubmitting={isSubmittingDecision}
      />
    </div>
  );
}

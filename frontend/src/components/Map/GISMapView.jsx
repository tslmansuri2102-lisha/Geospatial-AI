import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';
import { Eye, Layers, Compass } from 'lucide-react';

// Register EPSG:32643 (UTM Zone 43N - Ahmedabad region)
proj4.defs('EPSG:32643', '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs');

function normalizeCoordinates(coords) {
  if (!Array.isArray(coords)) return coords;
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    const [x, y] = coords;
    // If coords are in projected UTM meters (e.g. > 1000)
    if (Math.abs(x) > 180 || Math.abs(y) > 90) {
      try {
        const [lon, lat] = proj4('EPSG:32643', 'EPSG:4326', [x, y]);
        return [lon, lat];
      } catch (e) {
        return coords;
      }
    }
    return [x, y];
  }
  return coords.map(normalizeCoordinates);
}

function normalizeGeoJSONGeometry(geom) {
  if (!geom || !geom.coordinates) return null;
  return {
    ...geom,
    coordinates: normalizeCoordinates(geom.coordinates),
  };
}

function MapBoundsController({ selectedParcel, allParcels }) {
  const map = useMap();

  useEffect(() => {
    if (selectedParcel && selectedParcel.geometry) {
      const normGeom = normalizeGeoJSONGeometry(selectedParcel.geometry);
      if (normGeom) {
        try {
          const layer = L.geoJSON(normGeom);
          const bounds = layer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
          }
        } catch (e) {
          // ignore invalid geometry bounds
        }
      }
    }
  }, [selectedParcel, map]);

  return null;
}

export default function GISMapView({
  parcels = [],
  selectedParcel = null,
  onSelectParcel = () => {},
  buildings = [],
  activeProposal = null,
}) {
  const [showParcels, setShowParcels] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showProposal, setShowProposal] = useState(true);

  // Default center for Ahmedabad / Gota TP-33 study area
  const defaultCenter = [22.7005, 72.6010];
  const defaultZoom = 17;

  // Parcel styling based on official status in docs/data-model.md
  const getParcelStyle = (feature) => {
    const isSelected = selectedParcel && selectedParcel.parcel_id === feature.properties.parcel_id;
    const status = feature.properties.status;

    let color = '#3b82f6';
    let fillColor = '#3b82f6';

    switch (status) {
      case 'VERIFIED':
        color = '#10b981';
        fillColor = '#10b981';
        break;
      case 'PENDING_REVIEW':
        color = '#f59e0b';
        fillColor = '#f59e0b';
        break;
      case 'CONFLICT':
        color = '#ef4444';
        fillColor = '#ef4444';
        break;
      case 'CHANGED':
        color = '#8b5cf6';
        fillColor = '#8b5cf6';
        break;
      default:
        color = '#64748b';
        fillColor = '#64748b';
    }

    return {
      color: isSelected ? '#1e3a8a' : color,
      weight: isSelected ? 4 : 2,
      dashArray: isSelected ? '4, 4' : undefined,
      fillColor,
      fillOpacity: isSelected ? 0.6 : 0.35,
    };
  };

  // Convert parcel list to GeoJSON FeatureCollection
  const parcelGeoJson = {
    type: 'FeatureCollection',
    features: parcels
      .filter((p) => p.geometry)
      .map((p) => ({
        type: 'Feature',
        id: p.parcel_id,
        properties: {
          parcel_id: p.parcel_id,
          status: p.status,
          area_sq_m: p.area_sq_m,
          land_use: p.attributes?.land_use || 'Unknown',
          confidence: p.confidence,
        },
        geometry: normalizeGeoJSONGeometry(p.geometry),
      })),
  };

  // Building footprints GeoJSON
  const buildingGeoJson = {
    type: 'FeatureCollection',
    features: buildings
      .filter((b) => b.geometry)
      .map((b) => ({
        type: 'Feature',
        id: b.building_id,
        properties: {
          building_id: b.building_id,
          parcel_id: b.parcel_id,
          area_sq_m: b.area_sq_m,
          record_status: b.record_status,
          detection_source: b.detection_source,
        },
        geometry: normalizeGeoJSONGeometry(b.geometry),
      })),
  };

  // AI Proposal boundary
  const proposalGeoJson = activeProposal?.proposed_geometry
    ? {
        type: 'Feature',
        properties: {
          recommendation: activeProposal.recommendation,
          confidence: activeProposal.confidence,
        },
        geometry: normalizeGeoJSONGeometry(activeProposal.proposed_geometry),
      }
    : null;

  return (
    <div className="map-wrapper" style={{ height: '100%', minHeight: '480px' }}>
      {/* Map Layer Controls Overlay */}
      <div className="map-controls-overlay">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <Layers size={14} />
          <span>GIS Layers</span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showParcels}
            onChange={(e) => setShowParcels(e.target.checked)}
          />
          <span>Parcels ({parcels.length})</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showBuildings}
            onChange={(e) => setShowBuildings(e.target.checked)}
          />
          <span>Buildings ({buildings.length})</span>
        </label>
        {activeProposal && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showProposal}
              onChange={(e) => setShowProposal(e.target.checked)}
            />
            <span style={{ color: '#0284c7', fontWeight: 600 }}>AI Proposal Boundary</span>
          </label>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="map-container"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsController selectedParcel={selectedParcel} allParcels={parcels} />

        {/* Parcels Layer */}
        {showParcels && (
          <GeoJSON
            key={`parcels-${parcels.map((p) => `${p.parcel_id}-${p.status}`).join('_')}-${selectedParcel?.parcel_id}`}
            data={parcelGeoJson}
            style={getParcelStyle}
            onEachFeature={(feature, layer) => {
              const props = feature.properties;
              layer.bindTooltip(
                `<strong>Parcel ${props.parcel_id}</strong><br/>Status: ${props.status}<br/>Area: ${props.area_sq_m} m²`,
                { sticky: true }
              );
              layer.on({
                click: () => {
                  const p = parcels.find((item) => item.parcel_id === props.parcel_id);
                  if (p) onSelectParcel(p);
                },
              });
            }}
          />
        )}

        {/* Buildings Layer */}
        {showBuildings && buildings.length > 0 && (
          <GeoJSON
            key={`buildings-${buildings.map((b) => b.building_id).join('_')}`}
            data={buildingGeoJson}
            style={(feature) => ({
              color: feature.properties.record_status === 'POTENTIALLY_UNRECORDED' ? '#ea580c' : '#0284c7',
              weight: 2,
              fillColor: feature.properties.record_status === 'POTENTIALLY_UNRECORDED' ? '#f97316' : '#38bdf8',
              fillOpacity: 0.5,
            })}
            onEachFeature={(feature, layer) => {
              const props = feature.properties;
              layer.bindTooltip(
                `<strong>Building ${props.building_id}</strong><br/>Status: ${props.record_status}<br/>Area: ${props.area_sq_m} m²`,
                { sticky: true }
              );
            }}
          />
        )}

        {/* AI Proposal Boundary Layer */}
        {showProposal && proposalGeoJson && (
          <GeoJSON
            key={`proposal-${activeProposal.conflict_id}`}
            data={proposalGeoJson}
            style={{
              color: '#059669',
              weight: 3,
              dashArray: '6, 6',
              fillColor: '#10b981',
              fillOpacity: 0.25,
            }}
            onEachFeature={(feature, layer) => {
              layer.bindTooltip(
                `<strong>AI Proposal</strong><br/>Confidence: ${(activeProposal.confidence * 100).toFixed(0)}%<br/>${activeProposal.recommendation}`,
                { sticky: true }
              );
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

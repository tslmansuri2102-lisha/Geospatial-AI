# SIH PS13 - Data Model

## 1. Purpose

This document defines the common data model used by all modules of the SIH PS13 Urban Land Intelligence system.

All team members must use the same field names, ID formats, geometry conventions and status values.

---

## 2. Core Entities

The system contains these entities:

1. Parcel
2. Source Record
3. Conflict
4. AI Proposal
5. Building
6. Change Event
7. Human Decision
8. Audit Record

---

# 3. Parcel

A Parcel represents a land parcel/cadastral unit in the harmonized master dataset.

| Field | Type | Description |
|---|---|---|
| parcel_id | string | Unique parcel identifier |
| geometry | Polygon/MultiPolygon | Parcel boundary |
| area_sq_m | number | Parcel area in square metres |
| attributes | object | Standardized parcel attributes |
| sources | array | Source records contributing to the parcel |
| confidence | number | Overall confidence from 0 to 1 |
| status | enum | Current parcel status |
| last_updated | datetime | Last update timestamp |

Example:

```json
{
  "parcel_id": "P001",
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  },
  "area_sq_m": 1194.2,
  "attributes": {
    "land_use": "Residential",
    "survey_number": "SN-102",
    "property_id": "PROP-783",
    "municipal_zone": "R2"
  },
  "confidence": 0.91,
  "status": "PENDING_REVIEW"
}

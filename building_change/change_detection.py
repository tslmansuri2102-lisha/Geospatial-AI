def detect_new_removed_buildings(previous_buildings, current_buildings):
    """Detect buildings that are new or no longer present."""
    previous_ids = set(previous_buildings)
    current_ids = set(current_buildings)

    new_buildings = sorted(current_ids - previous_ids)
    removed_buildings = sorted(previous_ids - current_ids)

    return new_buildings, removed_buildings
def detect_building_expansions(
    previous_buildings,
    current_buildings,
    threshold=0.10,
):
    """Detect buildings whose area increased beyond the given percentage threshold."""
    expansions = []

    for building_id in previous_buildings.keys() & current_buildings.keys():
        previous_area = previous_buildings[building_id].get("area_sq_m")
        current_area = current_buildings[building_id].get("area_sq_m")

        if previous_area is None or current_area is None:
            continue

        if previous_area <= 0:
            continue

        increase_ratio = (current_area - previous_area) / previous_area

        if increase_ratio >= threshold:
            expansions.append(
                {
                    "building_id": building_id,
                    "previous_area_sq_m": previous_area,
                    "current_area_sq_m": current_area,
                    "increase_ratio": round(increase_ratio, 4),
                }
            )

    return expansions
from datetime import date


def create_change_event(
    change_id,
    parcel_id,
    change_type,
    previous_value,
    current_value,
    confidence,
):
    """Create a ChangeEvent-compatible record for human verification."""
    return {
        "change_id": change_id,
        "parcel_id": parcel_id,
        "change_type": change_type,
        "previous_value": previous_value,
        "current_value": current_value,
        "detected_on": date.today().isoformat(),
        "confidence": max(0.0, min(1.0, confidence)),
        "verification_required": True,
    }
def build_change_explanation(change_type, confidence):
    """Return a human-readable explanation for a detected change."""
    explanations = {
        "new_building": "Building is present in the current snapshot but absent from the previous snapshot.",
        "removed_building": "Building is present in the previous snapshot but absent from the current snapshot.",
        "building_expansion": "Building exists in both snapshots and its recorded area increased beyond the configured threshold.",
    }

    return {
        "change_type": change_type,
        "reason": explanations.get(
            change_type,
            "Change detected from comparison of building snapshots.",
        ),
        "confidence": confidence,
    }
import json
from pathlib import Path


def load_building_snapshot(geojson_path):
    """Load a GeoJSON building snapshot indexed by building ID."""
    with Path(geojson_path).open("r", encoding="utf-8") as file:
        data = json.load(file)

    buildings = {}

    for feature in data.get("features", []):
        properties = feature.get("properties") or {}

        building_id = (
            properties.get("building_id")
            or properties.get("id")
            or properties.get("@id")
        )

        if not building_id:
            continue

        if building_id not in buildings:
            buildings[building_id] = {
                "building_id": building_id,
                "parcel_ids": [],
                "area_sq_m": properties.get("area_sq_m"),
                "detection_source": properties.get(
                    "detection_source",
                    "OSM",
                ),
                "detection_date": properties.get("detection_date"),
            }

        parcel_id = properties.get("parcel_id")

        if parcel_id and parcel_id not in buildings[building_id]["parcel_ids"]:
            buildings[building_id]["parcel_ids"].append(parcel_id)

    return buildings
def compare_building_snapshots(previous_buildings, current_buildings):
    """Compare two building snapshots and return detected changes."""
    new_ids, removed_ids = detect_new_removed_buildings(
        previous_buildings,
        current_buildings,
    )

    expansions = detect_building_expansions(
        previous_buildings,
        current_buildings,
    )

    return {
        "new_buildings": new_ids,
        "removed_buildings": removed_ids,
        "building_expansions": expansions,
    }
def build_change_events(comparison_result, building_parcel_relations, confidence=0.90):
    """Convert detected building changes into ChangeEvent-compatible records."""
    events = []

    for building_id in comparison_result["new_buildings"]:
        for parcel_id in building_parcel_relations.get(building_id, []):
            events.append(
                create_change_event(
                    change_id=f"new-{building_id}-{parcel_id}",
                    parcel_id=parcel_id,
                    change_type="new_building",
                    previous_value=None,
                    current_value=building_id,
                    confidence=confidence,
                )
            )

    for building_id in comparison_result["removed_buildings"]:
        for parcel_id in building_parcel_relations.get(building_id, []):
            events.append(
                create_change_event(
                    change_id=f"removed-{building_id}-{parcel_id}",
                    parcel_id=parcel_id,
                    change_type="removed_building",
                    previous_value=building_id,
                    current_value=None,
                    confidence=confidence,
                )
            )

    for expansion in comparison_result["building_expansions"]:
        building_id = expansion["building_id"]

        for parcel_id in building_parcel_relations.get(building_id, []):
            events.append(
                create_change_event(
                    change_id=f"expansion-{building_id}-{parcel_id}",
                    parcel_id=parcel_id,
                    change_type="building_expansion",
                    previous_value=expansion["previous_area_sq_m"],
                    current_value=expansion["current_area_sq_m"],
                    confidence=confidence,
                )
            )

    return events
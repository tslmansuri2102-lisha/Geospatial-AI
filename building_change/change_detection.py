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
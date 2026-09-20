from pathlib import Path
import json
import pandas as pd
import geopandas as gpd


SPATIAL_RESULTS = Path("data/standardized/spatial_conflict_results.csv")
PARCEL_FILE = Path("data/standardized/gota_tp33_master_parcels.geojson")
SOURCE_FILE = Path("data/standardized/gota_tp33_parcel_sources.csv")

OUTPUT_CSV = Path("data/standardized/confidence_results.csv")
OUTPUT_JSON = Path("data/standardized/unified_conflict_proposals.json")


# Prototype weights from the Member 2 design.
# These are configurable project weights, NOT official government weights.
WEIGHTS = {
    "spatial_accuracy": 0.30,
    "recency": 0.20,
    "source_quality": 0.20,
    "gnss_ground_truth": 0.15,
    "historical_consistency": 0.15,
}


def source_quality_score(source_type, source_status):
    """
    Prototype source-quality score.
    This is deliberately configurable and must not be interpreted
    as an official authority ranking.
    """
    if str(source_status).lower() == "verified":
        return 1.0

    if str(source_status).lower() in {"validated", "approved"}:
        return 0.9

    if str(source_status).lower() in {"provisional", "preliminary"}:
        return 0.6

    return 0.5


def calculate_confidence(row, source_row):
    """
    Calculate confidence only from evidence that actually exists.

    Missing recency, GNSS/ground-truth, and historical evidence are
    excluded and the remaining weights are renormalized.
    """

    available = {}

    spatial = pd.to_numeric(
        row.get("spatial_score"), errors="coerce"
    )

    if pd.notna(spatial):
        available["spatial_accuracy"] = float(
            max(0.0, min(1.0, spatial))
        )

    source_quality = source_quality_score(
        source_row.get("source_type", ""),
        source_row.get("source_status", ""),
    )
    available["source_quality"] = source_quality

    # survey_date is currently blank in the supplied source metadata.
    survey_date = source_row.get("survey_date")
    if pd.notna(survey_date) and str(survey_date).strip():
        # We intentionally do not invent a recency score.
        # A future implementation can calculate it from a known
        # reference date/window.
        recency_available = False
    else:
        recency_available = False

    # No GNSS/ground-truth dataset exists in the current evidence set.
    gnss_available = False

    # No historical parcel version dataset exists in the current evidence set.
    historical_available = False

    weighted_total = 0.0
    weight_total = 0.0

    for key, value in available.items():
        weight = WEIGHTS[key]
        weighted_total += weight * value
        weight_total += weight

    confidence = weighted_total / weight_total if weight_total else 0.0

    return {
        "confidence": round(confidence, 4),
        "recency_available": recency_available,
        "gnss_ground_truth_available": gnss_available,
        "historical_consistency_available": historical_available,
        "available_confidence_factors": ",".join(available.keys()),
    }


def build_reasons(row, source_row, confidence_info):
    reasons = []

    resolution = str(row.get("resolution", ""))

    if resolution in {"CONSISTENT", "CONSISTENT_LOW_CONFIDENCE"}:
        reasons.append(
            "Spatially inferred parcel agrees with the building's source parcel relationship"
        )
    elif resolution in {"WEAK_MATCH", "UNRESOLVED"}:
        reasons.append(
            "Spatial evidence for the inferred parcel is weak"
        )
    elif resolution in {"CONFLICT", "POSSIBLE_CONFLICT"}:
        reasons.append(
            "Spatially inferred parcel differs from the source parcel relationship"
        )

    score = pd.to_numeric(row.get("spatial_score"), errors="coerce")
    if pd.notna(score):
        reasons.append(
            f"Spatial score is {float(score):.3f}"
        )

    status = str(source_row.get("source_status", "")).strip()
    source_type = str(source_row.get("source_type", "")).strip()

    if status:
        reasons.append(
            f"Source status is '{status}'"
        )

    if source_type:
        reasons.append(
            f"Source type is '{source_type}'"
        )

    if not confidence_info["recency_available"]:
        reasons.append(
            "Recency unavailable because survey date is not provided"
        )

    if not confidence_info["gnss_ground_truth_available"]:
        reasons.append(
            "GNSS/ground-truth agreement unavailable in current dataset"
        )

    if not confidence_info["historical_consistency_available"]:
        reasons.append(
            "Historical consistency unavailable in current dataset"
        )

    return reasons


def main():
    print("\n========== MEMBER 2 CONFIDENCE ENGINE ==========")

    results = pd.read_csv(SPATIAL_RESULTS)
    parcels = gpd.read_file(PARCEL_FILE)
    sources = pd.read_csv(SOURCE_FILE)

    source_lookup = (
        sources.drop_duplicates("parcel_id")
        .set_index("parcel_id")
        .to_dict("index")
    )

    parcel_lookup = (
        parcels.drop_duplicates("parcel_id")
        .set_index("parcel_id")
    )

    output_rows = []
    proposals = []

    for _, row in results.iterrows():
        inferred_id = str(row.get("inferred_parcel_id", ""))

        source_id = str(row.get("source_parcel_id", ""))
        source_ids = str(row.get("source_parcel_ids", ""))

        source_row = source_lookup.get(
            inferred_id,
            source_lookup.get(source_id, {}),
        )

        confidence_info = calculate_confidence(
            row,
            source_row,
        )

        inferred_parcel = parcel_lookup.get(inferred_id)

        if inferred_parcel is not None:
            proposed_area = pd.to_numeric(
                inferred_parcel.get("area_sq_m"),
                errors="coerce",
            )
        else:
            proposed_area = float("nan")

        if inferred_id and inferred_id != "nan" and inferred_parcel is not None:
            preferred_geometry = "cadastral_geometry"
        else:
            preferred_geometry = "unresolved"

        reasons = build_reasons(
            row,
            source_row,
            confidence_info,
        )

        output = row.to_dict()

        output.update({
            "proposed_area": (
                round(float(proposed_area), 3)
                if pd.notna(proposed_area)
                else None
            ),
            "preferred_geometry": preferred_geometry,
            "confidence": confidence_info["confidence"],
            "recency_available": confidence_info["recency_available"],
            "gnss_ground_truth_available": confidence_info[
                "gnss_ground_truth_available"
            ],
            "historical_consistency_available": confidence_info[
                "historical_consistency_available"
            ],
            "available_confidence_factors": confidence_info[
                "available_confidence_factors"
            ],
            "reason": " | ".join(reasons),
        })

        output_rows.append(output)

        proposals.append({
            "building_id": row.get("building_id"),
            "source_parcel_id": row.get("source_parcel_id"),
            "source_parcel_ids": source_ids,
            "inferred_parcel_id": (
                inferred_id
                if inferred_id != "nan"
                else None
            ),
            "proposed_area": (
                round(float(proposed_area), 3)
                if pd.notna(proposed_area)
                else None
            ),
            "preferred_geometry": preferred_geometry,
            "confidence": confidence_info["confidence"],
            "resolution": row.get("resolution"),
            "reason": reasons,
        })

    output_df = pd.DataFrame(output_rows)
    output_df.to_csv(OUTPUT_CSV, index=False)

    with OUTPUT_JSON.open("w", encoding="utf-8") as f:
        json.dump(
            proposals,
            f,
            indent=2,
            ensure_ascii=False,
        )

    print("\n========== CONFIDENCE SUMMARY ==========")
    print(f"Input spatial results: {len(results)}")
    print(f"Confidence results: {len(output_df)}")
    print(
        "Average confidence:",
        round(float(output_df["confidence"].mean()), 4),
    )
    print(
        "Confidence range:",
        round(float(output_df["confidence"].min()), 4),
        "-",
        round(float(output_df["confidence"].max()), 4),
    )

    print("\nUnavailable evidence handled explicitly:")
    print("- Recency: unavailable")
    print("- GNSS/ground truth: unavailable")
    print("- Historical consistency: unavailable")

    print("\nOutputs:")
    print(OUTPUT_CSV)
    print(OUTPUT_JSON)

    print("\n========== CONFIDENCE ENGINE COMPLETE ==========")


if __name__ == "__main__":
    main()

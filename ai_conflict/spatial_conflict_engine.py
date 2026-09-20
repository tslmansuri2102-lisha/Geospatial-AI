import geopandas as gpd
import pandas as pd
from pathlib import Path


# =========================================================
# CONFIGURATION
# =========================================================

PARCEL_FILE = Path(
    "data/standardized/standardized_cadastral.geojson"
)

BUILDING_FILE = Path(
    "data/standardized/gota_tp33_buildings.geojson"
)

OUTPUT_FILE = Path(
    "data/standardized/spatial_conflict_results.csv"
)

TARGET_CRS = "EPSG:32643"


# =========================================================
# BUILDING DEDUPLICATION / NORMALIZATION
# =========================================================

def normalize_buildings(buildings):
    """
    Convert the raw building-parcel relationship into one
    processing record per unique building_id.

    Important:
    Multiple rows with the same building_id are NOT treated
    as multiple building geometries.

    Their parcel_ids are retained as a list because one
    building may legitimately be associated with multiple
    parcels.

    Example:

        building_id = way/1341558045
        raw rows = 4
        parcel_ids = [A, B, C, D]
        geometry = one unique geometry

    Returns
    -------
    GeoDataFrame
        One row per unique building_id.
    """

    if "building_id" not in buildings.columns:
        raise ValueError(
            "Building dataset does not contain 'building_id'."
        )

    if "parcel_id" not in buildings.columns:
        raise ValueError(
            "Building dataset does not contain 'parcel_id'."
        )

    normalized_records = []

    for building_id, group in buildings.groupby(
        "building_id",
        sort=False,
        dropna=False
    ):

        # -------------------------------------------------
        # Remove null parcel IDs and preserve unique IDs
        # -------------------------------------------------

        source_parcel_ids = []

        for value in group["parcel_id"]:
            if pd.notna(value):
                value = str(value)

                if value not in source_parcel_ids:
                    source_parcel_ids.append(value)

        # -------------------------------------------------
        # Geometry verification
        # -------------------------------------------------

        geometry_values = group.geometry[
            group.geometry.notna()
        ]

        unique_geometries = []

        for geometry in geometry_values:

            if geometry is None or geometry.is_empty:
                continue

            geometry_wkb = geometry.wkb

            if not any(
                geometry_wkb == existing.wkb
                for existing in unique_geometries
            ):
                unique_geometries.append(geometry)

        # -------------------------------------------------
        # We expect one unique geometry for duplicated
        # building IDs based on our verification.
        #
        # If multiple geometries somehow appear later,
        # keep the first and report it rather than silently
        # creating multiple building records.
        # -------------------------------------------------

        if not unique_geometries:

            geometry = None

        else:

            geometry = unique_geometries[0]

        if len(unique_geometries) > 1:

            print(
                f"WARNING: building_id {building_id} "
                f"has {len(unique_geometries)} unique geometries. "
                f"Using the first geometry."
            )

        # -------------------------------------------------
        # Compatibility source parcel
        #
        # Keep the first source parcel as the legacy field.
        # The complete relationship is stored separately.
        # -------------------------------------------------

        source_parcel_id = (
            source_parcel_ids[0]
            if source_parcel_ids
            else None
        )

        normalized_records.append({
            "building_id": building_id,
            "source_parcel_id": source_parcel_id,
            "source_parcel_ids": source_parcel_ids,
            "source_parcel_count": len(source_parcel_ids),
            "raw_row_count": len(group),
            "unique_geometry_count": len(unique_geometries),
            "geometry": geometry,
        })

    normalized = gpd.GeoDataFrame(
        normalized_records,
        geometry="geometry",
        crs=buildings.crs,
    )

    return normalized


# =========================================================
# SPATIAL CANDIDATE SEARCH
# =========================================================

def find_candidate_parcels(building, parcels):
    """
    Find parcels whose geometry intersects the building's
    bounding box.

    The bounding-box test is used only as a candidate filter.
    Actual geometric intersection is calculated later.
    """

    if building.geometry is None:
        return parcels.iloc[0:0]

    if building.geometry.is_empty:
        return parcels.iloc[0:0]

    return parcels[
        parcels.geometry.intersects(
            building.geometry.envelope
        )
    ]


# =========================================================
# SPATIAL METRICS
# =========================================================

def calculate_spatial_metrics(parcel, building):

    parcel_geometry = parcel.geometry
    building_geometry = building.geometry

    if (
        parcel_geometry is None
        or building_geometry is None
        or parcel_geometry.is_empty
        or building_geometry.is_empty
    ):

        return {
            "intersection_area_sq_m": 0.0,
            "parcel_coverage": 0.0,
            "building_coverage": 0.0,
            "iou": 0.0,
            "centroid_distance_m": None,
        }

    intersection = parcel_geometry.intersection(
        building_geometry
    )

    intersection_area = intersection.area

    parcel_area = parcel_geometry.area
    building_area = building_geometry.area

    parcel_coverage = (
        intersection_area / parcel_area
        if parcel_area > 0
        else 0.0
    )

    building_coverage = (
        intersection_area / building_area
        if building_area > 0
        else 0.0
    )

    union_area = (
        parcel_area
        + building_area
        - intersection_area
    )

    iou = (
        intersection_area / union_area
        if union_area > 0
        else 0.0
    )

    centroid_distance = (
        parcel_geometry.centroid.distance(
            building_geometry.centroid
        )
    )

    return {
        "intersection_area_sq_m": intersection_area,
        "parcel_coverage": parcel_coverage,
        "building_coverage": building_coverage,
        "iou": iou,
        "centroid_distance_m": centroid_distance,
    }


# =========================================================
# SPATIAL SCORE
# =========================================================

def calculate_spatial_score(metrics):
    """
    Transparent spatial evidence score.

    Components:
        50% building coverage
        20% parcel coverage
        30% centroid-distance score

    IoU is retained as a diagnostic metric but is not included in
    the score because it is strongly redundant with parcel coverage
    for the current dataset.

    Result is bounded to [0, 1].
    """

    parcel_coverage = metrics["parcel_coverage"]
    building_coverage = metrics["building_coverage"]
    distance = metrics["centroid_distance_m"]

    if distance is None:
        distance_score = 0.0
    else:
        distance_score = max(
            0.0,
            1.0 - (distance / 50.0)
        )

    score = (
        0.50 * building_coverage
        + 0.20 * parcel_coverage
        + 0.30 * distance_score
    )

    return max(
        0.0,
        min(1.0, score)
    )


# =========================================================
# CONFLICT RESOLUTION
# =========================================================

def resolve_conflict(
    source_parcel_ids,
    inferred_parcel_id,
    best_score,
    second_score=None,
):
    """
    Compare spatial inference against ALL source parcels
    associated with the building.

    This is the important correction.

    A building may have:

        source parcels = [P1, P2, P3]

    If spatial inference returns P2, that is NOT a conflict.

    The previous engine compared against only one parcel ID,
    which could incorrectly classify such a case as a conflict.
    """

    if inferred_parcel_id is None:

        return "NO_SPATIAL_MATCH"

    inferred_parcel_id = str(
        inferred_parcel_id
    )

    source_parcel_ids = [
        str(x)
        for x in source_parcel_ids
        if x is not None
    ]

    same_parcel = (
        inferred_parcel_id
        in source_parcel_ids
    )

    # -----------------------------------------------------
    # Strong spatial evidence
    # -----------------------------------------------------

    if best_score >= 0.65:

        if same_parcel:
            return "CONSISTENT"

        return "CONFLICT"

    # -----------------------------------------------------
    # Moderate evidence
    # -----------------------------------------------------

    if best_score >= 0.35:

        if second_score is not None:

            margin = (
                best_score
                - second_score
            )

            if margin < 0.05:
                return "AMBIGUOUS"

        if same_parcel:
            return "CONSISTENT_LOW_CONFIDENCE"

        return "POSSIBLE_CONFLICT"

    # -----------------------------------------------------
    # Weak evidence
    # -----------------------------------------------------

    if same_parcel:
        return "WEAK_MATCH"

    return "UNRESOLVED"


# =========================================================
# MAIN ENGINE
# =========================================================

def run_conflict_engine():

    print(
        "\n========== MEMBER 2 SPATIAL CONFLICT ENGINE =========="
    )

    # -----------------------------------------------------
    # LOAD PARCELS
    # -----------------------------------------------------

    print("\nLoading CTPVD parcels...")

    parcels = gpd.read_file(
        PARCEL_FILE
    )

    print(
        f"Parcels loaded: {len(parcels)}"
    )

    if "parcel_id" not in parcels.columns:

        raise ValueError(
            "Cadastral dataset does not contain "
            "'parcel_id'."
        )

    # -----------------------------------------------------
    # LOAD BUILDINGS
    # -----------------------------------------------------

    print("\nLoading buildings...")

    buildings = gpd.read_file(
        BUILDING_FILE
    )

    print(
        f"Raw building rows loaded: {len(buildings)}"
    )

    # -----------------------------------------------------
    # CRS
    # -----------------------------------------------------

    if parcels.crs is None:

        print(
            f"WARNING: Parcel CRS missing. "
            f"Assigning {TARGET_CRS}."
        )

        parcels = parcels.set_crs(
            TARGET_CRS
        )

    if buildings.crs is None:

        print(
            f"WARNING: Building CRS missing. "
            f"Assigning {TARGET_CRS}."
        )

        buildings = buildings.set_crs(
            TARGET_CRS
        )

    if parcels.crs != buildings.crs:

        print(
            "\nReprojecting buildings to parcel CRS..."
        )

        buildings = buildings.to_crs(
            parcels.crs
        )

    print(
        f"\nAnalysis CRS: {parcels.crs}"
    )

    # -----------------------------------------------------
    # NORMALIZE / DEDUPLICATE BUILDINGS
    # -----------------------------------------------------

    print(
        "\nNormalizing building records..."
    )

    buildings = normalize_buildings(
        buildings
    )

    print(
        f"Unique buildings for spatial analysis: "
        f"{len(buildings)}"
    )

    raw_rows = sum(
        buildings["raw_row_count"]
    )

    print(
        f"Raw rows represented: {raw_rows}"
    )

    duplicate_rows_removed = (
        raw_rows
        - len(buildings)
    )

    print(
        f"Duplicate relationship rows collapsed: "
        f"{duplicate_rows_removed}"
    )

    # -----------------------------------------------------
    # SPATIAL INDEX
    # -----------------------------------------------------

    print(
        "\nBuilding parcel spatial index..."
    )

    parcels.sindex

    # -----------------------------------------------------
    # PROCESS BUILDINGS
    # -----------------------------------------------------

    results = []

    total_buildings = len(
        buildings
    )

    print(
        f"\nProcessing {total_buildings} "
        f"unique buildings..."
    )

    for position, (_, building) in enumerate(
        buildings.iterrows(),
        start=1
    ):

        building_id = building[
            "building_id"
        ]

        source_parcel_ids = building[
            "source_parcel_ids"
        ]

        source_parcel_id = building[
            "source_parcel_id"
        ]

        source_parcel_count = building[
            "source_parcel_count"
        ]

        raw_row_count = building[
            "raw_row_count"
        ]

        unique_geometry_count = building[
            "unique_geometry_count"
        ]

        # -------------------------------------------------
        # Progress
        # -------------------------------------------------

        if (
            position == 1
            or position % 25 == 0
            or position == total_buildings
        ):

            print(
                f"  Processing building "
                f"{position}/{total_buildings}"
            )

        # -------------------------------------------------
        # INVALID GEOMETRY
        # -------------------------------------------------

        if (
            building.geometry is None
            or building.geometry.is_empty
        ):

            results.append({

                "building_id":
                    building_id,

                "source_parcel_id":
                    source_parcel_id,

                "source_parcel_ids":
                    "|".join(
                        source_parcel_ids
                    ),

                "source_parcel_count":
                    source_parcel_count,

                "raw_row_count":
                    raw_row_count,

                "unique_geometry_count":
                    unique_geometry_count,

                "inferred_parcel_id":
                    None,

                "candidate_count":
                    0,

                "intersection_area_sq_m":
                    0.0,

                "parcel_coverage":
                    0.0,

                "building_coverage":
                    0.0,

                "iou":
                    0.0,

                "centroid_distance_m":
                    None,

                "spatial_score":
                    0.0,

                "score_margin":
                    None,

                "resolution":
                    "INVALID_BUILDING_GEOMETRY",
            })

            continue

        # -------------------------------------------------
        # FIND CANDIDATES
        # -------------------------------------------------

        candidates = find_candidate_parcels(
            building,
            parcels
        )

        candidate_results = []

        # -------------------------------------------------
        # CALCULATE METRICS
        # -------------------------------------------------

        for _, parcel in candidates.iterrows():

            parcel_id = str(
                parcel["parcel_id"]
            )

            metrics = calculate_spatial_metrics(
                parcel,
                building
            )

            spatial_score = (
                calculate_spatial_score(
                    metrics
                )
            )

            candidate_results.append({

                "parcel_id":
                    parcel_id,

                "metrics":
                    metrics,

                "score":
                    spatial_score,
            })

        # -------------------------------------------------
        # NO CANDIDATE
        # -------------------------------------------------

        if not candidate_results:

            results.append({

                "building_id":
                    building_id,

                "source_parcel_id":
                    source_parcel_id,

                "source_parcel_ids":
                    "|".join(
                        source_parcel_ids
                    ),

                "source_parcel_count":
                    source_parcel_count,

                "raw_row_count":
                    raw_row_count,

                "unique_geometry_count":
                    unique_geometry_count,

                "inferred_parcel_id":
                    None,

                "candidate_count":
                    0,

                "intersection_area_sq_m":
                    0.0,

                "parcel_coverage":
                    0.0,

                "building_coverage":
                    0.0,

                "iou":
                    0.0,

                "centroid_distance_m":
                    None,

                "spatial_score":
                    0.0,

                "score_margin":
                    None,

                "resolution":
                    "NO_SPATIAL_MATCH",
            })

            continue

        # -------------------------------------------------
        # SORT BY SPATIAL SCORE
        # -------------------------------------------------

        candidate_results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        best = candidate_results[0]

        second_score = None

        if len(candidate_results) > 1:

            second_score = (
                candidate_results[1]["score"]
            )

        score_margin = None

        if second_score is not None:

            score_margin = (
                best["score"]
                - second_score
            )

        best_metrics = best[
            "metrics"
        ]

        # -------------------------------------------------
        # RESOLVE CONFLICT
        # -------------------------------------------------

        resolution = resolve_conflict(

            source_parcel_ids,

            best["parcel_id"],

            best["score"],

            second_score,
        )

        # -------------------------------------------------
        # SAVE RESULT
        # -------------------------------------------------

        results.append({

            "building_id":
                building_id,

            "source_parcel_id":
                source_parcel_id,

            "source_parcel_ids":
                "|".join(
                    source_parcel_ids
                ),

            "source_parcel_count":
                source_parcel_count,

            "raw_row_count":
                raw_row_count,

            "unique_geometry_count":
                unique_geometry_count,

            "inferred_parcel_id":
                best["parcel_id"],

            "candidate_count":
                len(candidate_results),

            "intersection_area_sq_m":
                round(
                    best_metrics[
                        "intersection_area_sq_m"
                    ],
                    3,
                ),

            "parcel_coverage":
                round(
                    best_metrics[
                        "parcel_coverage"
                    ],
                    4,
                ),

            "building_coverage":
                round(
                    best_metrics[
                        "building_coverage"
                    ],
                    4,
                ),

            "iou":
                round(
                    best_metrics[
                        "iou"
                    ],
                    4,
                ),

            "centroid_distance_m":
                round(
                    best_metrics[
                        "centroid_distance_m"
                    ],
                    3,
                ),

            "spatial_score":
                round(
                    best["score"],
                    4,
                ),

            "score_margin":
                (
                    round(
                        score_margin,
                        4
                    )
                    if score_margin is not None
                    else None
                ),

            "resolution":
                resolution,
        })

    # -----------------------------------------------------
    # DATAFRAME
    # -----------------------------------------------------

    results_df = pd.DataFrame(
        results
    )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    results_df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    print(
        "\n========== ENGINE SUMMARY =========="
    )

    print(
        f"Raw building rows: {raw_rows}"
    )

    print(
        f"Unique building IDs processed: "
        f"{len(buildings)}"
    )

    print(
        f"Output result rows: "
        f"{len(results_df)}"
    )

    print(
        "\n========== RESOLUTION SUMMARY =========="
    )

    print(
        results_df[
            "resolution"
        ].value_counts()
    )

    print(
        "\nAverage spatial score:",
        round(
            results_df[
                "spatial_score"
            ].mean(),
            4,
        )
    )

    print(
        "\nAverage candidate count:",
        round(
            results_df[
                "candidate_count"
            ].mean(),
            2,
        )
    )

    print(
        "\nResults saved to:"
    )

    print(
        OUTPUT_FILE
    )

    print(
        "\n========== ENGINE COMPLETE =========="
    )

    return results_df


# =========================================================
# ENTRY POINT
# =========================================================

if __name__ == "__main__":

    run_conflict_engine()



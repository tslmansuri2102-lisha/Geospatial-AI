import geopandas as gpd


def assign_roads_to_wards(roads, wards):
    """
    Assign each road to the Ahmedabad ward
    containing the largest portion of that road.
    """

    roads = roads.copy()
    wards = wards.copy()

    # Keep only the ward fields needed for integration
    wards = wards[["ward_id", "ward_name", "geometry"]]

    # Spatial intersection
    intersections = gpd.overlay(
        roads,
        wards,
        how="intersection"
    )

    # Calculate intersection length
    intersections["intersection_length"] = (
        intersections.geometry.length
    )

    # For each road, keep the ward with the largest
    # intersecting portion
    best_match = (
        intersections
        .sort_values(
            "intersection_length",
            ascending=False
        )
        .drop_duplicates("road_id")
    )

    # Add ward information back to the original roads
    result = roads.merge(
        best_match[
            ["road_id", "ward_id", "ward_name"]
        ],
        on="road_id",
        how="left"
    )

    return result

def save_integrated_roads(result, output_path):
    """
    Save roads with their assigned ward information.
    """

    result.to_file(
        output_path,
        driver="GeoJSON"
    )

    print(
        f"Integrated dataset saved to: {output_path}"
    )


def assign_buildings_to_wards(buildings, wards):
    """
    Assign each building to the ward containing
    the largest portion of its area.
    """

    buildings = buildings.copy()
    wards = wards.copy()

    wards = wards[["ward_id", "ward_name", "geometry"]]

    # Find the portions of buildings that overlap wards
    intersections = gpd.overlay(
        buildings,
        wards,
        how="intersection"
    )

    # Calculate overlapping area
    intersections["intersection_area"] = (
        intersections.geometry.area
    )

    # For each building, select the ward
    # with the largest overlapping area
    best_match = (
        intersections
        .sort_values(
            "intersection_area",
            ascending=False
        )
        .drop_duplicates("building_id")
    )

    # Add ward information back to all buildings
    result = buildings.merge(
        best_match[
            ["building_id", "ward_id", "ward_name"]
        ],
        on="building_id",
        how="left"
    )

    return result
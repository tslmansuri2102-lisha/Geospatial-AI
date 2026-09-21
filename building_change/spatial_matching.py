import geopandas as gpd


def match_buildings_to_parcels(buildings, parcels):
    """Match unique building geometries to intersecting parcels."""
    if buildings.crs != parcels.crs:
        raise ValueError(
            f"CRS mismatch: buildings={buildings.crs}, parcels={parcels.crs}"
        )

    unique_buildings = buildings[
        ["building_id", "geometry"]
    ].drop_duplicates()

    matches = gpd.sjoin(
        unique_buildings,
        parcels[["parcel_id", "geometry"]],
        how="left",
        predicate="intersects",
    )

    matches = matches[
        ["building_id", "parcel_id"]
    ].dropna().drop_duplicates()

    return matches

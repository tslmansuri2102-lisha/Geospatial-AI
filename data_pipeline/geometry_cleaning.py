import geopandas as gpd


def validate_geometries(gdf):
    """
    Check the validity of geometries in a GeoDataFrame.

    Returns:
        dict containing geometry validation statistics.
    """

    if "geometry" not in gdf.columns:
        raise ValueError("Dataset does not contain a geometry column.")

    total = len(gdf)
    valid = gdf.geometry.is_valid.sum()
    invalid = total - valid
    empty = gdf.geometry.is_empty.sum()

    return {
        "total_geometries": total,
        "valid_geometries": int(valid),
        "invalid_geometries": int(invalid),
        "empty_geometries": int(empty),
    }


def repair_geometries(gdf):
    """
    Attempt to repair invalid geometries.

    Uses GeoPandas/Shapely's make_valid operation.
    """

    cleaned = gdf.copy()

    invalid_before = (~cleaned.geometry.is_valid).sum()

    if invalid_before > 0:
        cleaned["geometry"] = cleaned.geometry.make_valid()

    invalid_after = (~cleaned.geometry.is_valid).sum()

    return cleaned, {
        "invalid_before": int(invalid_before),
        "invalid_after": int(invalid_after),
    }
import geopandas as gpd


def check_crs(gdf):
    """
    Check the coordinate reference system (CRS)
    of a GeoDataFrame.
    """

    if gdf.crs is None:
        return {
            "has_crs": False,
            "crs": None
        }

    return {
        "has_crs": True,
        "crs": str(gdf.crs)
    }


def harmonize_crs(gdf, target_crs):
    """
    Convert a GeoDataFrame to the target CRS.

    Parameters:
        gdf (GeoDataFrame): Input spatial dataset.
        target_crs: Target CRS such as 'EPSG:4326'.

    Returns:
        GeoDataFrame: Dataset transformed to target CRS.
    """

    if gdf.crs is None:
        raise ValueError(
            "Input dataset does not have a CRS."
        )

    if str(gdf.crs) == target_crs:
        return gdf.copy()

    return gdf.to_crs(target_crs)
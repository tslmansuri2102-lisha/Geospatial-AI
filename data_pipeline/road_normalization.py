import geopandas as gpd


def normalize_road_data(gdf):
    """
    Standardize OpenStreetMap road data.
    """

    required_columns = ["@id", "highway"]

    for column in required_columns:
        if column not in gdf.columns:
            raise ValueError(f"Required column '{column}' not found.")

    gdf = gdf.copy()

    # Standard road identifier
    gdf["road_id"] = gdf["@id"]

    # Standard road classification
    gdf["road_type"] = gdf["highway"]

    # Standard road name
    if "name" in gdf.columns:
        gdf["road_name"] = gdf["name"].fillna("Unnamed Road")
    else:
        gdf["road_name"] = "Unnamed Road"

    return gdf
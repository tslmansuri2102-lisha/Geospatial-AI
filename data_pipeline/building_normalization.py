import geopandas as gpd


def normalize_building_data(gdf):
    """
    Standardize OpenStreetMap building data.
    """

    required_columns = ["@id", "building"]

    for column in required_columns:
        if column not in gdf.columns:
            raise ValueError(
                f"Required column '{column}' not found."
            )

    gdf = gdf.copy()

    # Standard building identifier
    gdf["building_id"] = gdf["@id"]

    # Standard building type
    gdf["building_type"] = gdf["building"]

    # Standard building name
    if "name" in gdf.columns:
        gdf["building_name"] = (
            gdf["name"].fillna("Unnamed Building")
        )
    else:
        gdf["building_name"] = "Unnamed Building"

    return gdf
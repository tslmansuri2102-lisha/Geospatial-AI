import geopandas as gpd


def normalize_ward_data(gdf):
    """
    Standardize Ahmedabad ward data.

    Converts:
        Name -> ward_id + ward_name
    """

    if "Name" not in gdf.columns:
        raise ValueError("Required column 'Name' not found.")

    gdf = gdf.copy()

    # Extract numeric ward ID
    gdf["ward_id"] = (
        gdf["Name"]
        .str.extract(r"^(\d+)", expand=False)
    )

    # Extract ward name
    gdf["ward_name"] = (
        gdf["Name"]
        .str.replace(r"^\d+\s*", "", regex=True)
        .str.strip()
    )

    return gdf
import geopandas as gpd


def normalize_facility_data(gdf):
    """
    Normalize municipal facility data into a standard schema.
    """

    gdf = gdf.copy()

    # Standard facility ID
    gdf["facility_id"] = [
        f"WARD_OFFICE_{i:03d}"
        for i in range(1, len(gdf) + 1)
    ]

    # Standard facility name
    gdf["facility_name"] = gdf["Name"].fillna("Unnamed Facility").str.strip()

    # Since this layer represents Ward Offices
    gdf["facility_type"] = "Ward Office"

    # Standard address
    gdf["address"] = gdf["Address"].fillna("").str.strip()

    # Standard coordinates
    gdf["latitude"] = gdf["Latitude"]
    gdf["longitude"] = gdf["Longitude"]

    # Keep only the standardized fields
    gdf = gdf[
        [
            "facility_id",
            "facility_name",
            "facility_type",
            "address",
            "latitude",
            "longitude",
            "geometry"
        ]
    ]

    return gdf
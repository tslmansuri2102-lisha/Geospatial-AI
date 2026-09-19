import geopandas as gpd


def normalize_cadastral_data(gdf):
    gdf = gdf.copy()

    # Standard project identifiers
    gdf["parcel_id"] = gdf["fp_no"].astype(str).str.strip()

    # Preserve real CTPVD land-use information.
    # Missing values remain missing.
    gdf["land_use"] = gdf["reser_use"]

    # Use final plot area as the standardized area.
    gdf["area_sq_m"] = gdf["fp_area_final"].astype(float)

    # Owner information is not available in this dataset.
    gdf["owner_name"] = None

    # Keep useful source information.
    gdf["source_type"] = "CTPVD_Final_Plot"
    gdf["source_id"] = gdf["fp_no"].astype(str)
    gdf["survey_scheme"] = gdf["tps_name"]
    gdf["village_name"] = gdf["village"]
    gdf["city_name"] = gdf["city"]
    gdf["authority_name"] = gdf["authority"]
    gdf["district_name"] = gdf["district"]
    gdf["state_name"] = gdf["state"]
    gdf["status_name"] = gdf["status"]

    return gdf
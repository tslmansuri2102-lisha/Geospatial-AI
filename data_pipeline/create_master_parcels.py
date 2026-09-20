import geopandas as gpd

input_file = "data/standardized/gota_tp33_cadastral.geojson"
output_file = "data/processed/gota_tp33_master_parcels.geojson"

gdf = gpd.read_file(input_file)

# Keep the standardized parcel fields needed by the API
columns = [
    "parcel_id",
    "fp_no",
    "area_sq_m",
    "land_use",
    "owner_name",
    "source_type",
    "source_id",
    "survey_scheme",
    "village_name",
    "city_name",
    "authority_name",
    "district_name",
    "state_name",
    "status_name",
    "geometry"
]

master = gdf[columns].copy()

# API-friendly status
master["status"] = "PENDING_REVIEW"

# Confidence is not invented; it is left for the AI/integration stage
master["confidence"] = None

master.to_file(output_file, driver="GeoJSON")

print("Created:", output_file)
print("Rows:", len(master))
print("CRS:", master.crs)
print("Unique parcel IDs:", master["parcel_id"].nunique())
print("Columns:")
print(list(master.columns))
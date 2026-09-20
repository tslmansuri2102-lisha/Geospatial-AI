import geopandas as gpd
import json

input_file = "data/processed/gota_tp33_master_parcels.geojson"
output_file = "data/processed/parcel_api_sample.json"

gdf = gpd.read_file(input_file)

row = gdf.iloc[0]

geometry = json.loads(gpd.GeoSeries([row.geometry]).to_json())["features"][0]["geometry"]

parcel = {
    "parcel_id": row["parcel_id"],
    "geometry": geometry,
    "area_sq_m": float(row["area_sq_m"]),
    "attributes": {
        "land_use": row["land_use"],
        "survey_number": None,
        "property_id": None
    },
    "sources": [
        {
            "source_type": row["source_type"],
            "source_id": row["source_id"],
            "survey_date": None
        }
    ],
    "confidence": None,
    "status": row["status"]
}

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(parcel, f, indent=2)

print("Created:", output_file)
print("Parcel ID:", parcel["parcel_id"])
print("Status:", parcel["status"])
print("Area:", parcel["area_sq_m"])
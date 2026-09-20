import geopandas as gpd
import pandas as pd

input_file = "data/standardized/gota_tp33_cadastral.geojson"
output_file = "data/processed/gota_tp33_parcel_sources.csv"

gdf = gpd.read_file(input_file)

sources = pd.DataFrame({
    "parcel_id": gdf["parcel_id"],
    "source_type": "CTPVD_Final_Plot",
    "source_id": gdf["source_id"],
    "survey_date": "",
    "source_status": "verified",
    "crs": gdf.crs.to_string()
})

sources.to_csv(output_file, index=False)

print("Created:", output_file)
print("Rows:", len(sources))
print("\nColumns:")
print(list(sources.columns))
print("\nSource types:")
print(sources["source_type"].value_counts())
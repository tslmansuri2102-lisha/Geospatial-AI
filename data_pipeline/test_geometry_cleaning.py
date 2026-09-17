from ingestion import load_dataset
from geometry_cleaning import validate_geometries, repair_geometries


# Load cadastral dataset
dataset = load_dataset(
    "data/sample/sample_cadastral.geojson"
)

gdf = dataset["data"]


# Validate original geometries
print("BEFORE CLEANING")
print(validate_geometries(gdf))


# Repair invalid geometries
cleaned_gdf, repair_info = repair_geometries(gdf)


print("\nREPAIR INFORMATION")
print(repair_info)


# Validate again
print("\nAFTER CLEANING")
print(validate_geometries(cleaned_gdf))
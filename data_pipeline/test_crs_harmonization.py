from ingestion import load_dataset
from crs_harmonization import check_crs, harmonize_crs


# Load sample cadastral dataset
dataset = load_dataset(
    "data/sample/sample_cadastral.geojson"
)

gdf = dataset["data"]


# Check original CRS
print("Original CRS:")
print(check_crs(gdf))


# Transform to target CRS
target_crs = "EPSG:32643"

harmonized_gdf = harmonize_crs(
    gdf,
    target_crs
)


# Check transformed CRS
print("\nHarmonized CRS:")
print(check_crs(harmonized_gdf))


print("\nTransformation successful!")
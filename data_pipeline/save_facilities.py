import geopandas as gpd

from facility_normalization import normalize_facility_data
from spatial_integration import assign_facilities_to_wards


input_file = "data/raw/municipal/AMC Facilities.kml"
wards_file = "data/standardized/ahmedabad_wards.geojson"
output_file = "data/processed/ahmedabad_integrated_facilities.geojson"


# Load Ward Office facilities
facilities = gpd.read_file(
    input_file,
    layer="Ward Office",
    driver="KML"
)

# Normalize facilities
facilities = normalize_facility_data(facilities)

# Load standardized wards
wards = gpd.read_file(wards_file)

# Assign facilities to wards
integrated = assign_facilities_to_wards(
    facilities,
    wards
)

# Save integrated dataset
integrated.to_file(
    output_file,
    driver="GeoJSON"
)

print("Integrated facility dataset saved successfully!")
print(f"Output: {output_file}")
print(f"Total facilities: {len(integrated)}")
print(f"Assigned facilities: {integrated['ward_id'].notna().sum()}")
print(f"Unassigned facilities: {integrated['ward_id'].isna().sum()}")
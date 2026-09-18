from data_quality import (
    check_missing_values,
    check_duplicate_parcel_ids,
    check_required_columns,
    check_geometry_quality,
    check_crs,
    generate_quality_report,
    print_quality_report
)

from ingestion import load_dataset


dataset = load_dataset(
    "data/standardized/standardized_cadastral.geojson"
)

gdf = dataset["data"]

report = generate_quality_report(gdf)

print_quality_report(report)
import pandas as pd
import geopandas as gpd


def check_missing_values(df):
    """
    Check how many missing values are present in each column.
    """
    missing = df.isnull().sum()

    return missing[missing > 0].to_dict()


def check_duplicate_parcel_ids(df):
    """
    Check for duplicate parcel IDs.
    """
    if "parcel_id" not in df.columns:
        return {
            "checked": False,
            "reason": "parcel_id column not found"
        }

    duplicates = df["parcel_id"].duplicated().sum()

    return {
        "checked": True,
        "duplicate_count": int(duplicates)
    }


def check_required_columns(df, required_columns=None):
    if required_columns is None:
        required_columns = [
            "parcel_id",
            "owner_name",
            "land_use",
            "area_sq_m"
        ]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    return {
        "required_columns": required_columns,
        "missing_columns": missing_columns,
        "all_present": len(missing_columns) == 0
    }
def check_geometry_quality(gdf):
    """
    Check invalid and empty geometries.
    """
    if "geometry" not in gdf.columns:
        return {
            "checked": False,
            "reason": "geometry column not found"
        }

    invalid = (~gdf.geometry.is_valid).sum()
    empty = gdf.geometry.is_empty.sum()

    return {
        "checked": True,
        "invalid_geometries": int(invalid),
        "empty_geometries": int(empty)
    }


def check_crs(gdf):
    """
    Check whether a spatial dataset has a CRS.
    """
    if gdf.crs is None:
        return {
            "has_crs": False,
            "crs": None
        }

    return {
        "has_crs": True,
        "crs": str(gdf.crs)
    }
def generate_quality_report(data):
    """
    Generate a complete data quality report.
    """

    report = {}

    # Check required attributes
    if "ward_id" in data.columns and "ward_name" in data.columns:
        required_columns = ["ward_id", "ward_name"]

    elif "road_id" in data.columns and "road_type" in data.columns:
        required_columns = ["road_id", "road_type", "road_name"]

    else:
        required_columns = [
        "parcel_id",
        "owner_name",
        "land_use",
        "area_sq_m"
    ]

    report["required_columns"] = check_required_columns(
        data,
        required_columns
    )

    # Check missing values
    report["missing_values"] = check_missing_values(data)

    # Check duplicate parcel IDs
    report["duplicate_parcel_ids"] = check_duplicate_parcel_ids(data)

    # Spatial checks for GeoDataFrame
    if isinstance(data, gpd.GeoDataFrame):
        report["geometry_quality"] = check_geometry_quality(data)
        report["crs"] = check_crs(data)

    return report

def print_quality_report(report):
    """
    Display the quality report in a readable format.
    """

    print("\n========== DATA QUALITY REPORT ==========")

    # Required columns
    required = report["required_columns"]

    print("\nRequired columns:")
    print(f"  All present : {required['all_present']}")

    if required["missing_columns"]:
        print(f"  Missing     : {required['missing_columns']}")
    else:
        print("  Missing     : None")

    # Missing values
    print("\nMissing values:")

    missing = report["missing_values"]

    if missing:
        for column, count in missing.items():
            print(f"  {column}: {count}")
    else:
        print("  None")

    # Duplicate IDs
    duplicates = report["duplicate_parcel_ids"]

    print("\nDuplicate parcel IDs:")

    if duplicates["checked"]:
        print(f"  Count: {duplicates['duplicate_count']}")
    else:
        print(f"  Not checked: {duplicates['reason']}")

    # Geometry
    if "geometry_quality" in report:

        geometry = report["geometry_quality"]

        print("\nGeometry quality:")
        print(f"  Invalid geometries: {geometry['invalid_geometries']}")
        print(f"  Empty geometries  : {geometry['empty_geometries']}")

    # CRS
    if "crs" in report:

        crs = report["crs"]

        print("\nCoordinate Reference System:")

        if crs["has_crs"]:
            print(f"  CRS: {crs['crs']}")
        else:
            print("  CRS: Missing")

    print("\n==========================================")
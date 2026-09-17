from pathlib import Path

import pandas as pd
import geopandas as gpd
import rasterio


SUPPORTED_VECTOR_FORMATS = {".geojson", ".json", ".shp"}
SUPPORTED_TABLE_FORMATS = {".csv", ".xlsx", ".xls"}
SUPPORTED_RASTER_FORMATS = {".tif", ".tiff"}


def load_dataset(file_path):
    """
    Load a supported geospatial or tabular dataset.

    Supported formats:
    - CSV
    - Excel
    - GeoJSON
    - Shapefile
    - GeoTIFF

    Returns:
        dict: Dataset information and loaded data.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {file_path}"
        )

    extension = path.suffix.lower()

    # -------------------------------
    # Tabular datasets
    # -------------------------------
    if extension == ".csv":
        data = pd.read_csv(path)

        return {
            "file_name": path.name,
            "file_type": "CSV",
            "data_type": "tabular",
            "data": data,
            "rows": len(data),
            "columns": list(data.columns),
        }

    if extension in {".xlsx", ".xls"}:
        data = pd.read_excel(path)

        return {
            "file_name": path.name,
            "file_type": "Excel",
            "data_type": "tabular",
            "data": data,
            "rows": len(data),
            "columns": list(data.columns),
        }

    # -------------------------------
    # Vector geospatial datasets
    # -------------------------------
    if extension in SUPPORTED_VECTOR_FORMATS:
        data = gpd.read_file(path)

        return {
            "file_name": path.name,
            "file_type": extension.replace(".", "").upper(),
            "data_type": "vector",
            "data": data,
            "rows": len(data),
            "columns": list(data.columns),
            "crs": str(data.crs) if data.crs else None,
            "geometry_type": (
                data.geometry.geom_type.value_counts().to_dict()
                if "geometry" in data.columns
                else {}
            ),
        }

    # -------------------------------
    # Raster geospatial datasets
    # -------------------------------
    if extension in SUPPORTED_RASTER_FORMATS:
        raster = rasterio.open(path)

        metadata = {
            "file_name": path.name,
            "file_type": "GeoTIFF",
            "data_type": "raster",
            "data": raster,
            "crs": str(raster.crs) if raster.crs else None,
            "width": raster.width,
            "height": raster.height,
            "bands": raster.count,
            "bounds": raster.bounds,
            "resolution": raster.res,
        }

        return metadata

    # -------------------------------
    # Unsupported format
    # -------------------------------
    raise ValueError(
        f"Unsupported file format: {extension}. "
        f"Supported formats are: "
        f"CSV, XLSX, XLS, GeoJSON, SHP, TIF and TIFF."
    )


def get_dataset_summary(dataset):
    """
    Display a simple summary of a loaded dataset.
    """

    print("\n========== DATASET SUMMARY ==========")

    print(f"File name : {dataset['file_name']}")
    print(f"File type : {dataset['file_type']}")
    print(f"Data type : {dataset['data_type']}")

    if dataset["data_type"] in {"tabular", "vector"}:
        print(f"Rows      : {dataset['rows']}")
        print(f"Columns   : {dataset['columns']}")

    if dataset["data_type"] in {"vector", "raster"}:
        print(f"CRS       : {dataset.get('crs')}")

    if dataset["data_type"] == "vector":
        print(f"Geometry  : {dataset.get('geometry_type')}")

    if dataset["data_type"] == "raster":
        print(f"Dimensions: {dataset['width']} x {dataset['height']}")
        print(f"Bands     : {dataset['bands']}")
        print(f"Resolution: {dataset['resolution']}")
        print(f"Bounds    : {dataset['bounds']}")

    print("=====================================\n")
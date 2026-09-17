from pathlib import Path
import pandas as pd
import geopandas as gpd


def save_standardized_dataset(data, output_path):
    """
    Save a standardized dataset to the appropriate file format.
    """

    output_path = Path(output_path)

    # Create output directory if it does not exist
    output_path.parent.mkdir(parents=True, exist_ok=True)

    extension = output_path.suffix.lower()

    # Vector data
    if isinstance(data, gpd.GeoDataFrame):

        if extension == ".geojson":
            data.to_file(output_path, driver="GeoJSON")

        elif extension == ".shp":
            data.to_file(output_path, driver="ESRI Shapefile")

        else:
            raise ValueError(
                "Unsupported vector output format. "
                "Use .geojson or .shp"
            )

    # Tabular data
    elif isinstance(data, pd.DataFrame):

        if extension == ".csv":
            data.to_csv(output_path, index=False)

        elif extension == ".xlsx":
            data.to_excel(output_path, index=False)

        else:
            raise ValueError(
                "Unsupported tabular output format. "
                "Use .csv or .xlsx"
            )

    else:
        raise TypeError(
            "Data must be a pandas DataFrame "
            "or GeoPandas GeoDataFrame."
        )

    print(f"Standardized dataset saved to: {output_path}")
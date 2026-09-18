from ingestion import load_dataset
from crs_harmonization import harmonize_crs
from geometry_cleaning import repair_geometries
from attribute_mapping import harmonize_attributes
from normalization import normalize_attributes
from data_quality import generate_quality_report, print_quality_report
from municipal_normalization import normalize_ward_data
from output_writer import save_standardized_dataset


def process_dataset(file_path, target_crs=None):
    """
    Load and harmonize a dataset.

    Vector data:
        Ingestion → CRS harmonization → Geometry cleaning
        → Attribute mapping → Attribute normalization

    Tabular data:
        Ingestion → Attribute mapping → Attribute normalization
    """

    # Step 1: Load dataset
    dataset = load_dataset(file_path)

    print(f"\nLoaded dataset: {dataset['file_name']}")
    print(f"Data type: {dataset['data_type']}")

    data = dataset["data"]

    # ---------------------------------------------------------
    # VECTOR DATA
    # ---------------------------------------------------------
    if dataset["data_type"] == "vector":

        print(f"Original CRS: {data.crs}")

        # Step 2: CRS harmonization
        if target_crs is not None:
            data = harmonize_crs(data, target_crs)
            print(f"Harmonized CRS: {data.crs}")

        # Step 3: Geometry cleaning
        data, repair_info = repair_geometries(data)

        print("Geometry repair:")
        print(repair_info)

        # Step 4: Attribute harmonization
        data, mapping = harmonize_attributes(data)

        print("Attribute mapping:")
        print(mapping)

        # Step 5: Attribute normalization
        data = normalize_attributes(data)

        print("Attribute normalization completed.")

        if "Name" in data.columns:
            data = normalize_ward_data(data)
        print("Municipal ward normalization completed.")

        quality_report = generate_quality_report(data)
        print_quality_report(quality_report)

    # ---------------------------------------------------------
    # TABULAR DATA
    # ---------------------------------------------------------
    elif dataset["data_type"] == "tabular":

        # Step 2: Attribute harmonization
        data, mapping = harmonize_attributes(data)

        print("Attribute mapping:")
        print(mapping)

        # Step 3: Attribute normalization
        data = normalize_attributes(data)

        print("Attribute normalization completed.")

        quality_report = generate_quality_report(data)
        print_quality_report(quality_report)

    else:
        raise ValueError(
            f"Unsupported dataset type: {dataset['data_type']}"
        )

    return data


if __name__ == "__main__":

    print("\n========== CADASTRAL DATA ==========")

    cadastral_data = process_dataset(
        "data/sample/sample_cadastral.geojson",
        "EPSG:32643"
    )

    print("\nFinal cadastral columns:")
    print(list(cadastral_data.columns))

    save_standardized_dataset(
        cadastral_data,
        "data/standardized/standardized_cadastral.geojson"
    )

    print("\n========== MUNICIPAL DATA ==========")

    municipal_data = process_dataset(
        "data/sample/sample_municipal.csv"
    )

    print("\nFinal municipal columns:")
    print(list(municipal_data.columns))

    save_standardized_dataset(
        municipal_data,
        "data/standardized/standardized_municipal.csv"
    )
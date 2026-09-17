import pandas as pd


# Standard schema used by our integrated land platform
STANDARD_SCHEMA = {
    "parcel_id": ["parcel_id", "property_id", "plot_no", "plot_id"],
    "owner_name": ["owner_name", "property_owner", "owner"],
    "land_use": ["land_use", "property_type", "usage", "use_type"],
    "area_sq_m": ["area_sq_m", "plot_area", "property_area", "area"]
}


def detect_attribute_mapping(columns):
    """
    Automatically identify which input columns correspond
    to our standardized schema.
    """

    columns_lower = {
        column.lower(): column
        for column in columns
    }

    mapping = {}

    for standard_name, possible_names in STANDARD_SCHEMA.items():

        for possible_name in possible_names:

            if possible_name.lower() in columns_lower:

                mapping[columns_lower[possible_name.lower()]] = standard_name

                break

    return mapping


def harmonize_attributes(df):
    """
    Rename recognized attributes to the standard schema.
    """

    mapping = detect_attribute_mapping(df.columns)

    harmonized = df.rename(columns=mapping).copy()

    return harmonized, mapping
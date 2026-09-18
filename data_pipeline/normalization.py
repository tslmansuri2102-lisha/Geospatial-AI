import pandas as pd


# Standard land-use categories
LAND_USE_MAPPING = {
    "residential": "Residential",
    "res": "Residential",
    "res.": "Residential",
    "housing": "Residential",

    "commercial": "Commercial",
    "comm": "Commercial",
    "business": "Commercial",

    "agricultural": "Agricultural",
    "agriculture": "Agricultural",
    "agri": "Agricultural",

    "industrial": "Industrial",
    "industry": "Industrial",

    "institutional": "Institutional",
    "institution": "Institutional",

    "recreational": "Recreational",
    "recreation": "Recreational"
}


def normalize_land_use(value):
    """
    Convert different land-use spellings
    into a standard category.
    """

    if pd.isna(value):
        return None

    value = str(value).strip().lower()

    return LAND_USE_MAPPING.get(value, value.title())


def normalize_land_use_column(df):
    """
    Normalize the land_use column of a dataset.
    """

    normalized = df.copy()

    if "land_use" not in normalized.columns:
        return normalized

    normalized["land_use"] = normalized["land_use"].apply(
        normalize_land_use
    )

    return normalized


def normalize_owner_name(value):
    """
    Clean and standardize owner names.
    """

    if pd.isna(value):
        return None

    value = str(value).strip()

    # Remove extra spaces
    value = " ".join(value.split())

    # Standardize capitalization
    return value.title()


def normalize_parcel_id(value):
    """
    Clean and standardize parcel IDs.
    """

    if pd.isna(value):
        return None

    value = str(value).strip().upper()

    return value


def normalize_attributes(df):
    """
    Apply all attribute normalization operations.
    """

    normalized = df.copy()

    if "land_use" in normalized.columns:
        normalized["land_use"] = normalized["land_use"].apply(
            normalize_land_use
        )

    if "owner_name" in normalized.columns:
        normalized["owner_name"] = normalized["owner_name"].apply(
            normalize_owner_name
        )

    if "parcel_id" in normalized.columns:
        normalized["parcel_id"] = normalized["parcel_id"].apply(
            normalize_parcel_id
        )

    normalized = normalize_numeric_columns(normalized)

    return normalized
def normalize_area(value):
    """
    Convert area values into a consistent numeric format.
    """

    if pd.isna(value):
        return None

    # Convert to string and remove spaces/commas
    value = str(value).strip().replace(",", "")

    try:
        return float(value)
    except ValueError:
        return None


def normalize_numeric_columns(df):
    """
    Normalize numeric fields in the dataset.
    """

    normalized = df.copy()

    if "area_sq_m" in normalized.columns:
        normalized["area_sq_m"] = normalized["area_sq_m"].apply(
            normalize_area
        )

    return normalized
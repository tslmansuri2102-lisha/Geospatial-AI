from normalization import (
    normalize_land_use,
    normalize_owner_name,
    normalize_parcel_id,
    normalize_area,
    normalize_attributes
)

import pandas as pd


print("\n========== NORMALIZATION TEST ==========")

# Test individual values
print("\n1. Land-use normalization:")

land_use_values = [
    "RESIDENTIAL",
    " residential ",
    "res.",
    "housing",
    "AGRICULTURE",
    "commercial"
]

for value in land_use_values:
    print(f"{value!r} -> {normalize_land_use(value)!r}")


print("\n2. Owner-name normalization:")

owner_values = [
    "  rahul   patel  ",
    "NEHA SHAH",
    " amit desai "
]

for value in owner_values:
    print(f"{value!r} -> {normalize_owner_name(value)!r}")


print("\n3. Parcel-ID normalization:")

parcel_values = [
    "p001",
    " P002 ",
    "p003"
]

for value in parcel_values:
    print(f"{value!r} -> {normalize_parcel_id(value)!r}")

print("\n4. Area normalization:")

area_values = [
    "150",
    " 250.50 ",
    "1,250.75"
]

for value in area_values:
    print(f"{value!r} -> {normalize_area(value)!r}")
print("\n5. Complete attribute normalization:")

sample_data = pd.DataFrame({
    "parcel_id": [" p001 ", "p002", "P003"],
    "owner_name": [
        "  rahul   patel",
        "NEHA SHAH",
        " amit desai "
    ],
    "land_use": [
        "RESIDENTIAL",
        " commercial ",
        "AGRICULTURE"
    ]
})

print("\nBefore:")
print(sample_data)

normalized_data = normalize_attributes(sample_data)

print("\nAfter:")
print(normalized_data)

print("\n========================================")
print("\n6. Real municipal dataset normalization:")

from ingestion import load_dataset
from attribute_mapping import harmonize_attributes

municipal_dataset = load_dataset(
    "data/sample/sample_municipal.csv"
)

municipal_data = municipal_dataset["data"]

print("\nOriginal municipal data:")
print(municipal_data)

# Step 1: Map source attributes to standard names
standardized_municipal, mapping = harmonize_attributes(
    municipal_data
)

print("\nAfter attribute mapping:")
print(standardized_municipal)

# Step 2: Normalize the standardized attributes
normalized_municipal = normalize_attributes(
    standardized_municipal
)

print("\nAfter normalization:")
print(normalized_municipal)

print("\nData types:")
print(normalized_municipal.dtypes)

print("\n========================================")
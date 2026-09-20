from ingestion import load_dataset
from attribute_mapping import harmonize_attributes


# Load municipal dataset
dataset = load_dataset(
    "data/sample/sample_municipal.csv"
)

df = dataset["data"]


print("ORIGINAL COLUMNS:")
print(list(df.columns))


# Harmonize attributes
harmonized_df, mapping = harmonize_attributes(df)


print("\nDETECTED ATTRIBUTE MAPPING:")
print(mapping)


print("\nHARMONIZED COLUMNS:")
print(list(harmonized_df.columns))


print("\nHARMONIZED DATA:")
print(harmonized_df)
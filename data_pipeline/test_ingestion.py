from ingestion import load_dataset, get_dataset_summary


dataset = load_dataset("data/sample/sample_cadastral.geojson")

get_dataset_summary(dataset)

print("First 3 parcels:")
print(dataset["data"][["parcel_id", "owner_name", "land_use"]])
import csv
from collections import defaultdict
from pathlib import Path


def load_building_parcel_relations(csv_path):
    """Load building-to-parcel relationships, preserving one-to-many mappings."""
    relations = defaultdict(list)

    with Path(csv_path).open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            building_id = (row.get("building_id") or "").strip()
            parcel_id = (row.get("parcel_id") or "").strip()

            if not building_id or not parcel_id:
                continue

            if parcel_id not in relations[building_id]:
                relations[building_id].append(parcel_id)

    return dict(relations)
def build_parcel_building_index(building_parcel_relations):
    """Build a parcel-to-buildings index from building-to-parcel relationships."""
    parcel_buildings = defaultdict(list)

    for building_id, parcel_ids in building_parcel_relations.items():
        for parcel_id in parcel_ids:
            if building_id not in parcel_buildings[parcel_id]:
                parcel_buildings[parcel_id].append(building_id)

    return dict(parcel_buildings)

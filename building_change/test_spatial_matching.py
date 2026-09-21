import geopandas as gpd
import pytest
from shapely.geometry import box

from building_change.spatial_matching import match_buildings_to_parcels


def test_duplicate_building_rows_do_not_duplicate_matches():
    buildings = gpd.GeoDataFrame(
        {
            "building_id": ["B1", "B1"],
            "parcel_id": ["P1", "P2"],
        },
        geometry=[box(0, 0, 2, 2), box(0, 0, 2, 2)],
        crs="EPSG:32643",
    )

    parcels = gpd.GeoDataFrame(
        {"parcel_id": ["P1", "P2"]},
        geometry=[box(0, 0, 1, 2), box(1, 0, 2, 2)],
        crs="EPSG:32643",
    )

    result = match_buildings_to_parcels(buildings, parcels)

    assert len(result) == 2
    assert set(result["parcel_id"]) == {"P1", "P2"}


def test_multiple_buildings_and_parcels_are_preserved():
    buildings = gpd.GeoDataFrame(
        {
            "building_id": ["B1", "B2"],
        },
        geometry=[box(0, 0, 1, 1), box(2, 0, 3, 1)],
        crs="EPSG:32643",
    )

    parcels = gpd.GeoDataFrame(
        {
            "parcel_id": ["P1", "P2"],
        },
        geometry=[box(0, 0, 1, 1), box(2, 0, 3, 1)],
        crs="EPSG:32643",
    )

    result = match_buildings_to_parcels(buildings, parcels)

    assert set(zip(result["building_id"], result["parcel_id"])) == {
        ("B1", "P1"),
        ("B2", "P2"),
    }


def test_crs_mismatch_is_rejected():
    buildings = gpd.GeoDataFrame(
        {"building_id": ["B1"]},
        geometry=[box(0, 0, 1, 1)],
        crs="EPSG:32643",
    )

    parcels = gpd.GeoDataFrame(
        {"parcel_id": ["P1"]},
        geometry=[box(0, 0, 1, 1)],
        crs="EPSG:4326",
    )

    with pytest.raises(ValueError, match="CRS mismatch"):
        match_buildings_to_parcels(buildings, parcels)

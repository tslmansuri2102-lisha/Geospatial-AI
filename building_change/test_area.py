import geopandas as gpd
import pytest
from shapely.geometry import Polygon

from building_change.area import calculate_building_areas


def test_area_is_calculated_in_square_metres():
    buildings = gpd.GeoDataFrame(
        {"building_id": ["B1"]},
        geometry=[Polygon([(0, 0), (10, 0), (10, 20), (0, 20)])],
        crs="EPSG:32643",
    )

    result = calculate_building_areas(buildings)

    assert result.loc[0, "area_sq_m"] == 200


def test_duplicate_building_geometries_are_removed():
    geometry = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)])

    buildings = gpd.GeoDataFrame(
        {"building_id": ["B1", "B1"]},
        geometry=[geometry, geometry],
        crs="EPSG:32643",
    )

    result = calculate_building_areas(buildings)

    assert len(result) == 1


def test_missing_crs_is_rejected():
    buildings = gpd.GeoDataFrame(
        {"building_id": ["B1"]},
        geometry=[Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])],
    )

    with pytest.raises(ValueError, match="must have a CRS"):
        calculate_building_areas(buildings)

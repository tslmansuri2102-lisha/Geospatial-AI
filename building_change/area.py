def calculate_building_areas(buildings):
    """Return a copy with geometry-derived area in square metres."""
    if buildings.crs is None:
        raise ValueError("Building GeoDataFrame must have a CRS.")

    result = buildings[
        ["building_id", "geometry"]
    ].drop_duplicates().copy()

    result["area_sq_m"] = result.geometry.area

    if (result["area_sq_m"] <= 0).any():
        raise ValueError("Building geometry contains zero or negative area.")

    return result

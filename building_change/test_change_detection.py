from building_change.change_detection import (
    detect_new_removed_buildings,
    detect_building_expansions,
    create_change_event,
    build_change_explanation,
    compare_building_snapshots,
)


def test_new_and_removed_buildings():
    new_buildings, removed_buildings = detect_new_removed_buildings(
        ["B1", "B2"],
        ["B2", "B3"],
    )

    assert new_buildings == ["B3"]
    assert removed_buildings == ["B1"]


def test_building_expansion():
    previous = {
        "B1": {"area_sq_m": 100},
        "B2": {"area_sq_m": 200},
    }

    current = {
        "B1": {"area_sq_m": 120},
        "B2": {"area_sq_m": 210},
    }

    expansions = detect_building_expansions(previous, current)

    assert len(expansions) == 1
    assert expansions[0]["building_id"] == "B1"
    assert expansions[0]["increase_ratio"] == 0.2


def test_change_event():
    event = create_change_event(
        "C1",
        "P1",
        "new_building",
        None,
        "B1",
        0.95,
    )

    assert event["change_id"] == "C1"
    assert event["parcel_id"] == "P1"
    assert event["change_type"] == "new_building"
    assert event["confidence"] == 0.95
    assert event["verification_required"] is True


def test_change_explanation():
    explanation = build_change_explanation("new_building", 0.95)

    assert explanation["change_type"] == "new_building"
    assert explanation["confidence"] == 0.95
    assert "current snapshot" in explanation["reason"]


def test_snapshot_comparison():
    previous = {
        "B1": {"area_sq_m": 100},
        "B2": {"area_sq_m": 200},
    }

    current = {
        "B2": {"area_sq_m": 200},
        "B3": {"area_sq_m": 150},
    }

    result = compare_building_snapshots(previous, current)

    assert result["new_buildings"] == ["B3"]
    assert result["removed_buildings"] == ["B1"]
    assert result["building_expansions"] == []

"""
Test that verifies all types in the SDK can be imported and instantiated.

This test runs each type import/instantiation in a subprocess to avoid import cache issues.
It allows Pydantic ValidationError (expected when instantiating without required fields)
but catches other errors like circular imports, missing dependencies, etc.
"""

import subprocess
import sys

import pytest


@pytest.mark.parametrize(
    "module_name,class_name",
    [
        ("seed.bigunion.types.active_diamond", "ActiveDiamond"),
        ("seed.bigunion.types.attractive_script", "AttractiveScript"),
        ("seed.bigunion.types.big_union", "BigUnion"),
        ("seed.bigunion.types.circular_card", "CircularCard"),
        ("seed.bigunion.types.colorful_cover", "ColorfulCover"),
        ("seed.bigunion.types.diligent_deal", "DiligentDeal"),
        ("seed.bigunion.types.disloyal_value", "DisloyalValue"),
        ("seed.bigunion.types.distinct_failure", "DistinctFailure"),
        ("seed.bigunion.types.false_mirror", "FalseMirror"),
        ("seed.bigunion.types.frozen_sleep", "FrozenSleep"),
        ("seed.bigunion.types.gaseous_road", "GaseousRoad"),
        ("seed.bigunion.types.gruesome_coach", "GruesomeCoach"),
        ("seed.bigunion.types.harmonious_play", "HarmoniousPlay"),
        ("seed.bigunion.types.hasty_pain", "HastyPain"),
        ("seed.bigunion.types.hoarse_mouse", "HoarseMouse"),
        ("seed.bigunion.types.jumbo_end", "JumboEnd"),
        ("seed.bigunion.types.limping_step", "LimpingStep"),
        ("seed.bigunion.types.misty_snow", "MistySnow"),
        ("seed.bigunion.types.normal_sweet", "NormalSweet"),
        ("seed.bigunion.types.popular_limit", "PopularLimit"),
        ("seed.bigunion.types.potable_bad", "PotableBad"),
        ("seed.bigunion.types.practical_principle", "PracticalPrinciple"),
        ("seed.bigunion.types.primary_block", "PrimaryBlock"),
        ("seed.bigunion.types.rotating_ratio", "RotatingRatio"),
        ("seed.bigunion.types.thankful_factor", "ThankfulFactor"),
        ("seed.bigunion.types.total_work", "TotalWork"),
        ("seed.bigunion.types.triangular_repair", "TriangularRepair"),
        ("seed.bigunion.types.unique_stress", "UniqueStress"),
        ("seed.bigunion.types.unwilling_smoke", "UnwillingSmoke"),
        ("seed.bigunion.types.vibrant_excitement", "VibrantExcitement"),
        ("seed.types.types.bar", "Bar"),
        ("seed.types.types.foo", "Foo"),
        ("seed.types.types.foo_extended", "FooExtended"),
        ("seed.types.types.union", "Union"),
        ("seed.types.types.union_with_base_properties", "UnionWithBaseProperties"),
        ("seed.types.types.union_with_discriminant", "UnionWithDiscriminant"),
        ("seed.types.types.union_with_duplicate_primitive", "UnionWithDuplicatePrimitive"),
        ("seed.types.types.union_with_duplicate_types", "UnionWithDuplicateTypes"),
        ("seed.types.types.union_with_literal", "UnionWithLiteral"),
        ("seed.types.types.union_with_multiple_no_properties", "UnionWithMultipleNoProperties"),
        ("seed.types.types.union_with_no_properties", "UnionWithNoProperties"),
        ("seed.types.types.union_with_optional_time", "UnionWithOptionalTime"),
        ("seed.types.types.union_with_primitive", "UnionWithPrimitive"),
        ("seed.types.types.union_with_same_number_types", "UnionWithSameNumberTypes"),
        ("seed.types.types.union_with_same_string_types", "UnionWithSameStringTypes"),
        ("seed.types.types.union_with_single_element", "UnionWithSingleElement"),
        ("seed.types.types.union_with_sub_types", "UnionWithSubTypes"),
        ("seed.types.types.union_with_time", "UnionWithTime"),
        ("seed.types.types.union_without_key", "UnionWithoutKey"),
        ("seed.union.types.circle", "Circle"),
        ("seed.union.types.get_shape_request", "GetShapeRequest"),
        ("seed.union.types.shape", "Shape"),
        ("seed.union.types.square", "Square"),
        ("seed.union.types.with_name", "WithName"),
    ],
)
def test_type_can_be_imported_and_instantiated(module_name: str, class_name: str) -> None:
    """Test that a type can be imported and instantiated in a subprocess."""
    test_code = f"""
import sys
from pydantic import ValidationError as PydanticValidationError

try:
    from {module_name} import {class_name}

    try:
        {class_name}()
    except PydanticValidationError:
        pass
    except TypeError:
        pass
    except ValueError:
        pass

except ImportError as e:
    print("ImportError: " + str(e), file=sys.stderr)
    sys.exit(1)
except TypeError as e:
    pass
except BaseException as e:
    print(type(e).__name__ + ": " + str(e), file=sys.stderr)
    sys.exit(1)

sys.exit(0)
"""

    result = subprocess.run(
        [sys.executable, "-c", test_code],
        capture_output=True,
        text=True,
        timeout=30,
    )

    assert result.returncode == 0, f"Failed to import/instantiate {module_name}.{class_name}: {result.stderr}"

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
        ("seed.endpoints.put.types.error", "Error"),
        ("seed.endpoints.put.types.error_category", "ErrorCategory"),
        ("seed.endpoints.put.types.error_code", "ErrorCode"),
        ("seed.endpoints.put.types.put_response", "PutResponse"),
        ("seed.general_errors.types.bad_object_request_info", "BadObjectRequestInfo"),
        ("seed.types.docs.types.object_with_docs", "ObjectWithDocs"),
        ("seed.types.enum.types.weather_report", "WeatherReport"),
        ("seed.types.object.types.double_optional", "DoubleOptional"),
        ("seed.types.object.types.nested_object_with_optional_field", "NestedObjectWithOptionalField"),
        ("seed.types.object.types.nested_object_with_required_field", "NestedObjectWithRequiredField"),
        ("seed.types.object.types.object_with_map_of_map", "ObjectWithMapOfMap"),
        ("seed.types.object.types.object_with_optional_field", "ObjectWithOptionalField"),
        ("seed.types.object.types.object_with_required_field", "ObjectWithRequiredField"),
        ("seed.types.object.types.optional_alias", "OptionalAlias"),
        ("seed.types.union.types.animal", "Animal"),
        ("seed.types.union.types.cat", "Cat"),
        ("seed.types.union.types.dog", "Dog"),
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

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
        ("seed.commons.types.types.data", "Data"),
        ("seed.commons.types.types.event_info", "EventInfo"),
        ("seed.commons.types.types.metadata", "Metadata"),
        ("seed.commons.types.types.tag", "Tag"),
        ("seed.file.service.types.filename", "Filename"),
        ("seed.types.basic_type", "BasicType"),
        ("seed.types.complex_type", "ComplexType"),
        ("seed.types.identifier", "Identifier"),
        ("seed.types.type", "Type"),
        (
            "seed.types.type_with_single_char_property_equal_to_type_starting_letter",
            "TypeWithSingleCharPropertyEqualToTypeStartingLetter",
        ),
        ("seed.types.types.actor", "Actor"),
        ("seed.types.types.actress", "Actress"),
        ("seed.types.types.big_entity", "BigEntity"),
        ("seed.types.types.cast_member", "CastMember"),
        ("seed.types.types.cron_job", "CronJob"),
        ("seed.types.types.directory", "Directory"),
        ("seed.types.types.entity", "Entity"),
        ("seed.types.types.exception", "Exception"),
        ("seed.types.types.exception_info", "ExceptionInfo"),
        ("seed.types.types.extended_movie", "ExtendedMovie"),
        ("seed.types.types.file", "File"),
        ("seed.types.types.metadata", "Metadata"),
        ("seed.types.types.migration", "Migration"),
        ("seed.types.types.migration_status", "MigrationStatus"),
        ("seed.types.types.moment", "Moment"),
        ("seed.types.types.movie", "Movie"),
        ("seed.types.types.movie_id", "MovieId"),
        ("seed.types.types.node", "Node"),
        ("seed.types.types.refresh_token_request", "RefreshTokenRequest"),
        ("seed.types.types.request", "Request"),
        ("seed.types.types.response", "Response"),
        ("seed.types.types.response_type", "ResponseType"),
        ("seed.types.types.stunt_double", "StuntDouble"),
        ("seed.types.types.test", "Test"),
        ("seed.types.types.tree", "Tree"),
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

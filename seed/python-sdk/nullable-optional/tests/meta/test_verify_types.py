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
        ("seed.nullable_optional.types.address", "Address"),
        ("seed.nullable_optional.types.complex_profile", "ComplexProfile"),
        ("seed.nullable_optional.types.create_user_request", "CreateUserRequest"),
        ("seed.nullable_optional.types.deserialization_test_request", "DeserializationTestRequest"),
        ("seed.nullable_optional.types.deserialization_test_response", "DeserializationTestResponse"),
        ("seed.nullable_optional.types.document", "Document"),
        ("seed.nullable_optional.types.email_notification", "EmailNotification"),
        ("seed.nullable_optional.types.notification_method", "NotificationMethod"),
        ("seed.nullable_optional.types.nullable_user_id", "NullableUserId"),
        ("seed.nullable_optional.types.optional_user_id", "OptionalUserId"),
        ("seed.nullable_optional.types.organization", "Organization"),
        ("seed.nullable_optional.types.push_notification", "PushNotification"),
        ("seed.nullable_optional.types.search_result", "SearchResult"),
        ("seed.nullable_optional.types.sms_notification", "SmsNotification"),
        ("seed.nullable_optional.types.update_user_request", "UpdateUserRequest"),
        ("seed.nullable_optional.types.user_profile", "UserProfile"),
        ("seed.nullable_optional.types.user_response", "UserResponse"),
        ("seed.nullable_optional.types.user_role", "UserRole"),
        ("seed.nullable_optional.types.user_status", "UserStatus"),
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

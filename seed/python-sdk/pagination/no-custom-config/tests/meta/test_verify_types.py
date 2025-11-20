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
        ("seed.complex_.types.conversation", "Conversation"),
        ("seed.complex_.types.cursor_pages", "CursorPages"),
        ("seed.complex_.types.multiple_filter_search_request", "MultipleFilterSearchRequest"),
        ("seed.complex_.types.multiple_filter_search_request_operator", "MultipleFilterSearchRequestOperator"),
        ("seed.complex_.types.multiple_filter_search_request_value", "MultipleFilterSearchRequestValue"),
        ("seed.complex_.types.paginated_conversation_response", "PaginatedConversationResponse"),
        ("seed.complex_.types.search_request", "SearchRequest"),
        ("seed.complex_.types.search_request_query", "SearchRequestQuery"),
        ("seed.complex_.types.single_filter_search_request", "SingleFilterSearchRequest"),
        ("seed.complex_.types.single_filter_search_request_operator", "SingleFilterSearchRequestOperator"),
        ("seed.complex_.types.starting_after_paging", "StartingAfterPaging"),
        (
            "seed.inline_users.inline_users.types.list_users_extended_optional_list_response",
            "ListUsersExtendedOptionalListResponse",
        ),
        ("seed.inline_users.inline_users.types.list_users_extended_response", "ListUsersExtendedResponse"),
        (
            "seed.inline_users.inline_users.types.list_users_mixed_type_pagination_response",
            "ListUsersMixedTypePaginationResponse",
        ),
        ("seed.inline_users.inline_users.types.list_users_pagination_response", "ListUsersPaginationResponse"),
        ("seed.inline_users.inline_users.types.next_page", "NextPage"),
        ("seed.inline_users.inline_users.types.order", "Order"),
        ("seed.inline_users.inline_users.types.page", "Page"),
        ("seed.inline_users.inline_users.types.user", "User"),
        ("seed.inline_users.inline_users.types.user_list_container", "UserListContainer"),
        ("seed.inline_users.inline_users.types.user_optional_list_container", "UserOptionalListContainer"),
        ("seed.inline_users.inline_users.types.user_optional_list_page", "UserOptionalListPage"),
        ("seed.inline_users.inline_users.types.user_page", "UserPage"),
        ("seed.inline_users.inline_users.types.username_container", "UsernameContainer"),
        ("seed.inline_users.inline_users.types.users", "Users"),
        ("seed.inline_users.inline_users.types.with_cursor", "WithCursor"),
        ("seed.inline_users.inline_users.types.with_page", "WithPage"),
        ("seed.types.username_cursor", "UsernameCursor"),
        ("seed.types.username_page", "UsernamePage"),
        ("seed.users.types.list_users_extended_optional_list_response", "ListUsersExtendedOptionalListResponse"),
        ("seed.users.types.list_users_extended_response", "ListUsersExtendedResponse"),
        ("seed.users.types.list_users_mixed_type_pagination_response", "ListUsersMixedTypePaginationResponse"),
        ("seed.users.types.list_users_pagination_response", "ListUsersPaginationResponse"),
        ("seed.users.types.next_page", "NextPage"),
        ("seed.users.types.order", "Order"),
        ("seed.users.types.page", "Page"),
        ("seed.users.types.user", "User"),
        ("seed.users.types.user_list_container", "UserListContainer"),
        ("seed.users.types.user_optional_list_container", "UserOptionalListContainer"),
        ("seed.users.types.user_optional_list_page", "UserOptionalListPage"),
        ("seed.users.types.user_page", "UserPage"),
        ("seed.users.types.username_container", "UsernameContainer"),
        ("seed.users.types.with_cursor", "WithCursor"),
        ("seed.users.types.with_page", "WithPage"),
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

from fern_python.generators.sdk.core_utilities.core_utilities import CoreUtilities
from fern_python.generators.sdk.custom_config import SDKCustomConfig


def test_get_package_name_with_explicit_name():
    """Test _get_package_name with explicitly configured package name"""
    custom_config = SDKCustomConfig(package_name="my-awesome-sdk")
    project_module_path = ("test_package",)

    core_utilities = CoreUtilities(
        has_standard_paginated_endpoints=False,
        has_custom_paginated_endpoints=False,
        project_module_path=project_module_path,
        custom_config=custom_config,
    )

    package_name = core_utilities._get_package_name()
    assert package_name == "my-awesome-sdk"


def test_get_package_name_with_module_path_fallback():
    """Test _get_package_name fallback to module path when no explicit name"""
    custom_config = SDKCustomConfig()  # No package_name provided
    project_module_path = ("my", "nested", "package")

    core_utilities = CoreUtilities(
        has_standard_paginated_endpoints=False,
        has_custom_paginated_endpoints=False,
        project_module_path=project_module_path,
        custom_config=custom_config,
    )

    package_name = core_utilities._get_package_name()
    assert package_name == "my.nested.package"


def test_get_package_name_with_single_module():
    """Test _get_package_name with single module path"""
    custom_config = SDKCustomConfig()  # No package_name provided
    project_module_path = ("simple_package",)

    core_utilities = CoreUtilities(
        has_standard_paginated_endpoints=False,
        has_custom_paginated_endpoints=False,
        project_module_path=project_module_path,
        custom_config=custom_config,
    )

    package_name = core_utilities._get_package_name()
    assert package_name == "simple_package"
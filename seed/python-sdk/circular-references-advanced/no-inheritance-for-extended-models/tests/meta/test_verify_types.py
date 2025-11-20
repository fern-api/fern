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
        ("seed.a.types.a", "A"),
        ("seed.ast.types.acai", "Acai"),
        ("seed.ast.types.animal", "Animal"),
        ("seed.ast.types.berry", "Berry"),
        ("seed.ast.types.branch_node", "BranchNode"),
        ("seed.ast.types.cat", "Cat"),
        ("seed.ast.types.container_value", "ContainerValue"),
        ("seed.ast.types.dog", "Dog"),
        ("seed.ast.types.field_name", "FieldName"),
        ("seed.ast.types.field_value", "FieldValue"),
        ("seed.ast.types.fig", "Fig"),
        ("seed.ast.types.fruit", "Fruit"),
        ("seed.ast.types.leaf_node", "LeafNode"),
        ("seed.ast.types.node", "Node"),
        ("seed.ast.types.nodes_wrapper", "NodesWrapper"),
        ("seed.ast.types.object_field_value", "ObjectFieldValue"),
        ("seed.ast.types.object_value", "ObjectValue"),
        ("seed.ast.types.primitive_value", "PrimitiveValue"),
        ("seed.types.importing_a", "ImportingA"),
        ("seed.types.root_type", "RootType"),
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

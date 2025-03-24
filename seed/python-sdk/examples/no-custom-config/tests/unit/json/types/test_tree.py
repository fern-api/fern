from seed.types.types import Node, Tree
from tests.utils.assert_json_serialization import assert_json_serialization

def test_tree_serialization():
    value = Tree(
        nodes=[
            Node(
                name="left",
            ),
            Node(
                name="right",
            ),
        ],
    )
    assert_json_serialization(value)

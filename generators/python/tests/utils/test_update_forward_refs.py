import importlib
import re
import textwrap
from pathlib import Path

import pytest

from core_utilities.shared.pydantic_utilities import IS_PYDANTIC_V2

MODULES = {
    "leaf.py": """
        from core_utilities.shared.pydantic_utilities import UniversalBaseModel

        class Leaf(UniversalBaseModel):
            value: str
    """,
    "node.py": """
        from __future__ import annotations
        import typing
        from .leaf import Leaf

        if typing.TYPE_CHECKING:
            from .branch import Branch
            from .items import Items
        Node = typing.Union["Branch", Leaf, "Items"]
    """,
    "branch.py": """
        from __future__ import annotations
        import typing
        import pydantic
        from core_utilities.shared.pydantic_utilities import update_forward_refs

        class Branch(pydantic.RootModel):
            root: typing.Dict[str, "Node"]

        from .node import Node  # noqa: E402
        update_forward_refs(Branch)
    """,
    "items.py": """
        from __future__ import annotations
        import typing
        import pydantic
        from core_utilities.shared.pydantic_utilities import update_forward_refs

        class Items(pydantic.RootModel):
            root: typing.List["Node"]

        from .node import Node  # noqa: E402
        update_forward_refs(Items)
    """,
    "result.py": """
        from __future__ import annotations
        from core_utilities.shared.pydantic_utilities import UniversalBaseModel, update_forward_refs

        class Result(UniversalBaseModel):
            data: "Branch"

        from .branch import Branch  # noqa: E402
        from .items import Items  # noqa: E402
        from .node import Node  # noqa: E402
        update_forward_refs(Result, Branch=Branch, Items=Items, Node=Node)
    """,
}


@pytest.mark.skipif(not IS_PYDANTIC_V2, reason="RootModel requires Pydantic v2")
def test_recursive_union_alias_resolves_from_namespace(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    # A per-test package name, so a module cached in sys.modules by another test can't be reused.
    package_name = "recursive_alias_" + re.sub(r"\W", "_", tmp_path.name)
    package = tmp_path / package_name
    package.mkdir()
    (package / "__init__.py").write_text("")
    for name, source in MODULES.items():
        (package / name).write_text(textwrap.dedent(source))
    monkeypatch.syspath_prepend(str(tmp_path))

    Result = importlib.import_module(f"{package_name}.result").Result
    Leaf = importlib.import_module(f"{package_name}.leaf").Leaf
    Items = importlib.import_module(f"{package_name}.items").Items

    result = Result.model_validate({"data": {"a": {"value": "x"}, "b": [{"c": {"value": "y"}}]}})

    assert isinstance(result.data.root["a"], Leaf)
    assert isinstance(result.data.root["b"], Items)
    assert result.data.root["b"].root[0].root["c"].value == "y"

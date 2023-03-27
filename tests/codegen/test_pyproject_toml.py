from pathlib import Path

from fern_python.codegen import ast
from fern_python.codegen.dependency_manager import DependencyManager
from fern_python.codegen.pyproject_toml import PyProjectToml, PyProjectTomlPackageConfig


def test_pyproject_toml_gen(tmpdir: Path) -> None:
    dependency_manager = DependencyManager()
    dependency_manager.add_dependency(ast.Dependency(name="pydantic", version="^1.10.2"))
    pyproject_toml = PyProjectToml(
        name="fern-fern-ir-model",
        version="0.0.0",
        package=PyProjectTomlPackageConfig(include="ir", _from="src"),
        dependency_manager=dependency_manager,
        python_version="3.7",
        path=str(tmpdir),
    )
    pyproject_toml.write()

    pyproject_output = ""
    with open(f"{tmpdir}/pyproject.toml") as f:
        pyproject_output = f.read()

    assert (
        pyproject_output
        == """
[tool.poetry]
name = "fern-fern-ir-model"
version = "0.0.0"
description = ""
authors = []
packages = [
    { include = "ir", from = "src"}
]

[tool.poetry.dependencies]
python = "^3.7"
pydantic = "^1.10.2"

[tool.poetry.dev-dependencies]
mypy = "0.971"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"""
    )

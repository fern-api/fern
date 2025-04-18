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
        python_version="^3.8",
        path=str(tmpdir),
        pypi_metadata=None,
        github_output_mode=None,
        license_=None,
    )
    pyproject_toml.write()

    pyproject_output = ""
    with open(f"{tmpdir}/pyproject.toml") as f:
        pyproject_output = f.read()

    assert (
        pyproject_output
        == """[project]
name = "fern-fern-ir-model"

[tool.poetry]
name = "fern-fern-ir-model"
version = "0.0.0"
description = ""
readme = "README.md"
authors = []
keywords = []

classifiers = [
    "Intended Audience :: Developers",
    "Programming Language :: Python",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Operating System :: OS Independent",
    "Operating System :: POSIX",
    "Operating System :: MacOS",
    "Operating System :: POSIX :: Linux",
    "Operating System :: Microsoft :: Windows",
    "Topic :: Software Development :: Libraries :: Python Modules",
    "Typing :: Typed"
]
packages = [
    { include = "ir", from = "src"}
]

[tool.poetry.dependencies]
python = "^3.8"
pydantic = "^1.10.2"

[tool.poetry.dev-dependencies]
mypy = "1.0.1"
pytest = "^7.4.0"
pytest-asyncio = "^0.23.5"
python-dateutil = "^2.9.0"
types-python-dateutil = "^2.9.0.20240316"

[tool.pytest.ini_options]
testpaths = [ "tests" ]
asyncio_mode = "auto"

[tool.mypy]
plugins = ["pydantic.mypy"]

[tool.ruff]
line-length = 120


[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"""
    )

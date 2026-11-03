import textwrap

import pytest

import pydantic
from fern_python.codegen import AST
from fern_python.external_dependencies.httpx import HttpX, HttpxPackage
from fern_python.generators.sdk.custom_config import SDKCustomConfig
from fern_python.generators.sdk.sdk_generator import SdkGenerator
from fern_python.source_file_factory import SourceFileFactory

from fern.generator_exec.config import GithubOutputMode


def test_httpx_package_defaults_to_httpx() -> None:
    assert SDKCustomConfig.parse_obj({}).httpx_package == HttpxPackage.HTTPX


def test_httpx_package_accepts_httpx2() -> None:
    assert SDKCustomConfig.parse_obj({"httpx_package": "httpx2"}).httpx_package == HttpxPackage.HTTPX2


def test_httpx_package_rejects_unknown_package() -> None:
    with pytest.raises(pydantic.ValidationError):
        SDKCustomConfig.parse_obj({"httpx_package": "requests"})


@pytest.mark.parametrize("python_version", ["^3.8", ">=3.8,<4.0", "^3.10", "^3.12"])
def test_httpx2_accepts_any_pyproject_python_version(python_version: str) -> None:
    # The generator already raises any floor below 3.10 to ^3.10 when it sets up the
    # project, so httpx2 must not reject configs that would otherwise generate fine.
    config = SDKCustomConfig.parse_obj({"httpx_package": "httpx2", "pyproject_python_version": python_version})
    assert config.httpx_package == HttpxPackage.HTTPX2


def _render(httpx: HttpX) -> str:
    snippet = SourceFileFactory(should_format=True).create_snippet()
    snippet.add_expression(
        AST.Expression(
            AST.ClassInstantiation(
                class_=httpx.CLIENT,
                kwargs=[("transport", AST.Expression(AST.ClassInstantiation(class_=httpx.HTTP_TRANSPORT)))],
            )
        )
    )
    return snippet.to_str()


def test_httpx_references_import_httpx() -> None:
    assert _render(HttpX()) == textwrap.dedent(
        """\
        import httpx

        httpx.Client(
            transport=httpx.HTTPTransport(),
        )
        """
    )


def test_httpx2_references_import_httpx2_as_httpx() -> None:
    assert _render(HttpX(HttpxPackage.HTTPX2)) == textwrap.dedent(
        """\
        import httpx2 as httpx

        httpx.Client(
            transport=httpx.HTTPTransport(),
        )
        """
    )


def test_httpx2_references_can_skip_the_alias_for_user_facing_snippets() -> None:
    assert _render(HttpX(HttpxPackage.HTTPX2, import_as_httpx=False)) == textwrap.dedent(
        """\
        import httpx2

        httpx2.Client(
            transport=httpx2.HTTPTransport(),
        )
        """
    )


@pytest.mark.parametrize(
    "package, name, version",
    [(HttpxPackage.HTTPX, "httpx", "0.21.2"), (HttpxPackage.HTTPX2, "httpx2", "2.0.0")],
)
def test_references_declare_the_package_dependency(package: HttpxPackage, name: str, version: str) -> None:
    assert [(dependency.name, dependency.version) for dependency in HttpX(package).module.get_dependencies()] == [
        (name, version)
    ]


SOURCE = textwrap.dedent(
    """\
    import typing

    import httpx
    import httpx_sse
    from httpx._types import RequestFiles


    def proxies() -> typing.Any:
        from httpx._utils import get_environment_proxies

        return get_environment_proxies()
    """
)


def test_rewrite_imports_is_a_no_op_for_httpx() -> None:
    assert HttpxPackage.HTTPX.rewrite_imports(SOURCE) == SOURCE


def test_rewrite_imports_points_httpx_imports_at_httpx2() -> None:
    assert HttpxPackage.HTTPX2.rewrite_imports(SOURCE) == textwrap.dedent(
        """\
        import typing

        import httpx2 as httpx
        import httpx_sse
        from httpx2._types import RequestFiles


        def proxies() -> typing.Any:
            from httpx2._utils import get_environment_proxies

            return get_environment_proxies()
        """
    )


@pytest.mark.parametrize(
    "source",
    ["import httpx  # comment", "import httpx, typing", "import httpx as hx", "    import httpx as hx"],
)
def test_rewrite_imports_fails_loudly_on_unsupported_import_forms(source: str) -> None:
    with pytest.raises(ValueError, match="Unrewritten httpx import"):
        HttpxPackage.HTTPX2.rewrite_imports(source)


def test_rewrite_imports_leaves_other_httpx_prefixed_modules_alone() -> None:
    source = "import httpx_sse\nimport httpx2\n"
    assert HttpxPackage.HTTPX2.rewrite_imports(source) == source


@pytest.mark.parametrize("legacy", [True, False])
@pytest.mark.parametrize("include_aiohttp_ci_steps", [True, False])
def test_github_workflow_aiohttp_steps(legacy: bool, include_aiohttp_ci_steps: bool) -> None:
    generator = SdkGenerator()
    build_workflow = generator._get_github_workflow_legacy if legacy else generator._get_github_workflow
    workflow = build_workflow(
        GithubOutputMode(version="0.0.1", repo_url="https://github.com/acme/acme-python"),
        False,
        "3.10",
        include_aiohttp_ci_steps=include_aiohttp_ci_steps,
    )
    assert ("poetry install --extras aiohttp" in workflow) == include_aiohttp_ci_steps
    assert ("pytest -rP -n auto -m aiohttp" in workflow) == include_aiohttp_ci_steps
    assert "poetry run pytest -rP -n auto ." in workflow

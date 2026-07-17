import textwrap
import types

from fern_python.codegen import AST
from fern_python.generators.sdk.client_generator.root_client_generator import (
    RootClientGenerator,
)
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ClientWrapperGenerator,
    ConstructorParameter,
)
from fern_python.generators.sdk.environment_generators import GeneratedEnvironment
from fern_python.source_file_factory import SourceFileFactory


def _create_test_builder(oauth_token_override: bool = False) -> RootClientGenerator.GeneratedRootClientBuilder:
    """Helper to create a builder with standard test parameters."""
    generated_environment = GeneratedEnvironment(
        class_reference=AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=("acme", "environments"),
                ),
                named_import="AcmeEnvironments",
            ),
        ),
        example_environment="PRODUCTION",
    )
    client_wrapper_generator = ClientWrapperGenerator(
        context=None,  # type: ignore
        generated_environment=generated_environment,
    )
    return RootClientGenerator.GeneratedRootClientBuilder(
        module_path=("acme", "client"),
        class_name="Acme",
        async_class_name="AcmeAsync",
        constructor_parameters=[
            ConstructorParameter(
                constructor_parameter_name="base_url",
                type_hint=None,  # type: ignore
                private_member_name="_base_url",
                initializer=AST.Expression('base_url="acme.io"'),
            ),
            ConstructorParameter(
                constructor_parameter_name="environment",
                type_hint=None,  # type: ignore
                private_member_name="_environment",
                initializer=client_wrapper_generator._get_environment_instantiation(
                    generated_environment=generated_environment,
                ),
            ),
        ],
        oauth_token_override=oauth_token_override,
    )


def _make_server_variables_generator_stub(
    server_url_variables: bool,
) -> types.SimpleNamespace:
    """Build a lightweight stub with the attributes _get_server_variables reads.

    The single-base-url environments config carries one server variable so we can
    assert whether it is surfaced or suppressed based on the config flag.
    """
    server_variable = types.SimpleNamespace(id="region", default="us-east-1")
    env = types.SimpleNamespace(url_variables=[server_variable])
    env_union = types.SimpleNamespace(type="singleBaseUrl", environments=[env])
    environments_config = types.SimpleNamespace(
        environments=types.SimpleNamespace(get_as_union=lambda: env_union),
    )
    return types.SimpleNamespace(
        _context=types.SimpleNamespace(
            custom_config=types.SimpleNamespace(server_url_variables=server_url_variables),
        ),
        _environments_config=environments_config,
    )


def test_get_server_variables_default_surfaces_variables() -> None:
    """With server_url_variables enabled (default), server variables are surfaced."""
    stub = _make_server_variables_generator_stub(server_url_variables=True)
    variables = RootClientGenerator._get_server_variables(stub)  # type: ignore[arg-type]
    assert [var.id for var in variables] == ["region"]


def test_get_server_variables_disabled_suppresses_variables() -> None:
    """With server_url_variables disabled, no server variables are surfaced, so
    neither the constructor kwargs nor the URL-template interpolation are emitted."""
    stub = _make_server_variables_generator_stub(server_url_variables=False)
    variables = RootClientGenerator._get_server_variables(stub)  # type: ignore[arg-type]
    assert variables == []


def test_generated_root_client_builder() -> None:
    builder = _create_test_builder()
    generated_root_client = builder.build()

    snippet = SourceFileFactory(should_format=True).create_snippet()
    snippet.add_expression(generated_root_client.sync_instantiation)
    assert snippet.to_str() == textwrap.dedent(
        """\
        from acme.client import Acme
        from acme.environments import AcmeEnvironments

        client = Acme(
            base_url="acme.io",
            environment=AcmeEnvironments.PRODUCTION,
        )
        """
    )

    async_snippet = SourceFileFactory(should_format=True).create_snippet()
    async_snippet.add_expression(generated_root_client.async_instantiation)
    assert async_snippet.to_str() == textwrap.dedent(
        """\
        from acme.client import AcmeAsync
        from acme.environments import AcmeEnvironments

        client = AcmeAsync(
            base_url="acme.io",
            environment=AcmeEnvironments.PRODUCTION,
        )
        """
    )


def test_generated_root_client_builder_instantiations_list() -> None:
    """Test that sync_instantiations and async_instantiations return lists."""
    builder = _create_test_builder()
    generated_root_client = builder.build()

    # Without OAuth client credentials, there should be exactly one instantiation
    assert len(generated_root_client.sync_instantiations) == 1
    assert len(generated_root_client.async_instantiations) == 1

    # The backwards-compatible properties should return the same as the first list element
    snippet_from_property = SourceFileFactory(should_format=True).create_snippet()
    snippet_from_property.add_expression(generated_root_client.sync_instantiation)

    snippet_from_list = SourceFileFactory(should_format=True).create_snippet()
    snippet_from_list.add_expression(generated_root_client.sync_instantiations[0])

    assert snippet_from_property.to_str() == snippet_from_list.to_str()


def test_generated_root_client_builder_with_oauth_client_credentials() -> None:
    """Test that OAuth client credentials adds a second token-based instantiation."""
    builder = _create_test_builder(oauth_token_override=True)
    generated_root_client = builder.build()

    # With OAuth client credentials, there should be two instantiations
    assert len(generated_root_client.sync_instantiations) == 2
    assert len(generated_root_client.async_instantiations) == 2

    # First instantiation should be the default (same as without oauth_token_override)
    first_sync_snippet = SourceFileFactory(should_format=True).create_snippet()
    first_sync_snippet.add_expression(generated_root_client.sync_instantiations[0])
    assert first_sync_snippet.to_str() == textwrap.dedent(
        """\
        from acme.client import Acme
        from acme.environments import AcmeEnvironments

        client = Acme(
            base_url="acme.io",
            environment=AcmeEnvironments.PRODUCTION,
        )
        """
    )

    # Second instantiation should be the token-based one
    second_sync_snippet = SourceFileFactory(should_format=True).create_snippet()
    second_sync_snippet.add_expression(generated_root_client.sync_instantiations[1])
    assert second_sync_snippet.to_str() == textwrap.dedent(
        """\
        from acme.client import Acme

        client = Acme(
            base_url="https://yourhost.com/path/to/api",
            token="YOUR_BEARER_TOKEN",
        )
        """
    )

    # Test async token-based instantiation
    second_async_snippet = SourceFileFactory(should_format=True).create_snippet()
    second_async_snippet.add_expression(generated_root_client.async_instantiations[1])
    assert second_async_snippet.to_str() == textwrap.dedent(
        """\
        from acme.client import AcmeAsync

        client = AcmeAsync(
            base_url="https://yourhost.com/path/to/api",
            token="YOUR_BEARER_TOKEN",
        )
        """
    )

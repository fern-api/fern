import textwrap

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


def test_generated_root_client_builder() -> None:
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
    builder = RootClientGenerator.GeneratedRootClientBuilder(
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
    )
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

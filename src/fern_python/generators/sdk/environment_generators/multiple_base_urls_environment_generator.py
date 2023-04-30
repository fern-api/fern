import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile

from ..context.sdk_generator_context import SdkGeneratorContext


class MultipleBaseUrlsEnvironmentGenerator:
    def __init__(self, context: SdkGeneratorContext, environments: ir_types.MultipleBaseUrlsEnvironments):
        self._context = context
        self._environments = environments

    def generate(
        self,
        source_file: SourceFile,
    ) -> None:
        class_name = self._context.get_class_name_of_environments()
        environment_class = AST.ClassDeclaration(name=class_name)

        for environment in self._environments.environments:
            environment_class.add_class_var(
                AST.VariableDeclaration(
                    name=self._get_class_var_name(environment),
                    type_hint=AST.TypeHint(
                        AST.ClassReference(qualified_name_excluding_import=(class_name,), is_forward_reference=True)
                    ),
                    docstring=AST.Docstring(environment.docs) if environment.docs is not None else None,
                )
            )

        environment_class.constructor = AST.ClassConstructor(
            signature=AST.FunctionSignature(
                named_parameters=[
                    AST.NamedFunctionParameter(
                        name=self._get_base_url_property_name(base_url),
                        type_hint=AST.TypeHint.str_(),
                    )
                    for base_url in self._environments.base_urls
                ]
            ),
            body=AST.CodeWriter(self._write_constructor_body),
        )

        source_file.add_class_declaration(environment_class)
        source_file.add_arbitrary_code(AST.CodeWriter("\n"))
        source_file.add_arbitrary_code(AST.CodeWriter(self._write_bottom_statements))

    def get_reference_to_default_environment(self) -> AST.Expression:
        if self._context.ir.environments is None or self._context.ir.environments.default_environment is None:
            raise RuntimeError("Cannot get reference to default environment because none is defined.")
        default_environment = self._context.ir.environments.default_environment

        environment = self._get_environment(
            environment_id=default_environment,
            environments=self._environments,
        )

        def write(writer: AST.NodeWriter) -> None:
            writer.write_reference(self._context.get_reference_to_environments_class())
            writer.write_line(f".{self._get_class_var_name(environment)}")

        return AST.Expression(AST.CodeWriter(write))

    def get_reference_to_base_url(
        self, *, reference_to_environments: AST.Expression, base_url_id: ir_types.EnvironmentBaseUrlId
    ) -> AST.Expression:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_node(reference_to_environments)
            writer.write(".")
            writer.write(self._get_base_url_property_name(self._get_base_url(base_url_id)))

        return AST.Expression(AST.CodeWriter(write))

    def _get_class_var_name(self, environment: ir_types.MultipleBaseUrlsEnvironment) -> str:
        return environment.name.screaming_snake_case.safe_name

    def _get_base_url_property_name(self, base_url: ir_types.EnvironmentBaseUrlWithId) -> str:
        return base_url.name.snake_case.safe_name

    def _get_base_url(self, base_url_id: ir_types.EnvironmentBaseUrlId) -> ir_types.EnvironmentBaseUrlWithId:
        for base_url in self._environments.base_urls:
            if base_url.id == base_url_id:
                return base_url
        raise RuntimeError("Base URL does not exist: " + base_url_id.get_as_str())

    def _get_environment(
        self,
        *,
        environment_id: ir_types.EnvironmentId,
        environments: ir_types.MultipleBaseUrlsEnvironments,
    ) -> ir_types.MultipleBaseUrlsEnvironment:
        for environment in environments.environments:
            if environment.id == environment_id:
                return environment
        raise RuntimeError("Environment does not exist: " + environment_id.get_as_str())

    def _write_constructor_body(self, writer: AST.NodeWriter) -> None:
        for base_url in self._environments.base_urls:
            property_name = self._get_base_url_property_name(base_url)
            writer.write_line(f"self.{property_name} = {property_name}")

    def _write_bottom_statements(self, writer: AST.NodeWriter) -> None:
        class_name = self._context.get_class_name_of_environments()
        for environment in self._environments.environments:
            class_var = self._get_class_var_name(environment)
            writer.write(f"{class_name}.{class_var} = ")
            writer.write_node(
                AST.ClassInstantiation(
                    class_=AST.ClassReference(qualified_name_excluding_import=(class_name,)),
                    kwargs=[
                        (
                            self._get_base_url_property_name(base_url),
                            AST.Expression(f'"{environment.urls[base_url.id].get_as_str()}"'),
                        )
                        for base_url in self._environments.base_urls
                    ],
                )
            )
            writer.write_newline_if_last_line_not()

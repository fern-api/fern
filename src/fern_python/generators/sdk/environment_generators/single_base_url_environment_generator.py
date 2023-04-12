import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, SourceFile

from ..context.sdk_generator_context import SdkGeneratorContext


class SingleBaseUrlEnvironmentGenerator:
    def __init__(self, context: SdkGeneratorContext, environments: ir_types.SingleBaseUrlEnvironments):
        self._context = context
        self._environments = environments

    def generate(
        self,
        source_file: SourceFile,
    ) -> None:
        enum_class = AST.ClassDeclaration(
            name=self._context.get_class_name_of_environments(),
            extends=[
                AST.ClassReference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("enum",))),
                    qualified_name_excluding_import=("Enum",),
                ),
            ],
        )

        for single_base_url_env in self._environments.environments:
            enum_class.add_class_var(
                AST.VariableDeclaration(
                    name=self._get_enum_value_name(single_base_url_env),
                    initializer=AST.Expression(f'"{single_base_url_env.url.get_as_str()}"'),
                    docstring=AST.Docstring(single_base_url_env.docs) if single_base_url_env.docs is not None else None,
                )
            )

        source_file.add_class_declaration(enum_class)

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
            writer.write_line(f".{self._get_enum_value_name(environment)}")

        return AST.Expression(AST.CodeWriter(write))

    def _get_enum_value_name(self, environment: ir_types.SingleBaseUrlEnvironment) -> str:
        return environment.name.screaming_snake_case.safe_name

    def _get_environment(
        self,
        *,
        environment_id: ir_types.EnvironmentId,
        environments: ir_types.SingleBaseUrlEnvironments,
    ) -> ir_types.SingleBaseUrlEnvironment:
        for environment in environments.environments:
            if environment.id == environment_id:
                return environment
        raise RuntimeError("Environment does not exist: " + environment_id.get_as_str())

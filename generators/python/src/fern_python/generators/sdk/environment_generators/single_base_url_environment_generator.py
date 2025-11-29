import fern.ir.resources as ir_types
from ..context.sdk_generator_context import SdkGeneratorContext
from .generated_environment import GeneratedEnvironment

from fern_python.codegen import AST, SourceFile


class SingleBaseUrlEnvironmentGenerator:
    def __init__(self, context: SdkGeneratorContext, environments: ir_types.SingleBaseUrlEnvironments):
        self._context = context
        self._environments = environments

    def generate(
        self,
        source_file: SourceFile,
    ) -> GeneratedEnvironment:
        class_name = self._context.get_class_name_of_environments()
        enum_class = AST.ClassDeclaration(
            name=class_name,
            extends=[
                AST.ClassReference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("enum",))),
                    qualified_name_excluding_import=("Enum",),
                ),
            ],
        )

        example_environment = ""
        for i, single_base_url_env in enumerate(self._environments.environments):
            class_var_name = self._get_enum_value_name(single_base_url_env)
            if i == 0:
                example_environment = class_var_name
            enum_class.add_class_var(
                AST.VariableDeclaration(
                    name=class_var_name,
                    initializer=AST.Expression(f'"{single_base_url_env.url}"'),
                    docstring=AST.Docstring(single_base_url_env.docs) if single_base_url_env.docs is not None else None,
                )
            )

        source_file.add_class_declaration(enum_class)

        class_reference = AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=self._context.get_module_path_in_project(
                        self._context.get_filepath_for_environments_enum().to_module().path
                    ),
                ),
                named_import=class_name,
            ),
        )

        return GeneratedEnvironment(
            class_reference=class_reference,
            example_environment=example_environment,
        )

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
        raise RuntimeError("Environment does not exist: " + environment_id)

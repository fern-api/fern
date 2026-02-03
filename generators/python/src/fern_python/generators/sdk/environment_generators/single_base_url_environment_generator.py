from typing import List, Optional, Tuple

from ..context.sdk_generator_context import SdkGeneratorContext
from .generated_environment import GeneratedEnvironment
from fern_python.codegen import AST, SourceFile

import fern.ir.resources as ir_types


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

    def has_url_templating(self) -> bool:
        """
        Check if any environment uses URL templating with variables.
        Returns True if urlTemplate and urlVariables are present on any environment.

        Note: Uses getattr with camelCase field names for forward-compatibility.
        The Python IR SDK stores extra fields (not yet in the schema) in model_extra
        with their original JSON key names (camelCase). Once the IR SDK is updated,
        these fields will be available as snake_case attributes.
        """
        for env in self._environments.environments:
            # Try camelCase first (extra fields from JSON), then snake_case (future IR SDK)
            url_template = getattr(env, "urlTemplate", None) or getattr(env, "url_template", None)
            url_variables = getattr(env, "urlVariables", None) or getattr(env, "url_variables", None)
            if url_template is not None and url_variables is not None and len(url_variables) > 0:
                return True
        return False

    def get_url_template_info(
        self,
    ) -> Optional[Tuple[str, List[Tuple[str, str, Optional[str], Optional[List[str]]]]]]:
        """
        Get URL template information for the first environment that has URL templating.
        Returns a tuple of (url_template, list of (variable_id, variable_name, default_value, allowed_values))
        or None if no URL templating is configured.

        Note: Uses getattr with camelCase field names for forward-compatibility.
        The Python IR SDK stores extra fields (not yet in the schema) in model_extra
        with their original JSON key names (camelCase). Once the IR SDK is updated,
        these fields will be available as snake_case attributes.
        """
        for env in self._environments.environments:
            # Try camelCase first (extra fields from JSON), then snake_case (future IR SDK)
            url_template = getattr(env, "urlTemplate", None) or getattr(env, "url_template", None)
            url_variables = getattr(env, "urlVariables", None) or getattr(env, "url_variables", None)
            if url_template is not None and url_variables is not None and len(url_variables) > 0:
                variables: List[Tuple[str, str, Optional[str], Optional[List[str]]]] = []
                for var in url_variables:
                    # Variables are raw dicts when accessed from model_extra
                    if isinstance(var, dict):
                        var_id = var.get("id")
                        var_name_dict = var.get("name", {})
                        var_default = var.get("default")
                        var_values = var.get("values")
                        if var_id is not None and var_name_dict:
                            # Get the snake_case safe name for the parameter
                            snake_case = var_name_dict.get("snakeCase", {})
                            var_name = snake_case.get("safeName", var_id) if snake_case else var_id
                            variables.append((var_id, var_name, var_default, var_values))
                    else:
                        # Future: when IR SDK is updated, var will be a proper object
                        var_id = getattr(var, "id", None)
                        var_name_obj = getattr(var, "name", None)
                        var_default = getattr(var, "default", None)
                        var_values = getattr(var, "values", None)
                        if var_id is not None and var_name_obj is not None:
                            var_name = (
                                var_name_obj.snake_case.safe_name if hasattr(var_name_obj, "snake_case") else var_id
                            )
                            variables.append((var_id, var_name, var_default, var_values))
                return (url_template, variables)
        return None

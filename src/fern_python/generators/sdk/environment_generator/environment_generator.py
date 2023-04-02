import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, SourceFile

from ..context.sdk_generator_context import SdkGeneratorContext


class EnvironmentGenerator:
    def __init__(self, context: SdkGeneratorContext, environments: ir_types.Environments):
        self._context = context
        self._environments = environments

    def generate(
        self,
        source_file: SourceFile,
    ) -> None:
        enum_class = AST.ClassDeclaration(
            name=self._context.get_class_name_of_environments_enum(),
            extends=[
                AST.ClassReference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("enum",))),
                    qualified_name_excluding_import=("Enum",),
                ),
            ],
        )
        self._environments.visit(
            single_base_url=lambda v: self.visit_single_base_url(v, enum_class),
            multiple_base_urls=lambda v: self.visit_multi_base_url(),
        )

        source_file.add_class_declaration(enum_class)

    def visit_single_base_url(
        self, single_base_url_environments: ir_types.SingleBaseUrlEnvironments, enum_class: AST.ClassDeclaration
    ) -> None:
        for single_base_url_env in single_base_url_environments.environments:
            enum_class.add_class_var(
                AST.VariableDeclaration(
                    name=single_base_url_env.name.snake_case.safe_name,
                    initializer=AST.Expression(f'"{single_base_url_env.url.get_as_str()}"'),
                    docstring=AST.Docstring(single_base_url_env.docs) if single_base_url_env.docs is not None else None,
                )
            )

    def visit_multi_base_url(self) -> None:
        raise Exception("multiple_base_url_environments are unsupported")

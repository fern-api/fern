import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, SourceFile

from ..context.sdk_generator_context import SdkGeneratorContext


class ErrorGenerator:
    _BODY_PARAMETER_NAME = "body"

    def __init__(self, context: SdkGeneratorContext, error: ir_types.ErrorDeclaration):
        self._context = context
        self._error = error

    def generate(
        self,
        source_file: SourceFile,
    ) -> None:
        source_file.add_class_declaration(
            declaration=AST.ClassDeclaration(
                name=self._context.get_class_name_for_error(error_name=self._error.name),
                extends=[self._context.core_utilities.get_reference_to_api_error()],
                constructor=AST.ClassConstructor(
                    signature=AST.FunctionSignature(
                        parameters=[
                            AST.FunctionParameter(
                                name=ErrorGenerator._BODY_PARAMETER_NAME,
                                type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                    self._error.type
                                ),
                            ),
                        ]
                        if self._error.type is not None
                        else [],
                    ),
                    body=AST.CodeWriter(self._write_constructor_body),
                ),
            )
        )

    def _write_constructor_body(self, writer: AST.NodeWriter) -> None:
        writer.write_node(
            self._context.core_utilities.instantiate_api_error_from_subclass(
                status_code=AST.Expression(f"{self._error.status_code}"),
                body=AST.Expression(ErrorGenerator._BODY_PARAMETER_NAME) if self._error.type is not None else None,
            )
        )

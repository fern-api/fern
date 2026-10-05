from typing import List

from ..context.sdk_generator_context import SdkGeneratorContext
from fern_python.codegen import AST, SourceFile

import fern.ir.resources as ir_types


class ErrorGenerator:
    _BODY_PARAMETER_NAME = "body"
    _HEADERS_PARAMETER_NAME = "headers"
    _STATUS_CODE_PARAMETER_NAME = "status_code"

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
                        parameters=self._get_constructor_parameters(),
                    ),
                    body=AST.CodeWriter(self._write_constructor_body),
                ),
            )
        )

    def _get_constructor_parameters(self) -> List[AST.FunctionParameter]:
        headers_parameter = AST.FunctionParameter(
            name=ErrorGenerator._HEADERS_PARAMETER_NAME,
            type_hint=AST.TypeHint.optional(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_())),
            initializer=AST.Expression(AST.TypeHint.none()),
        )
        parameters: List[AST.FunctionParameter] = []
        if self._error.type is not None:
            parameters.append(
                AST.FunctionParameter(
                    name=ErrorGenerator._BODY_PARAMETER_NAME,
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        self._error.type
                    ),
                )
            )
        parameters.append(headers_parameter)
        if self._is_wildcard():
            parameters.append(
                AST.FunctionParameter(
                    name=ErrorGenerator._STATUS_CODE_PARAMETER_NAME,
                    type_hint=AST.TypeHint.optional(AST.TypeHint.int_()),
                    initializer=AST.Expression(AST.TypeHint.none()),
                )
            )
        return parameters

    def _is_wildcard(self) -> bool:
        return self._error.is_wildcard_status_code is True

    def _write_constructor_body(self, writer: AST.NodeWriter) -> None:
        status_code = (
            f"{ErrorGenerator._STATUS_CODE_PARAMETER_NAME} if {ErrorGenerator._STATUS_CODE_PARAMETER_NAME} is not None else {self._error.status_code}"
            if self._is_wildcard()
            else f"{self._error.status_code}"
        )
        writer.write_node(
            self._context.core_utilities.instantiate_api_error_from_subclass(
                status_code=AST.Expression(status_code),
                body=AST.Expression(ErrorGenerator._BODY_PARAMETER_NAME) if self._error.type is not None else None,
                headers=AST.Expression(ErrorGenerator._HEADERS_PARAMETER_NAME),
            )
        )

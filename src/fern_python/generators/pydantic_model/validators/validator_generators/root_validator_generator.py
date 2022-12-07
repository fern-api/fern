from fern_python.codegen import AST
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.pydantic_codegen import PydanticModel

from .validator_generator import ValidatorGenerator


class RootValidatorGenerator(ValidatorGenerator):
    _DECORATOR_FUNCTION_NAME = "root"
    _DECORATOR_PRE_ARGUMENT = "pre"

    _ROOT_VALIDATOR_PROTOCOL_NAME = "_RootValidator"
    _CALLABLE_PARAMETER_PREFIX = "__"
    _VALIDATOR_PARAMETER_NAME = "validator"

    def add_validator_to_model(self) -> None:
        for pre in [True, False]:
            prefix = "pre" if pre else "post"
            self._model.add_root_validator(
                validator_name=f"_{prefix}_validate",
                body=AST.CodeWriter(self._get_write_validator_body(pre)),
                should_use_partial_type=True,
                pre=pre,
            )

    def _get_write_validator_body(self, pre: bool) -> CodeWriterFunction:
        def _write_validator_body(writer: AST.NodeWriter) -> None:
            INDIVIDUAL_VALIDATOR_NAME = "validator"

            writer.write(f"for {INDIVIDUAL_VALIDATOR_NAME} in ")
            writer.write_line(
                ".".join(
                    (
                        *self._reference_to_validators_class,
                        self._get_validator_class_var(pre),
                    )
                )
                + ":"
            )

            with writer.indent():
                writer.write(f"{PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME} = ")
                writer.write_node(
                    AST.FunctionInvocation(
                        function_definition=AST.Reference(
                            qualified_name_excluding_import=(INDIVIDUAL_VALIDATOR_NAME,),
                        ),
                        args=[AST.Expression(PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME)],
                    )
                )
                writer.write_line()

            writer.write_line(f"return {PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME}")

        return _write_validator_body

    def add_class_var_to_validators_class(self, validators_class: AST.ClassDeclaration, pre: bool = False) -> None:
        validators_class.add_class_var(
            AST.VariableDeclaration(
                name=self._get_validator_class_var(pre),
                type_hint=AST.TypeHint.class_var(AST.TypeHint.list(self._get_type_of_validator())),
                initializer=AST.Expression("[]"),
            )
        )

    def _get_validator_class_var(self, pre: bool) -> str:
        prefix = "pre" if pre else "post"
        return f"_{prefix}_validators"

    def add_decorator_to_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        validators_class.add_method(
            declaration=AST.FunctionDeclaration(
                name=RootValidatorGenerator._DECORATOR_FUNCTION_NAME,
                signature=AST.FunctionSignature(
                    named_parameters=[
                        AST.FunctionParameter(
                            name=RootValidatorGenerator._DECORATOR_PRE_ARGUMENT,
                            type_hint=AST.TypeHint.bool_(),
                            initializer=AST.Expression("False"),
                        )
                    ],
                    return_type=self._get_type_of_validator(),
                ),
                body=AST.CodeWriter(self._write_root_validator_body),
            ),
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
        )

    def _write_root_validator_body(self, writer: AST.NodeWriter) -> None:
        DECORATOR_FUNCTION_NAME = "decorator"

        def write_decorator_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"if {RootValidatorGenerator._DECORATOR_PRE_ARGUMENT}:")
            with writer.indent():
                append_statement = self._get_validator_append_statement(True)
                writer.write_node(append_statement)
            writer.write_newline_if_last_line_not()
            writer.write_line("else:")
            with writer.indent():
                append_statement = self._get_validator_append_statement(False)
                writer.write_node(append_statement)
            writer.write_line()
            writer.write(f"return {RootValidatorGenerator._VALIDATOR_PARAMETER_NAME}")

        decorator = AST.FunctionDeclaration(
            name=DECORATOR_FUNCTION_NAME,
            signature=AST.FunctionSignature(
                parameters=[AST.FunctionParameter(name="validator", type_hint=AST.TypeHint.any())],
                return_type=AST.TypeHint.any(),
            ),
            body=AST.CodeWriter(write_decorator_body),
        )

        writer.write_node(decorator)
        writer.write(f"return {DECORATOR_FUNCTION_NAME}")

    def _get_validator_append_statement(self, pre: bool) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                qualified_name_excluding_import=(
                    "cls",
                    self._get_validator_class_var(pre),
                    "append",
                )
            ),
            args=[AST.Expression(RootValidatorGenerator._VALIDATOR_PARAMETER_NAME)],
        )

    def _get_type_of_validator(self) -> AST.TypeHint:
        return AST.TypeHint(
            type=AST.ClassReference(
                qualified_name_excluding_import=self._reference_to_validators_class
                + (RootValidatorGenerator._ROOT_VALIDATOR_PROTOCOL_NAME,)
            )
        )

    def write_example_for_docstring(self, writer: AST.NodeWriter) -> None:

        reference_to_decorator = ".".join(
            (*self._reference_to_validators_class, RootValidatorGenerator._DECORATOR_FUNCTION_NAME)
        )

        reference_to_partial = self._model.get_reference_to_partial_class()

        with writer.indent():
            writer.write("@")
            writer.write_line(reference_to_decorator)

            writer.write("def validate(values: ")
            writer.write_reference(reference_to_partial)
            writer.write(") -> ")
            writer.write_reference(reference_to_partial)
            writer.write_line(":")

            with writer.indent():
                writer.write_line("...")

    def get_protocol_declaration(self) -> AST.ClassDeclaration:
        validator_protocol = AST.ClassDeclaration(
            name=RootValidatorGenerator._ROOT_VALIDATOR_PROTOCOL_NAME,
            extends=[
                AST.ClassReference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in("typing_extensions")),
                    qualified_name_excluding_import=("Protocol",),
                )
            ],
        )

        validator_protocol.add_method(
            declaration=AST.FunctionDeclaration(
                name="__call__",
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=RootValidatorGenerator._CALLABLE_PARAMETER_PREFIX
                            + PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME,
                            type_hint=AST.TypeHint(type=self._model.get_reference_to_partial_class()),
                        ),
                    ],
                    return_type=AST.TypeHint(self._model.get_reference_to_partial_class()),
                ),
                body=AST.CodeWriter("..."),
            )
        )

        return validator_protocol

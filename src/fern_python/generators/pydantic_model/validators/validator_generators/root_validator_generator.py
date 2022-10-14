from fern_python.codegen import AST
from fern_python.pydantic_codegen import PydanticModel

from .validator_generator import ValidatorGenerator


class RootValidatorGenerator(ValidatorGenerator):
    _DECORATOR_FUNCTION_NAME = "root"
    _VALIDATOR_CLASS_VALIDATORS_CLASS_VAR = "_validators"

    def add_validator_to_model(self) -> None:
        self._model.add_root_validator(
            validator_name="_validate", body=AST.CodeWriter(self._write_validator_body), should_use_partial_type=True
        )

    def _write_validator_body(self, writer: AST.NodeWriter) -> None:
        INDIVIDUAL_VALIDATOR_NAME = "validator"

        writer.write(f"for {INDIVIDUAL_VALIDATOR_NAME} in ")
        writer.write_line(
            ".".join(
                (
                    *self._reference_to_validators_class,
                    RootValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR,
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

    def add_class_var_to_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        validators_class.add_class_var(
            AST.VariableDeclaration(
                name=RootValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR,
                type_hint=AST.TypeHint.class_var(AST.TypeHint.list(self._get_validator_type())),
                initializer=AST.Expression("[]"),
            )
        )

    def _get_validator_type(self) -> AST.TypeHint:
        partial_type = AST.TypeHint(type=self._model.get_reference_to_partial_class())
        return AST.TypeHint.callable([partial_type], partial_type)

    def add_decorator_to_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        VALIDATOR_PARAMETER = "validator"
        validator_type = self._get_validator_type()

        def write_decorator_body(writer: AST.NodeWriter) -> None:
            writer.write_line(
                f"cls.{RootValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR}"
                + f".append({VALIDATOR_PARAMETER})"
            )
            writer.write_line(f"return {VALIDATOR_PARAMETER}")

        validators_class.add_method(
            declaration=AST.FunctionDeclaration(
                name=RootValidatorGenerator._DECORATOR_FUNCTION_NAME,
                signature=AST.FunctionSignature(
                    parameters=[AST.FunctionParameter(name=VALIDATOR_PARAMETER, type_hint=validator_type)],
                    return_type=validator_type,
                ),
                body=AST.CodeWriter(write_decorator_body),
            ),
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
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

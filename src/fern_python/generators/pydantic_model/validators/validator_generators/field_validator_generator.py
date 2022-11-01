from typing import Tuple

from fern_python.codegen import AST
from fern_python.pydantic_codegen import PydanticField, PydanticModel

from .validator_generator import ValidatorGenerator


class FieldValidatorGenerator(ValidatorGenerator):
    # Adding this prefix allows users to customize parameter names
    _CALLABLE_PARAMETER_PREFIX = "__"

    _DECORATOR_FIELD_NAME_ARGUMENT = "field_name"
    _VALIDATOR_PARAMETER_NAME = "validator"

    def __init__(self, field: PydanticField, model: PydanticModel, reference_to_validators_class: Tuple[str, ...]):
        super().__init__(model=model, reference_to_validators_class=reference_to_validators_class)
        self.field = field

    def add_validator_to_model(self) -> None:
        self._model.add_field_validator(
            validator_name=f"_validate_{self.field.name}",
            field_name=self.field.name,
            field_type=self.field.type_hint,
            body=AST.CodeWriter(self._write_validator_body),
        )

    def get_validator_class_var(self) -> str:
        return f"_{self.field.name}_validators"

    def _write_validator_body(self, writer: AST.NodeWriter) -> None:
        field_value_parameter_name = PydanticModel.VALIDATOR_FIELD_VALUE_PARAMETER_NAME

        INDIVIDUAL_VALIDATOR_NAME = "validator"
        writer.write(f"for {INDIVIDUAL_VALIDATOR_NAME} in ")
        writer.write_line(".".join((*self._reference_to_validators_class, self.get_validator_class_var())) + ":")

        with writer.indent():
            writer.write(f"{field_value_parameter_name} = ")
            writer.write_node(
                AST.FunctionInvocation(
                    function_definition=AST.Reference(
                        qualified_name_excluding_import=(INDIVIDUAL_VALIDATOR_NAME,),
                    ),
                    args=[
                        AST.Expression(field_value_parameter_name),
                        AST.Expression(PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME),
                    ],
                )
            )
            writer.write_line()
        writer.write_line(f"return {field_value_parameter_name}")

    def get_class_var_for_validators_class(self) -> AST.VariableDeclaration:
        return AST.VariableDeclaration(
            name=self.get_validator_class_var(),
            type_hint=AST.TypeHint.class_var(AST.TypeHint.list(self._get_type_of_validator())),
            initializer=AST.Expression("[]"),
        )

    def get_overload_for_validators_class(self) -> AST.FunctionSignature:
        return AST.FunctionSignature(
            parameters=[
                AST.FunctionParameter(
                    name=FieldValidatorGenerator._DECORATOR_FIELD_NAME_ARGUMENT,
                    type_hint=AST.TypeHint.literal(AST.Expression(f'"{self.field.name}"')),
                )
            ],
            return_type=AST.TypeHint.callable([self._get_type_of_validator()], self._get_type_of_validator()),
        )

    def _get_type_of_validator(self) -> AST.TypeHint:
        return AST.TypeHint(
            type=AST.ClassReference(
                qualified_name_excluding_import=self._reference_to_validators_class
                + (self.get_validator_protocol_name(),)
            )
        )

    def get_validator_protocol_name(self) -> str:
        return f"{self.field.pascal_case_field_name}Validator"

    def write_example_for_docstring(
        self,
        writer: AST.NodeWriter,
        *,
        reference_to_decorator: Tuple[str, ...],
    ) -> None:
        field_name = self.field.name
        field_type = self.field.type_hint

        with writer.indent():
            writer.write("@")
            writer.write(".".join(reference_to_decorator))
            writer.write_line(f'("{field_name}")')

            writer.write(f"def validate_{field_name}({field_name}: ")
            writer.write_node(field_type)
            values_parameter_name = (
                PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME
                if field_name != PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME
                else "other_fields"
            )
            writer.write(f", {values_parameter_name}: ")
            writer.write_node(AST.ReferenceNode(self._model.get_reference_to_partial_class()))

            writer.write(") -> ")
            writer.write_node(field_type)
            writer.write_line(":")

            with writer.indent():
                writer.write_line("...")

    def get_protocol_declaration(self) -> AST.ClassDeclaration:
        validator_protocol = AST.ClassDeclaration(
            name=self.get_validator_protocol_name(),
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
                            name=FieldValidatorGenerator._CALLABLE_PARAMETER_PREFIX
                            + PydanticModel.VALIDATOR_FIELD_VALUE_PARAMETER_NAME,
                            type_hint=self.field.type_hint,
                        ),
                        AST.FunctionParameter(
                            name=FieldValidatorGenerator._CALLABLE_PARAMETER_PREFIX
                            + PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME,
                            type_hint=AST.TypeHint(type=self._model.get_reference_to_partial_class()),
                        ),
                    ],
                    return_type=self.field.type_hint,
                ),
                body=AST.CodeWriter("..."),
            )
        )

        return validator_protocol

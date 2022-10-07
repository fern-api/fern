from fern_python.codegen import AST
from fern_python.pydantic_codegen import PydanticField

from .validator_generator import ValidatorGenerator


class FieldValidatorsGenerator(ValidatorGenerator):
    _VALIDATOR_VALUE_ARGUMENT = "values"
    _VALIDATOR_CLASS_VALIDATORS_CLASS_VAR = "_validators"
    _VALIDATOR_PARAMETER_NAME = "validator"
    _DECORATOR_FIELD_NAME_ARGUMENT = "field_name"

    def _add_validators_to_model(self) -> None:
        for field in self._model.get_public_fields():
            self._model.add_field_validator(
                validator_name=f"_validate_{field.name}",
                field_name=field.name,
                field_parameter_name=self._get_validator_parameter_name(field),
                field_type=field.type_hint,
                body=AST.CodeWriter(self._create_validator_body_writer(field)),
            )

    def _add_validators_class_to_model(self) -> None:
        if len(self._model.get_public_fields()) == 0:
            return

        validators_class = AST.ClassDeclaration(
            name=FieldValidatorsGenerator._VALIDATOR_CLASS_NAME,
        )

        for field in self._model.get_public_fields():
            validators_class.add_class_var(
                AST.VariableDeclaration(
                    name=self._get_validator_class_var(field),
                    type_hint=AST.TypeHint.class_var(AST.TypeHint.list(self._get_type_of_validator(field))),
                    initializer=AST.Expression("[]"),
                )
            )

        validators_class.add_method(
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
            declaration=AST.FunctionDeclaration(
                name="field",
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=FieldValidatorsGenerator._DECORATOR_FIELD_NAME_ARGUMENT,
                            type_hint=AST.TypeHint.str_(),
                        )
                    ],
                    return_type=AST.TypeHint.any(),
                ),
                body=AST.CodeWriter(self._write_add_field_validator_body),
                overloads=[
                    AST.FunctionSignature(
                        parameters=[
                            AST.FunctionParameter(
                                name=FieldValidatorsGenerator._DECORATOR_FIELD_NAME_ARGUMENT,
                                type_hint=AST.TypeHint.literal(AST.Expression(f'"{field.name}"')),
                            )
                        ],
                        return_type=AST.TypeHint.callable(
                            [self._get_type_of_validator(field)], self._get_type_of_validator(field)
                        ),
                    )
                    for field in self._model.get_public_fields()
                ],
            ),
        )

        self._model.add_inner_class(validators_class)

    def _create_validator_body_writer(self, field: PydanticField) -> AST.ReferencingCodeWriter:
        def writer(
            writer: AST.NodeWriter,
            reference_resolver: AST.ReferenceResolver,
        ) -> None:
            parameter_name = self._get_validator_parameter_name(field)

            INDIVIDUAL_VALIDATOR_NAME = "validator"
            reference_to_registered_validators = ".".join(
                [
                    self._model.name,
                    FieldValidatorsGenerator._VALIDATOR_CLASS_NAME,
                    self._get_validator_class_var(field),
                ]
            )
            writer.write_line(f"for {INDIVIDUAL_VALIDATOR_NAME} in {reference_to_registered_validators}:")
            with writer.indent():
                writer.write(f"{parameter_name} = ")
                writer.write_node(
                    AST.FunctionInvocation(
                        function_definition=AST.Reference(
                            qualified_name_excluding_import=(INDIVIDUAL_VALIDATOR_NAME,),
                        ),
                        args=[AST.Expression(parameter_name)],
                    )
                )
                writer.write_line()
            writer.write_line(f"return {parameter_name}")

        return writer

    def _get_validator_class_var(self, field: PydanticField) -> str:
        return f"_{field.name}"

    def _get_validator_parameter_name(self, field: PydanticField) -> str:
        return field.name

    def _write_add_field_validator_body(
        self,
        writer: AST.NodeWriter,
        reference_resolver: AST.ReferenceResolver,
    ) -> None:
        DECORATOR_FUNCTION_NAME = "decorator"

        def write_decorator_body(
            writer: AST.NodeWriter,
            reference_resolver: AST.ReferenceResolver,
        ) -> None:
            for i, field in enumerate(self._model.get_public_fields()):
                writer.write("if" if i == 0 else "elif")
                writer.write(f" {FieldValidatorsGenerator._DECORATOR_FIELD_NAME_ARGUMENT} == ")
                writer.write(f'"{field.name}":')
                writer.write_line()
                with writer.indent():
                    append_statement = AST.FunctionInvocation(
                        function_definition=AST.Reference(
                            qualified_name_excluding_import=(
                                "cls",
                                self._get_validator_class_var(field),
                                "append",
                            )
                        ),
                        args=[AST.Expression(FieldValidatorsGenerator._VALIDATOR_PARAMETER_NAME)],
                    )
                    writer.write_node(append_statement)
                writer.write_line()
            writer.write_line("else:")
            with writer.indent():
                writer.write(f'raise RuntimeError("Field does not exist on {self._model.name}: " + ')
                writer.write(FieldValidatorsGenerator._DECORATOR_FIELD_NAME_ARGUMENT)
                writer.write_line(")")
                writer.write_line()
            writer.write(f"return {FieldValidatorsGenerator._VALIDATOR_PARAMETER_NAME}")

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

    def _get_type_of_validator(self, field: PydanticField) -> AST.TypeHint:
        return AST.TypeHint.callable([field.type_hint], field.type_hint)

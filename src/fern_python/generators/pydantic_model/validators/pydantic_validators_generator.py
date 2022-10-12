from typing import Sequence

from fern_python.codegen import AST
from fern_python.pydantic_codegen import PydanticModel

from .validator_generators import FieldValidatorGenerator, ValidatorGenerator
from .validators_generator import ValidatorsGenerator


class PydanticValidatorsGenerator(ValidatorsGenerator):
    _DECORATOR_FUNCTION_NAME = "field"

    def __init__(self, model: PydanticModel):
        super().__init__(model=model)
        self._validator_generators = [
            FieldValidatorGenerator(
                field=field,
                model=self._model,
                reference_to_validators_class=self._get_reference_to_validators_class(),
            )
            for field in model.get_public_fields()
        ]

    def _populate_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        self._add_field_validators_to_validators_class(validators_class=validators_class)

    def _add_field_validators_to_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        if len(self._validator_generators) == 0:
            return

        for generator in self._validator_generators:
            validators_class.add_class_var(generator.get_class_var_for_validators_class())

        validators_class.add_method(
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
            declaration=AST.FunctionDeclaration(
                name=PydanticValidatorsGenerator._DECORATOR_FUNCTION_NAME,
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=FieldValidatorGenerator._DECORATOR_FIELD_NAME_ARGUMENT,
                            type_hint=AST.TypeHint.str_(),
                        )
                    ],
                    return_type=AST.TypeHint.any(),
                ),
                body=AST.CodeWriter(self._write_add_field_validator_body),
                overloads=[generator.get_overload_for_validators_class() for generator in self._validator_generators],
            ),
        )

        for generator in self._validator_generators:
            validator_protocol = AST.ClassDeclaration(
                name=generator.get_validator_protocol_name(),
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
                                name=PydanticModel.VALIDATOR_FIELD_VALUE_PARAMETER_NAME,
                                type_hint=generator.field.type_hint,
                            ),
                        ],
                        named_parameters=[
                            AST.FunctionParameter(
                                name=PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME,
                                type_hint=AST.TypeHint(type=self._model.get_reference_to_partial_class()),
                            ),
                        ],
                        return_type=generator.field.type_hint,
                    ),
                    body=AST.CodeWriter("..."),
                )
            )
            validators_class.add_class(declaration=validator_protocol)

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
            for generator in self._validator_generators:
                writer.write(f"if {FieldValidatorGenerator._DECORATOR_FIELD_NAME_ARGUMENT} == ")
                writer.write(f'"{generator.field.name}":')
                writer.write_line()
                with writer.indent():
                    append_statement = AST.FunctionInvocation(
                        function_definition=AST.Reference(
                            qualified_name_excluding_import=(
                                "cls",
                                generator.get_validator_class_var(),
                                "append",
                            )
                        ),
                        args=[AST.Expression(FieldValidatorGenerator._VALIDATOR_PARAMETER_NAME)],
                    )
                    writer.write_node(append_statement)
                writer.write_line()
            writer.write(f"return {FieldValidatorGenerator._VALIDATOR_PARAMETER_NAME}")

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

    def _get_validator_generators(self) -> Sequence[ValidatorGenerator]:
        return self._validator_generators

    def _write_examples_for_docstring(self, writer: AST.NodeWriter) -> None:
        for generator in self._validator_generators:
            writer.write_line()
            generator.write_example_for_docstring(
                writer=writer,
                reference_to_decorator=(
                    *self._get_reference_to_validators_class(),
                    PydanticValidatorsGenerator._DECORATOR_FUNCTION_NAME,
                ),
            )

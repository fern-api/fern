from typing import List, Sequence

from .validator_generators import (
    FieldValidatorGenerator,
    RootValidatorGenerator,
    ValidatorGenerator,
)
from .validators_generator import ValidatorsGenerator

from fern_python.codegen import AST
from fern_python.pydantic_codegen import PydanticModel
from fern_python.pydantic_codegen.pydantic_field import PydanticField


class PydanticValidatorsGenerator(ValidatorsGenerator):
    _DECORATOR_FUNCTION_NAME = "field"

    def __init__(self, model: PydanticModel, extended_pydantic_fields: List[PydanticField], unique_name: List[str]):
        super().__init__(model=model)
        reference_to_validators_class = self._get_reference_to_validators_class()

        self._field_validator_generators = []
        for field in model.get_public_fields():
            field_validator_generator = FieldValidatorGenerator(
                field=field,
                model=self._model,
                reference_to_validators_class=reference_to_validators_class,
            )
            self._field_validator_generators.append(field_validator_generator)
        for field in extended_pydantic_fields:
            field_validator_generator = FieldValidatorGenerator(
                field=field,
                model=self._model,
                reference_to_validators_class=reference_to_validators_class,
                extended=True,
            )
            self._field_validator_generators.append(field_validator_generator)

        self._root_validator_generator = RootValidatorGenerator(
            model=self._model,
            reference_to_validators_class=reference_to_validators_class,
            unique_model_name=unique_name,
        )

    def _populate_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        self._add_validators_to_validators_class(validators_class=validators_class)

    def _add_validators_to_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        for pre in [True, False]:
            self._root_validator_generator.add_class_var_to_validators_class(validators_class=validators_class, pre=pre)

        for generator in self._field_validator_generators:
            for pre in [True, False]:
                validators_class.add_class_var(generator.get_class_var_for_validators_class(pre))

        self._root_validator_generator.add_decorator_to_validators_class(validators_class=validators_class)

        if len(self._field_validator_generators) > 0:
            self._add_field_validator_decorator_to_validators_class(validators_class=validators_class)
            for generator in self._field_validator_generators:
                for pre in [True, False]:
                    validators_class.add_class(declaration=generator.get_protocol_declaration(pre))

        for pre in [True, False]:
            validators_class.add_class(declaration=self._root_validator_generator.get_protocol_declaration(pre))

    def _add_field_validator_decorator_to_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        overloads = []
        for generator in self._field_validator_generators:
            overloads.append(generator.get_overload_for_validators_class(True))
            overloads.append(generator.get_overload_for_validators_class(False))

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
                    named_parameters=[
                        AST.NamedFunctionParameter(
                            name=FieldValidatorGenerator._DECORATOR_PRE_ARGUMENT,
                            type_hint=AST.TypeHint.bool_(),
                            initializer=AST.Expression("False"),
                        )
                    ],
                    return_type=AST.TypeHint.any(),
                ),
                body=AST.CodeWriter(self._write_add_field_validator_body),
                overloads=overloads,
            ),
        )

    def _write_add_field_validator_body(self, writer: AST.NodeWriter) -> None:
        DECORATOR_FUNCTION_NAME = "decorator"

        def write_decorator_body(writer: AST.NodeWriter) -> None:
            for generator in self._field_validator_generators:
                writer.write(f"if {FieldValidatorGenerator._DECORATOR_FIELD_NAME_ARGUMENT} == ")
                writer.write(f'"{generator.field.name}":')
                writer.write_line()
                with writer.indent():
                    writer.write_line(f"if {FieldValidatorGenerator._DECORATOR_PRE_ARGUMENT}:")
                    with writer.indent():
                        append_statement = self._get_validator_append_statement(generator, True)
                        writer.write_node(append_statement)
                    writer.write_newline_if_last_line_not()
                    writer.write_line("else:")
                    with writer.indent():
                        append_statement = self._get_validator_append_statement(generator, False)
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

    def _get_validator_append_statement(self, generator: FieldValidatorGenerator, pre: bool) -> AST.FunctionInvocation:
        return AST.FunctionInvocation(
            function_definition=AST.Reference(
                qualified_name_excluding_import=(
                    "cls",
                    generator.get_validator_class_var(pre),
                    "append",
                )
            ),
            args=[AST.Expression(FieldValidatorGenerator._VALIDATOR_PARAMETER_NAME)],
        )

    def _get_validator_generators(self) -> Sequence[ValidatorGenerator]:
        root_list: List[ValidatorGenerator] = [self._root_validator_generator]
        field_list: List[ValidatorGenerator] = list(self._field_validator_generators)
        return root_list + field_list

    def _write_examples_for_docstring(self, writer: AST.NodeWriter) -> None:
        writer.write_line()
        self._root_validator_generator.write_example_for_docstring(writer=writer)

        for generator in self._field_validator_generators:
            writer.write_line()
            generator.write_example_for_docstring(
                writer=writer,
                reference_to_decorator=(
                    *self._get_reference_to_validators_class(),
                    PydanticValidatorsGenerator._DECORATOR_FUNCTION_NAME,
                ),
            )

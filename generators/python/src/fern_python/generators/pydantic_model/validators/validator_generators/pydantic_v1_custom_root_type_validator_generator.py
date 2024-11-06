from typing import Tuple

from fern_python.codegen import AST
from fern_python.external_dependencies.pydantic import PydanticVersionCompatibility
from fern_python.pydantic_codegen import PydanticModel

from .validator_generator import ValidatorGenerator


class PydanticV1CustomRootTypeValidatorGenerator(ValidatorGenerator):
    _DECORATOR_FUNCTION_NAME = "validate"
    _VALIDATOR_CLASS_VALIDATORS_CLASS_VAR = "_validators"

    def __init__(self, root_type: AST.TypeHint, model: PydanticModel, reference_to_validators_class: Tuple[str, ...]):
        super().__init__(model=model, reference_to_validators_class=reference_to_validators_class)
        self._root_type = root_type

    def add_validator_to_model(self) -> None:
        self._model.add_root_validator(
            validator_name="_validate",
            body=AST.CodeWriter(self._write_validator_body),
        )

    def _write_validator_body(self, writer: AST.NodeWriter) -> None:
        ROOT_VARIABLE_NAME = "value"
        INDIVIDUAL_VALIDATOR_NAME = "validator"

        writer.write(f"{ROOT_VARIABLE_NAME} = ")
        writer.write_node(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=("cast",),
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("typing",))),
                ),
                args=[
                    AST.Expression(self._root_type),
                    AST.Expression(
                        f'{PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME}.get("{self._get_root_property_name()}")'
                    ),
                ],
            ),
        )
        writer.write_line()

        writer.write(f"for {INDIVIDUAL_VALIDATOR_NAME} in ")
        writer.write_line(
            ".".join(
                (
                    *self._reference_to_validators_class,
                    PydanticV1CustomRootTypeValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR,
                )
            )
            + ":"
        )

        with writer.indent():
            writer.write(f"{ROOT_VARIABLE_NAME} = ")
            writer.write_node(
                AST.FunctionInvocation(
                    function_definition=AST.Reference(
                        qualified_name_excluding_import=(INDIVIDUAL_VALIDATOR_NAME,),
                    ),
                    args=[AST.Expression(ROOT_VARIABLE_NAME)],
                )
            )
            writer.write_line()
        writer.write_line(
            "return "
            + f'{{ **{PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME}, "{self._get_root_property_name()}": {ROOT_VARIABLE_NAME} }}'
        )

    def add_to_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        VALIDATOR_PARAMETER = "validator"

        validator_type = AST.TypeHint.callable([self._root_type], self._root_type)
        validators_class.add_class_var(
            AST.VariableDeclaration(
                name=PydanticV1CustomRootTypeValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR,
                type_hint=AST.TypeHint.class_var(AST.TypeHint.list(validator_type)),
                initializer=AST.Expression("[]"),
            )
        )
        validators_class.add_method(
            declaration=AST.FunctionDeclaration(
                name=PydanticV1CustomRootTypeValidatorGenerator._DECORATOR_FUNCTION_NAME,
                signature=AST.FunctionSignature(
                    parameters=[AST.FunctionParameter(name=VALIDATOR_PARAMETER, type_hint=validator_type)],
                    return_type=AST.TypeHint.none(),
                ),
                body=AST.CodeWriter(
                    f"cls.{PydanticV1CustomRootTypeValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR}"
                    + f".append({VALIDATOR_PARAMETER})"
                ),
            ),
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
        )

    def write_example_for_docstring(self, writer: AST.NodeWriter) -> None:

        reference_to_decorator = ".".join(
            (*self._reference_to_validators_class, PydanticV1CustomRootTypeValidatorGenerator._DECORATOR_FUNCTION_NAME)
        )

        with writer.indent():
            writer.write("@")
            writer.write_line(reference_to_decorator)

            writer.write("def validate(value: ")
            writer.write_node(self._root_type)
            writer.write(") -> ")
            writer.write_node(self._root_type)
            writer.write_line(":")

            with writer.indent():
                writer.write_line("...")

    def _get_root_property_name(self) -> str:
        return "__root__"

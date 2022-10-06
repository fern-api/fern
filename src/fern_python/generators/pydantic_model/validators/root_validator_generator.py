from fern_python.codegen import AST
from fern_python.pydantic_codegen import PydanticModel

from .validator_generator import ValidatorGenerator


class RootValidatorGenerator(ValidatorGenerator):
    _VALIDATOR_VALUE_ARGUMENT = "values"
    _VALIDATOR_CLASS_VALIDATORS_CLASS_VAR = "_validators"

    def __init__(self, model: PydanticModel, root_type: AST.TypeHint):
        super().__init__(model=model)
        self._root_type = root_type

    def _add_validators_to_model(self) -> None:
        self._model.add_root_validator(
            validator_name="_validate",
            value_argument_name=RootValidatorGenerator._VALIDATOR_VALUE_ARGUMENT,
            body=AST.CodeWriter(self._write_validator_body),
        )

    def _write_validator_body(
        self,
        writer: AST.NodeWriter,
        reference_resolver: AST.ReferenceResolver,
    ) -> None:
        ROOT_VARIABLE_NAME = "value"
        INDIVIDUAL_VALIDATOR_NAME = "validator"

        writer.write(f"{ROOT_VARIABLE_NAME} = ")
        writer.write_node(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=("cast",),
                    import_=AST.ReferenceImport(module=AST.Module.built_in("typing")),
                ),
                args=[
                    AST.Expression(self._root_type),
                    AST.Expression(f'{RootValidatorGenerator._VALIDATOR_VALUE_ARGUMENT}.get("__root__")'),
                ],
            ),
        )
        writer.write_line()

        reference_to_registered_validators = ".".join(
            [
                self._model.name,
                RootValidatorGenerator._VALIDATOR_CLASS_NAME,
                RootValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR,
            ]
        )
        writer.write_line(f"for {INDIVIDUAL_VALIDATOR_NAME} in {reference_to_registered_validators}:")
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
            f'return {{ **{RootValidatorGenerator._VALIDATOR_VALUE_ARGUMENT}, "__root__": {ROOT_VARIABLE_NAME} }}'
        )

    def _add_validators_class_to_model(self) -> None:
        VALIDATOR_PARAMETER = "validator"

        validator_type = AST.TypeHint.callable([self._root_type], self._root_type)
        validators_class = AST.ClassDeclaration(
            name=RootValidatorGenerator._VALIDATOR_CLASS_NAME,
        )
        validators_class.add_class_var(
            AST.VariableDeclaration(
                name=RootValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR,
                type_hint=AST.TypeHint.class_var(AST.TypeHint.list(validator_type)),
                initializer=AST.Expression("[]"),
            )
        )
        validators_class.add_method(
            declaration=AST.FunctionDeclaration(
                name="validate",
                signature=AST.FunctionSignature(
                    parameters=[AST.FunctionParameter(name=VALIDATOR_PARAMETER, type_hint=validator_type)],
                    return_type=AST.TypeHint.none(),
                ),
                body=AST.CodeWriter(
                    f"cls.{RootValidatorGenerator._VALIDATOR_CLASS_VALIDATORS_CLASS_VAR}"
                    + f".append({VALIDATOR_PARAMETER})"
                ),
            ),
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
        )
        self._model.add_inner_class(validators_class)

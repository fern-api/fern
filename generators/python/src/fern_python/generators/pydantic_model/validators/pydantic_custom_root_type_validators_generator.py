from typing import Any, Sequence

from fern_python.codegen import AST
from fern_python.external_dependencies.pydantic import PydanticVersionCompatibility
from fern_python.pydantic_codegen import PydanticModel

from .validator_generators import (
    PydanticV1CustomRootTypeValidatorGenerator,
    PydanticV2CustomRootTypeValidatorGenerator,
    ValidatorGenerator,
)
from .validators_generator import ValidatorsGenerator


class PydanticCustomRootTypeValidatorsGenerator(ValidatorsGenerator):
    def __init__(self, root_type: AST.TypeHint, model: PydanticModel):
        super().__init__(model=model)
        self._root_type = root_type
        if self._model._version == PydanticVersionCompatibility.V1:
            self._root_type_generator: Any = PydanticV1CustomRootTypeValidatorGenerator(
                root_type=root_type,
                model=model,
                reference_to_validators_class=self._get_reference_to_validators_class(),
            )
        else:
            self._root_type_generator: Any = PydanticV2CustomRootTypeValidatorGenerator(
                root_type=root_type,
                model=model,
                reference_to_validators_class=self._get_reference_to_validators_class(),
            )

    def _populate_validators_class(self, validators_class: AST.ClassDeclaration) -> None:
        self._root_type_generator.add_to_validators_class(validators_class)

    def _get_validator_generators(self) -> Sequence[ValidatorGenerator]:
        return [self._root_type_generator]

    def _write_examples_for_docstring(self, writer: AST.NodeWriter) -> None:
        writer.write_line()
        self._root_type_generator.write_example_for_docstring(writer=writer)

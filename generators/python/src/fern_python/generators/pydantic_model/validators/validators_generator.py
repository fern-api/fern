from abc import ABC, abstractmethod
from typing import Sequence, Tuple

from .validator_generators import ValidatorGenerator

from fern_python.codegen import AST
from fern_python.pydantic_codegen import PydanticModel


class ValidatorsGenerator(ABC):
    _VALIDATOR_CLASS_NAME = "Validators"

    def __init__(self, model: PydanticModel):
        self._model = model

    def add_validators(self) -> None:
        validators_class = AST.ClassDeclaration(
            name=ValidatorsGenerator._VALIDATOR_CLASS_NAME,
            docstring=AST.Docstring(self._write_validators_class_docstring),
        )
        self._populate_validators_class(validators_class=validators_class)
        self._model.add_inner_class(inner_class=validators_class)

        for generator in self._get_validator_generators():
            generator.add_validator_to_model()

        self._finish()

    def _get_reference_to_validators_class(self) -> Tuple[str, ...]:
        return (self._model.name, ValidatorsGenerator._VALIDATOR_CLASS_NAME)

    def _write_validators_class_docstring(self, writer: AST.NodeWriter) -> None:
        writer.write_line("Use this class to add validators to the Pydantic model.")
        self._write_examples_for_docstring(writer=writer)

    @abstractmethod
    def _populate_validators_class(self, validators_class: AST.ClassDeclaration) -> None: ...

    @abstractmethod
    def _get_validator_generators(self) -> Sequence[ValidatorGenerator]: ...

    @abstractmethod
    def _write_examples_for_docstring(self, writer: AST.NodeWriter) -> None: ...

    def _finish(self) -> None:
        pass

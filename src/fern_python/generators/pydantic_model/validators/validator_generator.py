from abc import ABC, abstractmethod

from fern_python.pydantic_codegen import PydanticModel


class ValidatorGenerator(ABC):
    _VALIDATOR_CLASS_NAME = "Validators"

    def __init__(self, model: PydanticModel):
        self._model = model

    def add_validators(self) -> None:
        self._add_validators_to_model()
        self._add_validators_class_to_model()

    @abstractmethod
    def _add_validators_to_model(self) -> None:
        ...

    @abstractmethod
    def _add_validators_class_to_model(self) -> None:
        ...

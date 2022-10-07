from typing import Generic, TypeVar

from fern_python.declaration_referencer import AbstractDeclarationReferencer

T = TypeVar("T")


class FastApiDeclarationReferencer(AbstractDeclarationReferencer[T], Generic[T]):
    def _get_generator_name_for_containing_folder(self) -> str:
        return "fastapi"

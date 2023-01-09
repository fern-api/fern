from abc import ABC, abstractmethod
from typing import Callable, Generic, Optional, Tuple, TypeVar

import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, ExportStrategy, Filepath

from .fern_filepath_creator import FernFilepathCreator

T = TypeVar("T")


class AbstractDeclarationReferencer(ABC, Generic[T]):
    def __init__(self, filepath_creator: FernFilepathCreator):
        super().__init__()
        self._filepath_creator = filepath_creator

    def get_class_reference(
        self,
        *,
        name: T,
        must_import_after_current_declaration: Optional[Callable[[T], bool]] = None,
    ) -> AST.ClassReference:
        filepath = self.get_filepath(name=name)
        return AST.ClassReference(
            import_=AST.ReferenceImport(
                module=filepath.to_module(),
                named_import=self.get_class_name(name=name),
            ),
            qualified_name_excluding_import=(),
            must_import_after_current_declaration=must_import_after_current_declaration(name)
            if must_import_after_current_declaration is not None
            else False,
        )

    @abstractmethod
    def get_filepath(self, *, name: T) -> Filepath:
        ...

    @abstractmethod
    def get_class_name(self, *, name: T) -> str:
        ...

    def _get_directories_for_fern_filepath(
        self,
        *,
        fern_filepath: ir_types.FernFilepath,
    ) -> Tuple[Filepath.DirectoryFilepathPart, ...]:
        fern_filepath_parts = fern_filepath.get_as_list()
        return self._filepath_creator.generate_filepath_prefix() + tuple(
            Filepath.DirectoryFilepathPart(
                module_name=fern_filepath_part.snake_case.unsafe_name,
                export_strategy=ExportStrategy.EXPORT_AS_NAMESPACE
                if i < len(fern_filepath_parts) - 1
                else ExportStrategy.EXPORT_ALL,
            )
            for i, fern_filepath_part in enumerate(fern_filepath_parts)
        )

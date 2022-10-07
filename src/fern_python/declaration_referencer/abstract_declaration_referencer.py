from abc import ABC, abstractmethod
from typing import Callable, Generic, Optional, Tuple, TypeVar

import ir as ir_types
from generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST, ExportStrategy, Filepath

T = TypeVar("T")


class AbstractDeclarationReferencer(ABC, Generic[T]):
    def __init__(self, generator_config: GeneratorConfig, ir: ir_types.IntermediateRepresentation):
        super().__init__()
        self._generator_config = generator_config
        self._ir = ir

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
    def _get_generator_name_for_containing_folder(self) -> str:
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
        default_directories = tuple(
            Filepath.DirectoryFilepathPart(
                module_name=fern_filepath_part.snake_case,
                export_strategy=ExportStrategy.EXPORT_AS_NAMESPACE
                if i < len(fern_filepath_parts) - 1
                else ExportStrategy.EXPORT_ALL,
            )
            for i, fern_filepath_part in enumerate(fern_filepath_parts)
        )
        return self._generator_config.output.mode.visit(
            download_files=lambda: default_directories,
            publish=lambda x: (
                Filepath.DirectoryFilepathPart(
                    module_name=self._get_generator_name_for_containing_folder(),
                    export_strategy=ExportStrategy.EXPORT_ALL,
                ),
                Filepath.DirectoryFilepathPart(
                    module_name=self._generator_config.organization, export_strategy=ExportStrategy.EXPORT_ALL
                ),
                Filepath.DirectoryFilepathPart(
                    module_name=self._ir.api_name, export_strategy=ExportStrategy.EXPORT_ALL
                ),
            )
            + default_directories,
        )

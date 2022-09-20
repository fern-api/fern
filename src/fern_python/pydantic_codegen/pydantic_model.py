from __future__ import annotations

from types import TracebackType
from typing import Optional, Sequence, Type

from fern_python.codegen import AST, LocalClassReference, SourceFile

from .pydantic_field import PydanticField


def get_reference_to_pydantic_export(export: str) -> AST.ClassReference:
    return AST.ClassReference(
        import_=AST.ReferenceImport(
            module=AST.Module.external(
                dependency=AST.Dependency(name="pydantic", version="^1.9.2"),
                module_path=("pydantic",),
            )
        ),
        qualified_name_excluding_import=(export,),
    )


PYDANTIC_BASE_MODEL_REFERENCE = get_reference_to_pydantic_export("BaseModel")
PYDANTIC_FIELD_REFERENCE = get_reference_to_pydantic_export("Field")


class PydanticModel:
    def __init__(self, source_file: SourceFile, name: str, base_models: Sequence[AST.ClassReference] = None):
        self._source_file = source_file
        self._class_declaration = AST.ClassDeclaration(
            name=name,
            extends=base_models or [PYDANTIC_BASE_MODEL_REFERENCE],
        )
        self._local_class_reference = source_file.add_class_declaration(
            declaration=self._class_declaration,
        )
        self._has_aliases = False

    def to_reference(self) -> LocalClassReference:
        return self._local_class_reference

    def add_field(self, field: PydanticField) -> None:
        initializer = (
            AST.CodeWriter(get_field_name_initializer(json_field_name=field.json_field_name))
            if field.json_field_name != field.name
            else None
        )

        if initializer is not None:
            self._has_aliases = True

        self._class_declaration.add_attribute(
            AST.VariableDeclaration(name=field.name, type_hint=field.type_hint, initializer=initializer)
        )

    def add_root_type(self, root_type: AST.TypeHint) -> None:
        self._class_declaration.add_attribute(AST.VariableDeclaration(name="__root__", type_hint=root_type))

    def add_method(
        self,
        declaration: AST.FunctionDeclaration,
        is_static: bool = False,
    ) -> AST.FunctionDeclaration:
        return self._class_declaration.add_method(
            declaration=declaration,
            is_static=is_static,
        )

    def finish(self) -> None:
        if self._has_aliases:
            config = AST.ClassDeclaration(name="Config")
            config.add_attribute(
                AST.VariableDeclaration(
                    name="allow_population_by_field_name",
                    initializer=AST.CodeWriter("True"),
                )
            )
            self._class_declaration.add_class(declaration=config)

    def __enter__(self) -> PydanticModel:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()


def get_field_name_initializer(json_field_name: str) -> AST.ReferencingCodeWriter:
    def write(writer: AST.NodeWriter, reference_resolver: AST.ReferenceResolver) -> None:
        PydanticField = reference_resolver.resolve_reference(PYDANTIC_FIELD_REFERENCE)
        return writer.write(f'{PydanticField}(alias="{json_field_name}")')

    return write

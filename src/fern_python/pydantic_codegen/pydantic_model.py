from __future__ import annotations

from types import TracebackType
from typing import Optional, Sequence, Type

from fern_python.codegen import AST, ClassParent, LocalClassReference, SourceFile

from .pydantic_exports import (
    PYDANTIC_BASE_MODEL_REFERENCE,
    PYDANTIC_FIELD_REFERENCE,
    PYDANTIC_PRIVATE_ATTR_REFERENCE,
)
from .pydantic_field import PydanticField


class PydanticModel:
    def __init__(
        self,
        source_file: SourceFile,
        name: str,
        base_models: Sequence[AST.ClassReference] = None,
        parent: ClassParent = None,
    ):
        self._source_file = source_file
        self._class_declaration = AST.ClassDeclaration(
            name=name,
            extends=base_models or [PYDANTIC_BASE_MODEL_REFERENCE],
        )
        self._local_class_reference = (parent or source_file).add_class_declaration(declaration=self._class_declaration)
        self._has_aliases = False
        self.frozen = True

    def set_constructor(self, constructor: AST.ClassConstructor) -> None:
        self._class_declaration.constructor = constructor

    def to_reference(self) -> LocalClassReference:
        return self._local_class_reference

    def add_field(self, field: PydanticField) -> None:
        initializer = (
            AST.Expression(AST.CodeWriter(get_field_name_initializer(json_field_name=field.json_field_name)))
            if field.json_field_name != field.name
            else None
        )

        if initializer is not None:
            self._has_aliases = True

        self._class_declaration.add_attribute(
            AST.VariableDeclaration(name=field.name, type_hint=field.type_hint, initializer=initializer)
        )

    def add_private_instance_field(
        self, name: str, type_hint: AST.TypeHint, default_factory: AST.Expression = None
    ) -> None:
        if not name.startswith("_"):
            raise RuntimeError(
                f"Private pydantic field {name} in {self._class_declaration.name} does not start with an underscore"
            )
        self._class_declaration.add_attribute(
            AST.VariableDeclaration(
                name=name,
                type_hint=type_hint,
                initializer=AST.Expression(
                    AST.ClassInstantiation(
                        PYDANTIC_PRIVATE_ATTR_REFERENCE,
                        kwargs=[("default_factory", default_factory)] if default_factory is not None else None,
                    )
                ),
            )
        )

    def add_class_var(self, name: str, type_hint: AST.TypeHint, initializer: AST.Expression = None) -> None:
        self._class_declaration.add_attribute(
            AST.VariableDeclaration(
                name=name,
                type_hint=AST.TypeHint.class_var(class_var_type=type_hint),
                initializer=initializer,
            )
        )

    def set_root_type(self, root_type: AST.TypeHint) -> None:
        self._class_declaration.add_attribute(AST.VariableDeclaration(name="__root__", type_hint=root_type))

    def add_method(
        self,
        declaration: AST.FunctionDeclaration,
        decorator: AST.ClassMethodDecorator = None,
    ) -> AST.FunctionDeclaration:
        return self._class_declaration.add_method(
            declaration=declaration,
            decorator=decorator,
        )

    def add_ghost_reference(self, reference: AST.Reference) -> None:
        self._class_declaration.add_ghost_reference(reference)

    def finish(self) -> None:
        config = AST.ClassDeclaration(name="Config")

        if self.frozen:
            config.add_attribute(
                AST.VariableDeclaration(
                    name="frozen",
                    initializer=AST.Expression("True"),
                )
            )

        if self._has_aliases:
            config.add_attribute(
                AST.VariableDeclaration(
                    name="allow_population_by_field_name",
                    initializer=AST.Expression("True"),
                )
            )

        if len(config.statements) > 0:
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

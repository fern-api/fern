from __future__ import annotations

from typing import Set, Union

from ..ast_node import AstNode, NodeWriter, ReferenceResolver
from ..built_in_module import BuiltInModule
from ..class_ import ClassReference
from ..code_writer import CodeWriter
from ..reference import Reference
from .class_type_hint import ClassTypeHint
from .primitive_type_hint import PrimitiveType, PrimitiveTypeHint


def get_reference_to_typing_import(name: str) -> ClassReference:
    return ClassReference(
        module=("typing",),
        name_inside_import=(name,),
        from_module=BuiltInModule.typing,
    )


class TypeHint(AstNode):
    _type_hint: Union[PrimitiveTypeHint, ClassTypeHint]

    def __init__(
        self,
        type_hint: Union[PrimitiveTypeHint, ClassTypeHint],
    ):
        self._type_hint = type_hint

    @staticmethod
    def primitive(primitive: PrimitiveType) -> TypeHint:
        return TypeHint(PrimitiveTypeHint(primitive))

    @staticmethod
    def optional(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            ClassTypeHint(
                reference=get_reference_to_typing_import("Optional"),
                type_parameters=[wrapped_type],
            )
        )

    @staticmethod
    def list(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            ClassTypeHint(
                reference=get_reference_to_typing_import("List"),
                type_parameters=[wrapped_type],
            )
        )

    @staticmethod
    def dict(key_type: TypeHint, value_type: TypeHint) -> TypeHint:
        return TypeHint(
            ClassTypeHint(
                reference=get_reference_to_typing_import("Dict"),
                type_parameters=[key_type, value_type],
            )
        )

    @staticmethod
    def annotated(type: TypeHint, annotation: CodeWriter) -> TypeHint:
        return TypeHint(
            ClassTypeHint(
                reference=ClassReference(
                    module=("typing_extensions",),
                    name_inside_import=("Annotated",),
                ),
                type_parameters=[annotation],
            )
        )

    @staticmethod
    def class_(reference: ClassReference) -> TypeHint:
        return TypeHint(ClassTypeHint(reference))

    def get_references(self) -> Set[Reference]:
        return self._type_hint.get_references()

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        return self._type_hint.write(writer=writer, reference_resolver=reference_resolver)

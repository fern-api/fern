from __future__ import annotations

from typing import Sequence, Set, Union

from ...ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ...references import ClassReference, Module, Reference, ReferenceImport
from ..expressions import Expression
from .type_parameter import TypeParameter


class TypeHint(AstNode):
    def __init__(
        self,
        type: Union[ClassReference, GenericTypeVar],
        type_parameters: Sequence[TypeParameter] = None,
    ):
        self._type = type
        self._type_parameters = type_parameters or []

    @staticmethod
    def str_() -> TypeHint:
        return TypeHint(type=get_reference_to_built_in_primitive("str"))

    @staticmethod
    def bool_() -> TypeHint:
        return TypeHint(type=get_reference_to_built_in_primitive("bool"))

    @staticmethod
    def int_() -> TypeHint:
        return TypeHint(type=get_reference_to_built_in_primitive("int"))

    @staticmethod
    def float_() -> TypeHint:
        return TypeHint(type=get_reference_to_built_in_primitive("float"))

    @staticmethod
    def none() -> TypeHint:
        return TypeHint(type=get_reference_to_built_in_primitive("None"))

    @staticmethod
    def optional(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Optional"),
            type_parameters=[TypeParameter(wrapped_type)],
        )

    @staticmethod
    def list(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("List"),
            type_parameters=[TypeParameter(wrapped_type)],
        )

    @staticmethod
    def set(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Set"),
            type_parameters=[TypeParameter(wrapped_type)],
        )

    @staticmethod
    def dict(key_type: TypeHint, value_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Dict"),
            type_parameters=[TypeParameter(key_type), TypeParameter(value_type)],
        )

    @staticmethod
    def union(*subtypes: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Union"),
            type_parameters=[TypeParameter(subtype) for subtype in subtypes],
        )

    @staticmethod
    def any() -> TypeHint:
        return TypeHint(type=get_reference_to_typing_import("Optional"))

    @staticmethod
    def generic(generic: GenericTypeVar) -> TypeHint:
        return TypeHint(type=generic)

    @staticmethod
    def callable(parameters: Sequence[TypeHint], return_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Callable"),
            type_parameters=[
                TypeParameter([TypeParameter(parameter) for parameter in parameters]),
                TypeParameter(return_type),
            ],
        )

    @staticmethod
    def annotated(type: TypeHint, annotation: Expression) -> TypeHint:
        return TypeHint(
            type=ClassReference(
                import_=ReferenceImport(
                    module=Module.built_in(
                        "typing_extensions",
                    ),
                ),
                qualified_name_excluding_import=("Annotated",),
            ),
            type_parameters=[TypeParameter(type), TypeParameter(annotation)],
        )

    @staticmethod
    def literal(value: Expression) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Literal"),
            type_parameters=[TypeParameter(value)],
        )

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if isinstance(self._type, Reference):
            references.add(self._type)
        for type_parameter in self._type_parameters:
            references.update(type_parameter.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        if isinstance(self._type, GenericTypeVar):
            generics.add(self._type)
        for type_parameter in self._type_parameters:
            generics.update(type_parameter.get_generics())
        return generics

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(
            self._type.name
            if isinstance(self._type, GenericTypeVar)
            else reference_resolver.resolve_reference(self._type)
        )
        if len(self._type_parameters) > 0:
            writer.write("[")
            for i, type_parameter in enumerate(self._type_parameters):
                type_parameter.write(writer=writer, reference_resolver=reference_resolver)
                if i < len(self._type_parameters) - 1:
                    writer.write(", ")
            writer.write("]")


def get_reference_to_typing_import(name: str) -> ClassReference:
    return ClassReference(
        import_=ReferenceImport(
            module=Module.built_in("typing"),
        ),
        qualified_name_excluding_import=(name,),
    )


def get_reference_to_built_in_primitive(name: str) -> ClassReference:
    return ClassReference(
        qualified_name_excluding_import=(name,),
    )

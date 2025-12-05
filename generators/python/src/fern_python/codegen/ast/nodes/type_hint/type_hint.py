from __future__ import annotations

from typing import Optional, Sequence, Union

from ...ast_node import AstNode, AstNodeMetadata, GenericTypeVar, NodeWriter
from ...references import ClassReference, Module, Reference, ReferenceImport
from ..expressions import Expression
from .type_parameter import TypeParameter
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriter

TYPING_REFERENCE_IMPORT = ReferenceImport(
    module=Module.built_in(("typing",)),
)


class TypeHint(AstNode):
    def __init__(
        self,
        type: Union[ClassReference, GenericTypeVar],
        type_parameters: Optional[Sequence[TypeParameter]] = None,
        arguments: Optional[Sequence[Expression]] = None,
        is_optional: bool = False,
        is_literal: bool = False,
    ):
        self._type = type
        self._type_parameters = type_parameters or []
        self._arguments = arguments or []

        self.is_optional = is_optional
        self.is_literal = is_literal

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
    def datetime() -> TypeHint:
        return TypeHint(type=get_reference_to_datetime_import("datetime"))

    @staticmethod
    def date() -> TypeHint:
        return TypeHint(type=get_reference_to_datetime_import("date"))

    @staticmethod
    def uuid() -> TypeHint:
        return TypeHint(type=get_reference_to_uuid_import("UUID"))

    @staticmethod
    def float_() -> TypeHint:
        return TypeHint(type=get_reference_to_built_in_primitive("float"))

    @staticmethod
    def bytes_or_bytes_stream() -> TypeHint:
        return TypeHint.union(
            TypeHint.bytes(),
            TypeHint.iterator(TypeHint.bytes()),
            TypeHint.async_iterator(TypeHint.bytes()),
        )

    @staticmethod
    def bytes() -> TypeHint:
        return TypeHint(type=get_reference_to_built_in_primitive("bytes"))

    @staticmethod
    def none() -> TypeHint:
        return TypeHint(type=get_reference_to_built_in_primitive("None"))

    @staticmethod
    def not_required(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_extensions_import("NotRequired"),
            type_parameters=[TypeParameter(wrapped_type)],
        )

    @staticmethod
    def tuple_(*subtypes: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Tuple"),
            type_parameters=[TypeParameter(subtype) for subtype in subtypes],
        )

    @staticmethod
    def any_str() -> TypeHint:
        return TypeHint(type=get_reference_to_typing_import("AnyStr"))

    @staticmethod
    def optional(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Optional"),
            type_parameters=[TypeParameter(wrapped_type)],
            is_optional=True,
        )

    @staticmethod
    def iterator(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Iterator"),
            type_parameters=[TypeParameter(wrapped_type)],
        )

    @staticmethod
    def async_iterator(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("AsyncIterator"),
            type_parameters=[TypeParameter(wrapped_type)],
        )

    @staticmethod
    def awaitable(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Awaitable"),
            type_parameters=[TypeParameter(wrapped_type)],
        )

    @staticmethod
    def list(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("List"),
            type_parameters=[TypeParameter(wrapped_type)],
        )

    @staticmethod
    def sequence(wrapped_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Sequence"),
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
    def type_checking() -> TypeHint:
        return TypeHint(type=get_reference_to_typing_import("TYPE_CHECKING"))

    @staticmethod
    def type_checking_reference() -> Reference:
        return get_reference_to_typing_import("TYPE_CHECKING")

    @staticmethod
    def any() -> TypeHint:
        return TypeHint(type=get_reference_to_typing_import("Any"))

    @staticmethod
    def generic(generic: GenericTypeVar) -> TypeHint:
        return TypeHint(type=generic)

    @staticmethod
    def cast(type_casted_to: TypeHint, value_being_casted: Expression) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("cast"),
            arguments=[Expression(type_casted_to), value_being_casted],
        )

    @staticmethod
    def invoke_cast(type_casted_to: TypeHint, value_being_casted: Expression) -> Expression:
        def _write_constructor_body(writer: NodeWriter) -> None:
            writer.write_reference(get_reference_to_typing_import("cast"))
            writer.write("(")
            writer.write_newline_if_last_line_not()
            with writer.indent():
                Expression(type_casted_to).write(writer=writer)
                writer.write(",")
                writer.write_newline_if_last_line_not()
                value_being_casted.write(writer=writer)
            writer.write_newline_if_last_line_not()
            writer.write(")")

        return Expression(CodeWriter(_write_constructor_body))

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
            type=get_reference_to_typing_extensions_import("Annotated"),
            type_parameters=[TypeParameter(type), TypeParameter(annotation)],
        )

    @staticmethod
    def literal(value: Expression) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("Literal"),
            type_parameters=[TypeParameter(value)],
            is_literal=True,
        )

    @staticmethod
    def class_var(class_var_type: TypeHint) -> TypeHint:
        return TypeHint(
            type=get_reference_to_typing_import("ClassVar"),
            type_parameters=[TypeParameter(class_var_type)],
        )

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        if isinstance(self._type, Reference):
            metadata.references.add(self._type)
        if isinstance(self._type, GenericTypeVar):
            metadata.generics.add(self._type)
        for type_parameter in self._type_parameters:
            metadata.update(type_parameter.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if isinstance(self._type, GenericTypeVar):
            writer.write(self._type.name)
        else:
            writer.write_reference(self._type)

        if len(self._type_parameters) > 0:
            writer.write("[")
            just_wrote_parameter = False
            for type_parameter in self._type_parameters:
                if just_wrote_parameter:
                    writer.write(", ")
                type_parameter.write(writer=writer)
                just_wrote_parameter = True
            writer.write("]")

        if len(self._arguments) > 0:
            writer.write("(")
            just_wrote_argument = False
            for argument in self._arguments:
                if just_wrote_argument:
                    writer.write(", ")
                argument.write(writer=writer)
                just_wrote_argument = True
            writer.write(")")


def get_reference_to_typing_extensions_import(name: str, require_postponed_annotations: bool = False) -> ClassReference:
    return ClassReference(
        import_=ReferenceImport(module=Module.built_in(("typing_extensions",))),
        qualified_name_excluding_import=(name,),
        require_postponed_annotations=require_postponed_annotations,
    )


def get_reference_to_typing_import(name: str) -> ClassReference:
    return ClassReference(
        import_=TYPING_REFERENCE_IMPORT,
        qualified_name_excluding_import=(name,),
    )


def get_reference_to_uuid_import(name: str) -> ClassReference:
    return ClassReference(
        import_=ReferenceImport(module=Module.built_in(("uuid",))),
        qualified_name_excluding_import=(name,),
    )


def get_reference_to_datetime_import(name: str) -> ClassReference:
    return ClassReference(
        import_=ReferenceImport(module=Module.built_in(("datetime",)), alias="dt"),
        qualified_name_excluding_import=(name,),
    )


def get_reference_to_built_in_primitive(name: str) -> ClassReference:
    return ClassReference(
        qualified_name_excluding_import=(name,),
    )

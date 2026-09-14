from typing import List, Optional

from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ...fern_aware_pydantic_model import FernAwarePydanticModel
from ..object_generator import (
    AbstractObjectGenerator,
    AbstractObjectSnippetGenerator,
    ObjectProperty,
)
from fern_python.codegen import AST, SourceFile
from fern_python.snippet import SnippetWriter
from fern_python.utils import get_name_from_wire_value, get_wire_value, resolve_name

import fern.ir.resources as ir_types


class PydanticModelObjectGenerator(AbstractObjectGenerator):
    def __init__(
        self,
        name: Optional[ir_types.DeclaredTypeName],
        extends: List[ir_types.DeclaredTypeName],
        properties: List[ObjectProperty],
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        class_name: Optional[str] = None,
        snippet: Optional[str] = None,
        xml: Optional[ir_types.XmlEncoding] = None,
    ):
        self._xml = xml
        super().__init__(
            name=name,
            extends=extends,
            properties=properties,
            context=context,
            source_file=source_file,
            custom_config=custom_config,
            docs=docs,
            class_name=class_name,
            snippet=snippet,
            as_request=False,
        )

    def _has_circular_extends(self) -> bool:
        """Check if any extends relationship would create a circular import.

        When type A extends type B, A's file has a hard top-level import of B.
        If B (transitively) references A, using Python inheritance creates
        a circular import that cannot be resolved with deferred imports.
        In this case we must fall back to inlining properties.
        """
        if self._name is None:
            return False
        for ext in self._extends:
            if self._context.does_type_reference_other_type(ext.type_id, self._name.type_id):
                return True
        return False

    def generate(self) -> None:
        use_inheritance = self._custom_config.use_inheritance_for_extended_models
        # Even when inheritance is configured, fall back to inlining if the
        # extends relationship participates in a circular reference cycle.
        # Python cannot resolve the circular top-level import that
        # inheritance requires in this scenario.
        if use_inheritance and self._has_circular_extends():
            use_inheritance = False

        # NOTE: we inline the properties from extended types here to avoid inheritance, which causes potential circular
        #       reference issues in particular cases with forward refs.
        all_properties = list(self._properties)
        if self._name is not None:
            for extended_properties in self._extends:
                all_properties.extend(
                    [
                        ObjectProperty(
                            name=extended_property.name,
                            value_type=extended_property.value_type,
                            docs=extended_property.docs,
                            xml=extended_property.xml,
                        )
                        for extended_property in self._context.get_all_properties_including_extensions(
                            extended_properties.type_id
                        )
                    ]
                )

        if use_inheritance:
            extends = self._extends
            properties = self._properties
        else:
            extends = []
            properties = all_properties

        with FernAwarePydanticModel(
            class_name=self._class_name,
            type_name=self._name,
            extends=extends,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
            docstring=self._docs,
            snippet=self._snippet,
        ) as pydantic_model:
            for property in properties:
                resolved_prop_name = resolve_name(get_name_from_wire_value(property.name))
                pydantic_model.add_field(
                    name=resolved_prop_name.snake_case.safe_name,
                    pascal_case_field_name=resolved_prop_name.pascal_case.safe_name,
                    type_reference=property.value_type,
                    json_field_name=get_wire_value(property.name),
                    description=property.docs,
                )
            if self._xml is not None:
                self._add_xml_methods(pydantic_model, xml=self._xml, properties=all_properties)

    def _add_xml_methods(
        self, pydantic_model: FernAwarePydanticModel, *, xml: ir_types.XmlEncoding, properties: List[ObjectProperty]
    ) -> None:
        core_utilities = self._context.core_utilities

        def write_to_xml_body(writer: AST.NodeWriter) -> None:
            writer.write("return ")
            writer.write_reference(core_utilities.get_xml_utility("serialize_xml_element"))
            writer.write_line("(")
            with writer.indent():
                writer.write_line(f"name={_quote(xml.name)},")
                if xml.namespace is not None:
                    writer.write_line(f"namespace={_quote(xml.namespace)},")
                if xml.prefix is not None:
                    writer.write_line(f"prefix={_quote(xml.prefix)},")
                writer.write_line("attributes=[")
                with writer.indent():
                    for property in properties:
                        if not _is_xml_attribute(property):
                            continue
                        writer.write_reference(core_utilities.get_xml_utility("XmlAttribute"))
                        writer.write(f"(name={_quote(_xml_name(property))}, value=self.{_field_name(property)}")
                        separator = property.xml.list_separator if property.xml is not None else None
                        if separator is not None:
                            writer.write(f", separator={_quote(separator)}")
                        writer.write_line("),")
                writer.write_line("],")
                for property in properties:
                    if _is_xml_text(property):
                        writer.write_line(f"text=self.{_field_name(property)},")
                        break
                writer.write_line("children=[")
                with writer.indent():
                    for property in properties:
                        if not _is_xml_element(property):
                            continue
                        writer.write_reference(core_utilities.get_xml_utility("XmlChild"))
                        writer.write(f"(name={_quote(_xml_name(property))}, value=self.{_field_name(property)}")
                        if property.xml is not None and property.xml.wrapped:
                            writer.write(", wrapped=True")
                        writer.write_line("),")
                writer.write_line("],")
                writer.write_line("xml_declaration=xml_declaration,")
            writer.write_line(")")

        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="to_xml",
                signature=AST.FunctionSignature(
                    named_parameters=[
                        AST.NamedFunctionParameter(
                            name="xml_declaration",
                            type_hint=AST.TypeHint.bool_(),
                            initializer=AST.Expression("False"),
                        )
                    ],
                    return_type=AST.TypeHint.str_(),
                ),
                body=AST.CodeWriter(write_to_xml_body),
                docstring=AST.CodeWriter(f"Serializes this object as a `<{xml.name}>` XML element."),
            )
        )
        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="__str__",
                signature=AST.FunctionSignature(return_type=AST.TypeHint.str_()),
                body=AST.CodeWriter("return self.to_xml()"),
            )
        )


def _is_xml_attribute(property: ObjectProperty) -> bool:
    if property.xml is None:
        return False
    return property.xml.kind.visit(attribute=lambda: True, text=lambda: False, element=lambda: False)


def _is_xml_text(property: ObjectProperty) -> bool:
    if property.xml is None:
        return False
    return property.xml.kind.visit(attribute=lambda: False, text=lambda: True, element=lambda: False)


def _is_xml_element(property: ObjectProperty) -> bool:
    """Properties of an XML element without explicit metadata serialize as child elements."""
    if property.xml is None:
        return True
    return property.xml.kind.visit(attribute=lambda: False, text=lambda: False, element=lambda: True)


def _xml_name(property: ObjectProperty) -> str:
    if property.xml is not None and property.xml.name is not None:
        return property.xml.name
    return get_wire_value(property.name)


def _field_name(property: ObjectProperty) -> str:
    return resolve_name(get_name_from_wire_value(property.name)).snake_case.safe_name


def _quote(value: str) -> str:
    return repr(value)


class PydanticModelObjectSnippetGenerator(AbstractObjectSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleObjectType,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
        )

    def generate_snippet(self) -> AST.Expression:
        return AST.Expression(
            AST.ClassInstantiation(
                class_=self.snippet_writer.get_class_reference_for_declared_type_name(
                    name=self.name,
                    as_request=False,
                ),
                args=self.snippet_writer.get_snippet_for_object_properties(
                    example=self.example,
                    request_parameter_names={},
                    use_typeddict_request=False,
                    as_request=False,
                    in_typeddict=False,
                ),
            ),
        )

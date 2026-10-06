"""Generates a pytest module per xml-encoded object type (e.g. every TwiML verb) that exercises the
generated `from_xml`/`to_xml` round trip."""

from dataclasses import dataclass
from typing import List, Optional, Sequence, Tuple

import fern.ir.resources as ir_types
from .context.sdk_generator_context import SdkGeneratorContext

from fern_python.codegen import Project
from fern_python.generators.pydantic_model.type_declaration_handler.object_generator import ObjectProperty
from fern_python.generators.pydantic_model.type_declaration_handler.pydantic_models.pydantic_model_object_generator import (
    xml_field_name,
    xml_list_item_type,
)
from fern_python.utils import get_wire_value, resolve_name

UNKNOWN_ENUM_VALUE = "bogus-value"
SPECIAL_CHARACTERS = "a & b < c > d \"q\" 'r'"


@dataclass(frozen=True)
class _Sample:
    xml: str
    python: str


@dataclass(frozen=True)
class _Property:
    ir: ir_types.ObjectProperty
    xml: ir_types.XmlPropertyEncoding
    field_name: str
    wire_name: str
    item_type: ir_types.TypeReference
    is_list: bool
    is_required: bool


class XmlModelTestGenerator:
    def __init__(self, *, context: SdkGeneratorContext, project: Project):
        self._context = context
        self._project = project
        self._pydantic_context = context.pydantic_generator_context

    def generate(self) -> None:
        for type_id, declaration in self._context.ir.types.items():
            xml = declaration.encoding.xml if declaration.encoding is not None else None
            if xml is None:
                continue
            object_declaration = declaration.shape.get_as_union()
            if object_declaration.type != "object":
                continue
            properties = [*(object_declaration.extended_properties or []), *object_declaration.properties]
            _XmlModelTest(self, type_id, declaration, xml, properties).write()

    # Shared helpers --------------------------------------------------------------------------------

    def import_line(self, type_id: ir_types.TypeId) -> str:
        reference = self._pydantic_context.get_class_reference_for_type_id(type_id, as_request=False)
        import_ = reference.import_
        if import_ is None or import_.named_import is None:
            raise RuntimeError(f"xml type {type_id} has no importable class reference")
        module_path = [*import_.module.path]
        if import_.module.is_local():
            module_path = [self._project.get_module_path_for_imports(), *module_path]
        return f"from {'.'.join(module_path)} import {import_.named_import}"

    def class_name(self, type_id: ir_types.TypeId) -> str:
        reference = self._pydantic_context.get_class_reference_for_type_id(type_id, as_request=False)
        if reference.import_ is None or reference.import_.named_import is None:
            raise RuntimeError(f"xml type {type_id} has no importable class reference")
        return reference.import_.named_import

    def xml_object_declarations(self, type_reference: ir_types.TypeReference) -> List[ir_types.TypeDeclaration]:
        """The xml-encoded object types reachable from a child element's type (directly or via an undiscriminated union)."""
        type_ids = self._pydantic_context.maybe_get_type_ids_for_type_reference(type_reference)
        if type_ids is None:
            return []
        result: List[ir_types.TypeDeclaration] = []
        for type_id in type_ids:
            declaration = self._pydantic_context.get_declaration_for_type_id(type_id)
            if declaration.encoding is None or declaration.encoding.xml is None:
                continue
            shape = declaration.shape.get_as_union()
            if shape.type == "object":
                result.append(declaration)
            elif shape.type == "undiscriminatedUnion":
                for member in shape.members:
                    result.extend(self.xml_object_declarations(member.type))
        return result

    def enum_values(self, type_reference: ir_types.TypeReference) -> Optional[List[str]]:
        union = type_reference.get_as_union()
        if union.type != "named":
            return None
        shape = self._pydantic_context.get_declaration_for_type_id(union.type_id).shape.get_as_union()
        if shape.type != "enum":
            return None
        return [get_wire_value(value.name) for value in shape.values]

    def write_file(self, filepath: str, contents: str) -> None:
        self._project.add_source_file(filepath, contents)


class _XmlModelTest:
    def __init__(
        self,
        generator: XmlModelTestGenerator,
        type_id: ir_types.TypeId,
        declaration: ir_types.TypeDeclaration,
        xml: ir_types.XmlEncoding,
        properties: Sequence[ir_types.ObjectProperty],
    ):
        self._generator = generator
        self._type_id = type_id
        self._declaration = declaration
        self._xml = xml
        self._class_name = generator.class_name(type_id)
        self._properties = [self._describe(p) for p in properties if p.xml is not None]

    def _describe(self, property: ir_types.ObjectProperty) -> _Property:
        assert property.xml is not None
        item_type = xml_list_item_type(property.value_type)
        return _Property(
            ir=property,
            xml=property.xml,
            field_name=xml_field_name(
                ObjectProperty(name=property.name, value_type=property.value_type, docs=property.docs, xml=property.xml)
            ),
            wire_name=property.xml.name if property.xml.name is not None else get_wire_value(property.name),
            item_type=item_type if item_type is not None else property.value_type,
            is_list=item_type is not None,
            is_required=not _is_optional(property.value_type),
        )

    def write(self) -> None:
        module_name = resolve_name(self._declaration.name.name).snake_case.safe_name
        body: List[str] = [
            "# This file was auto-generated by Fern from our API Definition.",
            "",
            "import pytest",
            "",
            self._generator.import_line(self._type_id),
            "",
        ]
        body.extend(self._round_trip_test())
        body.extend(self._unknown_content_test())
        body.extend(self._escaping_test())
        body.extend(self._open_enum_test())
        body.extend(self._child_order_test())
        body.extend(self._rejection_tests())
        self._generator.write_file(f"tests/xml/test_{module_name}.py", "\n".join(body) + "\n")

    # Tests -----------------------------------------------------------------------------------------

    def _round_trip_test(self) -> List[str]:
        sampled = [(p, s) for p in self._properties if (s := self._sample_value(p)) is not None]
        document = self._sample_document(sampled)
        lines = [
            "",
            "def test_from_xml_to_xml_round_trips() -> None:",
            f"    parsed = {self._class_name}.from_xml({document!r})",
        ]
        for property, sample in sampled:
            lines.append(f"    assert parsed.{property.field_name} == {sample.python}")
        lines.append("    serialized = parsed.to_xml(xml_declaration=False)")
        for property, sample in sampled:
            kind = _kind(property)
            if kind == "attribute":
                lines.append(f"    assert {property.wire_name + '=' + _attr(sample.xml)!r} in serialized")
            elif kind == "text":
                lines.append(f"    assert {'>' + sample.xml + '<'!r} in serialized")
        lines.append(f"    assert {self._class_name}.from_xml(serialized).to_xml(xml_declaration=False) == serialized")
        lines.append("    assert parsed.to_xml().startswith('<?xml version=\"1.0\"')")
        lines.append("    assert str(parsed) == parsed.to_xml()")
        lines.append("")
        return lines

    def _unknown_content_test(self) -> List[str]:
        document = self._document(' dataUnknown="1"', '<Unknown a="1">v</Unknown>')
        return [
            "",
            "def test_from_xml_preserves_unknown_attributes_and_children() -> None:",
            f"    parsed = {self._class_name}.from_xml({document!r})",
            "    serialized = parsed.to_xml(xml_declaration=False)",
            "    assert 'dataUnknown=\"1\"' in serialized",
            "    assert '<Unknown a=\"1\">v</Unknown>' in serialized",
            f"    assert {self._class_name}.from_xml(serialized).to_xml(xml_declaration=False) == serialized",
            "",
        ]

    def _escaping_test(self) -> List[str]:
        property = next(
            (
                p
                for p in self._properties
                if _kind(p) in ("attribute", "text") and not p.is_list and self._primitive(p.item_type) == "string"
            ),
            None,
        )
        if property is None:
            return []
        return [
            "",
            "def test_to_xml_escapes_special_characters() -> None:",
            f"    model = {self._class_name}({self._constructor_arguments(property)})",
            "    serialized = model.to_xml(xml_declaration=False)",
            "    assert 'a & b' not in serialized",
            "    assert '< c' not in serialized",
            f"    assert {self._class_name}.from_xml(serialized).{property.field_name} == {SPECIAL_CHARACTERS!r}",
            "",
        ]

    def _open_enum_test(self) -> List[str]:
        property = next(
            (
                p
                for p in self._properties
                if _kind(p) == "attribute" and not p.is_list and self._generator.enum_values(p.item_type) is not None
            ),
            None,
        )
        if property is None:
            return []
        document = self._document(f' {property.wire_name}="{UNKNOWN_ENUM_VALUE}"', except_=property)
        return [
            "",
            "def test_from_xml_keeps_unknown_enum_values() -> None:",
            f"    parsed = {self._class_name}.from_xml({document!r})",
            f"    assert {property.wire_name + '=' + _attr(UNKNOWN_ENUM_VALUE)!r} in parsed.to_xml(xml_declaration=False)",
            "",
        ]

    def _child_order_test(self) -> List[str]:
        names = self._content_child_names()
        has_text = any(_kind(p) == "text" and self._primitive(p.item_type) == "string" for p in self._properties)
        body: Optional[str] = None
        if len(names) >= 2:
            body = f"<{names[0]} /><{names[1]} /><{names[0]} />"
        elif len(names) == 1 and has_text:
            body = f"a<{names[0]} />b"
        if body is None:
            return []
        document = self._document("", body)
        return [
            "",
            "def test_from_xml_preserves_child_order() -> None:",
            f"    parsed = {self._class_name}.from_xml({document!r})",
            f"    assert {body!r} in parsed.to_xml(xml_declaration=False)",
            "",
        ]

    def _rejection_tests(self) -> List[str]:
        root = self._root_name()
        doctype = f'<!DOCTYPE {root} [<!ENTITY xxe "injected">]>{self._start_tag("")}&xxe;</{root}>'
        return [
            "",
            "def test_from_xml_rejects_wrong_root_element() -> None:",
            "    with pytest.raises(ValueError):",
            f"        {self._class_name}.from_xml({f'<NotThe{root} />'!r})",
            "",
            "",
            "def test_from_xml_rejects_malformed_xml() -> None:",
            "    with pytest.raises(ValueError):",
            f"        {self._class_name}.from_xml({f'<{root}><unclosed>'!r})",
            "",
            "",
            "def test_from_xml_rejects_doctype() -> None:",
            "    with pytest.raises(ValueError):",
            f"        {self._class_name}.from_xml({doctype!r})",
        ]

    def _constructor_arguments(self, special: _Property) -> str:
        arguments = [f"{special.field_name}={SPECIAL_CHARACTERS!r}"]
        arguments.extend(f"{p.field_name}={sample.python}" for p, sample in self._required_samples(special))
        return ", ".join(arguments)

    # Sample document -------------------------------------------------------------------------------

    def _required_samples(self, except_: Optional[_Property] = None) -> List[Tuple[_Property, _Sample]]:
        """Required attributes/text (with sample values) so documents in the non-round-trip tests still parse."""
        samples: List[Tuple[_Property, _Sample]] = []
        for p in self._properties:
            if not p.is_required or p is except_:
                continue
            sample = self._sample_value(p)
            if sample is not None:
                samples.append((p, sample))
        return samples

    def _document(self, attributes: str, body: str = "", except_: Optional[_Property] = None) -> str:
        required = self._required_samples(except_)
        required_attributes = "".join(
            f' {p.wire_name}="{sample.xml}"' for p, sample in required if _kind(p) == "attribute"
        )
        required_text = next((sample.xml for p, sample in required if _kind(p) == "text"), "")
        content = f"{required_text}{body}"
        if len(content) == 0:
            return self._start_tag(f"{required_attributes}{attributes}", self_closing=True)
        return f"{self._start_tag(f'{required_attributes}{attributes}')}{content}</{self._root_name()}>"

    def _sample_document(self, sampled: Sequence[Tuple[_Property, _Sample]]) -> str:
        attributes = "".join(f' {p.wire_name}="{s.xml}"' for p, s in sampled if _kind(p) == "attribute")
        text = next((s.xml for p, s in sampled if _kind(p) == "text"), "")
        children = "".join(self._sample_child(p) for p in self._properties if _kind(p) == "element")
        body = f"{text}{children}"
        if not body:
            return self._start_tag(attributes, self_closing=True)
        return f"{self._start_tag(attributes)}{body}</{self._root_name()}>"

    def _sample_child(self, property: _Property) -> str:
        children = self._generator.xml_object_declarations(property.item_type)
        if not children:
            return ""
        element = _empty_element(children[0])
        if property.xml.wrapped and property.is_list:
            return f"<{property.wire_name}>{element}</{property.wire_name}>"
        return element

    def _content_child_names(self) -> List[str]:
        """Element names of non-namespaced child types that live in the ordered content (not wrapped)."""
        names: List[str] = []
        for property in self._properties:
            if _kind(property) != "element" or (property.xml.wrapped and property.is_list):
                continue
            for child in self._generator.xml_object_declarations(property.item_type):
                xml = child.encoding.xml if child.encoding is not None else None
                if xml is not None and xml.namespace is None and xml.name not in names:
                    names.append(xml.name)
        return names

    def _root_name(self) -> str:
        return f"{self._xml.prefix}:{self._xml.name}" if self._xml.prefix is not None else self._xml.name

    def _start_tag(self, attributes: str, self_closing: bool = False) -> str:
        namespace = ""
        if self._xml.namespace is not None:
            namespace = (
                f' xmlns:{self._xml.prefix}="{self._xml.namespace}"'
                if self._xml.prefix is not None
                else f' xmlns="{self._xml.namespace}"'
            )
        return f"<{self._root_name()}{namespace}{attributes}{' />' if self_closing else '>'}"

    def _sample_value(self, property: _Property) -> Optional[_Sample]:
        if _kind(property) not in ("attribute", "text"):
            return None
        first = self._sample_item(property, 0)
        if first is None:
            return None
        if not property.is_list:
            return first
        second = self._sample_item(property, 1)
        if second is None:
            return None
        separator = property.xml.list_separator if property.xml.list_separator is not None else " "
        return _Sample(xml=f"{first.xml}{separator}{second.xml}", python=f"[{first.python}, {second.python}]")

    def _sample_item(self, property: _Property, index: int) -> Optional[_Sample]:
        enum_values = self._generator.enum_values(property.item_type)
        if enum_values is not None:
            if not enum_values:
                return None
            value = enum_values[index] if index < len(enum_values) else enum_values[0]
            return _Sample(xml=value, python=repr(value))
        primitive = self._primitive(property.item_type)
        is_text = _kind(property) == "text"
        if primitive == "string":
            value = f"{'text' if is_text else property.wire_name}{'' if index == 0 else f'-{index + 1}'}"
            return _Sample(xml=value, python=repr(value))
        if primitive == "integer":
            return _Sample(xml=str(index + 1), python=str(index + 1))
        if primitive == "boolean":
            return _Sample(xml="true", python="True") if index == 0 else _Sample(xml="false", python="False")
        if primitive == "double":
            return _Sample(xml=f"{index + 1}.5", python=f"{index + 1}.5")
        return None

    def _primitive(self, type_reference: ir_types.TypeReference) -> Optional[str]:
        """Coarse primitive classification: "string" | "integer" | "double" | "boolean" | None (unsupported)."""
        union = type_reference.get_as_union()
        if union.type != "primitive":
            return None
        return union.primitive.v_1.visit(
            integer=lambda: "integer",
            double=lambda: "double",
            string=lambda: "string",
            boolean=lambda: "boolean",
            long_=lambda: "integer",
            date_time=lambda: None,
            date_time_rfc_2822=lambda: None,
            uuid_=lambda: None,
            date=lambda: None,
            base_64=lambda: None,
            big_integer=lambda: None,
            uint=lambda: "integer",
            uint_64=lambda: "integer",
            float_=lambda: "double",
        )


def _is_optional(type_reference: ir_types.TypeReference) -> bool:
    union = type_reference.get_as_union()
    if union.type != "container":
        return False
    return union.container.get_as_union().type in ("optional", "nullable")


def _kind(property: _Property) -> str:
    return property.xml.kind.visit(attribute=lambda: "attribute", text=lambda: "text", element=lambda: "element")


def _attr(value: str) -> str:
    return f'"{value}"'


def _empty_element(declaration: ir_types.TypeDeclaration) -> str:
    xml = declaration.encoding.xml if declaration.encoding is not None else None
    if xml is None:
        return ""
    if xml.prefix is not None and xml.namespace is not None:
        return f'<{xml.prefix}:{xml.name} xmlns:{xml.prefix}="{xml.namespace}" />'
    if xml.namespace is not None:
        return f'<{xml.name} xmlns="{xml.namespace}" />'
    return f"<{xml.name} />"

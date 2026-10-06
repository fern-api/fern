import dataclasses
from typing import Dict, List, Optional, Sequence, Set, Tuple

from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ...fern_aware_pydantic_model import FernAwarePydanticModel
from ..object_generator import (
    AbstractObjectGenerator,
    AbstractObjectSnippetGenerator,
    ObjectProperty,
)
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.docstring import escape_docstring
from fern_python.pydantic_codegen.pydantic_model import BASE_MODEL_PROPERTIES, PydanticModel, sanitize_field_name
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
            preserve_child_identity=self._xml is not None,
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
                    writer.write("*")
                    writer.write_reference(core_utilities.get_xml_utility("extra_xml_attributes"))
                    writer.write_line("(self),")
                writer.write_line("],")
                for property in properties:
                    if _is_xml_text(property):
                        writer.write_line(f"text=self.{_field_name(property)},")
                        separator = property.xml.list_separator if property.xml is not None else None
                        if separator is not None:
                            writer.write_line(f"text_separator={_quote(separator)},")
                        break
                inline_properties = self._inline_child_properties(properties)
                writer.write_line("children=[")
                with writer.indent():
                    for property in properties:
                        if not _is_xml_element(property) or property in inline_properties:
                            continue
                        writer.write_reference(core_utilities.get_xml_utility("XmlChild"))
                        writer.write(f"(name={_quote(_xml_name(property))}, value=self.{_field_name(property)}")
                        if property.xml is not None and property.xml.wrapped:
                            writer.write(", wrapped=True")
                        writer.write_line("),")
                writer.write_line("],")
                writer.write("content=")
                writer.write_reference(core_utilities.get_xml_utility("order_xml_content"))
                writer.write(f"(self.{_CONTENT}")
                for property in inline_properties:
                    writer.write(f", self.{_field_name(property)}")
                writer.write_line("),")
                writer.write_line("xml_declaration=xml_declaration,")
            writer.write_line(")")

        pydantic_model.add_private_instance_field_unsafe(
            name=_CONTENT,
            type_hint=AST.TypeHint.list(
                AST.TypeHint(
                    type=AST.ClassReference(
                        qualified_name_excluding_import=(),
                        import_=core_utilities.get_xml_utility("XmlContent").import_,
                    )
                )
            ),
            default_factory=AST.Expression("list"),
        )

        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="to_xml",
                signature=AST.FunctionSignature(
                    named_parameters=[
                        AST.NamedFunctionParameter(
                            name="xml_declaration",
                            type_hint=AST.TypeHint.bool_(),
                            initializer=AST.Expression("True"),
                        )
                    ],
                    return_type=AST.TypeHint.str_(),
                ),
                body=AST.CodeWriter(write_to_xml_body),
                docstring=AST.CodeWriter(
                    f"Serializes this object as a `<{xml.name}>` XML element, "
                    "prefixed with the XML declaration unless `xml_declaration` is False."
                ),
            )
        )
        str_body = "return self.to_xml()"
        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="__str__",
                signature=AST.FunctionSignature(return_type=AST.TypeHint.str_()),
                body=AST.CodeWriter(str_body),
            )
        )
        self._add_xml_init(pydantic_model, properties=properties)
        self._add_xml_list_coercion(pydantic_model, properties=properties)
        self._add_from_xml(pydantic_model, xml=xml, properties=properties)
        self._add_add_child_method(pydantic_model)
        self._add_add_text_method(pydantic_model)
        self._add_xml_builder_methods(pydantic_model, properties=properties)

    def _inline_child_properties(self, properties: Sequence[ObjectProperty]) -> List[ObjectProperty]:
        """Child element properties holding xml-encoded models that render inline (not wrapped) and so
        live in the ordered content."""
        return [
            p
            for p in properties
            if _is_xml_element(p)
            and not (p.xml is not None and p.xml.wrapped)
            and len(self._get_xml_object_type_ids(_unwrap_list_item_type(p.value_type) or p.value_type)) > 0
        ]

    def _xml_element_class(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=self._context.core_utilities.get_xml_utility("XmlElement").import_,
        )

    def _add_from_xml(
        self, pydantic_model: FernAwarePydanticModel, *, xml: ir_types.XmlEncoding, properties: List[ObjectProperty]
    ) -> None:
        """Emits `from_xml(xml)`: raw attribute/text strings and parsed children go through the constructor,
        so pydantic performs scalar conversion; unknown attributes become extras and unknown children are kept."""
        core_utilities = self._context.core_utilities
        attribute_names = [_xml_name(p) for p in properties if _is_xml_attribute(p)]
        has_text = any(_is_xml_text(p) for p in properties)
        inline_properties = self._inline_child_properties(properties)
        # Children read outside the ordered content: scalar-valued elements and wrapped lists.
        skipped_child_names: List[str] = []
        wrappers: Dict[str, List[str]] = {}
        inline_child_types: Dict[str, AST.ClassReference] = {}
        child_type_maps: Dict[str, Dict[str, AST.ClassReference]] = {}
        for property in properties:
            if not _is_xml_element(property):
                continue
            item_type = _unwrap_list_item_type(property.value_type)
            child_types = self._child_type_map(
                pydantic_model, item_type if item_type is not None else property.value_type
            )
            child_type_maps[_field_name(property)] = child_types
            wrapped = property.xml is not None and property.xml.wrapped
            if wrapped:
                wrappers[_xml_name(property)] = list(child_types.keys()) or [_xml_name(property)]
            elif not child_types:
                # Scalar children are named after the property itself.
                skipped_child_names.append(_xml_name(property))
            else:
                inline_child_types.update(child_types)

        def write_property(writer: AST.NodeWriter, property: ObjectProperty) -> None:
            separator = property.xml.list_separator if property.xml is not None else None
            separator_arg = f", separator={_quote(separator)}" if separator is not None else ""
            writer.write(f"{_field_name(property)}=")
            if _is_xml_attribute(property):
                writer.write_reference(core_utilities.get_xml_utility("xml_attribute"))
                writer.write_line(f"(node, {_quote(_xml_name(property))}{separator_arg}),")
                return
            if _is_xml_text(property):
                writer.write_reference(core_utilities.get_xml_utility("xml_leading_text"))
                writer.write_line(f"(node{separator_arg}),")
                return
            item_type = _unwrap_list_item_type(property.value_type)
            wrapped = property.xml is not None and property.xml.wrapped
            child_types = child_type_maps[_field_name(property)]
            if property in inline_properties:
                writer.write_reference(
                    core_utilities.get_xml_utility("xml_content_item" if item_type is None else "xml_content_items")
                )
                writer.write("(content, (")
                for class_reference in child_types.values():
                    writer.write_reference(class_reference)
                    writer.write(", ")
                writer.write(")")
                if item_type is not None and _is_optional(property.value_type):
                    writer.write(", optional=True")
                writer.write_line("),")
                return
            writer.write_reference(core_utilities.get_xml_utility("xml_child" if item_type is None else "xml_children"))
            writer.write("(node, {")
            if child_types:
                for index, (tag, class_reference) in enumerate(child_types.items()):
                    writer.write(f"{', ' if index > 0 else ''}{_quote(tag)}: ")
                    writer.write_reference(class_reference)
            else:
                writer.write(f"{_quote(_xml_name(property))}: str")
            writer.write("}")
            if item_type is not None:
                if wrapped:
                    writer.write(f", wrapper={_quote(_xml_name(property))}")
                if _is_optional(property.value_type):
                    writer.write(", optional=True")
            writer.write_line("),")

        def write_body(writer: AST.NodeWriter) -> None:
            writer.write("node = ")
            writer.write_reference(core_utilities.get_xml_utility("parse_xml"))
            writer.write_line(f"(xml, {_quote(xml.name)})")
            writer.write("content = ")
            writer.write_reference(core_utilities.get_xml_utility("xml_content"))
            writer.write("(node, {")
            for index, (tag, class_reference) in enumerate(inline_child_types.items()):
                writer.write(f"{', ' if index > 0 else ''}{_quote(tag)}: ")
                writer.write_reference(class_reference)
            writer.write("}")
            if has_text:
                writer.write(", skip_leading_text=True")
            if skipped_child_names:
                writer.write(f", skip={_set_literal(skipped_child_names)}")
            if wrappers:
                wrapper_literal = ", ".join(
                    f"{_quote(name)}: {_set_literal(items)}" for name, items in wrappers.items()
                )
                writer.write(f", wrappers={{{wrapper_literal}}}")
            writer.write_line(")")
            writer.write("model = ")
            writer.write_reference(core_utilities.get_xml_utility("build_xml_model"))
            writer.write_line("(")
            with writer.indent():
                writer.write_line("cls,")
                writer.write_line("dict(")
                with writer.indent():
                    for property in properties:
                        write_property(writer, property)
                writer.write_line("),")
                writer.write_line(f"node, {_set_literal(attribute_names)},")
            writer.write_line(")")
            writer.write_line(f"model.{_CONTENT}[:] = content")
            writer.write_line("return model")

        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="from_xml",
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name="xml",
                            type_hint=AST.TypeHint.union(
                                AST.TypeHint.str_(),
                                AST.TypeHint(
                                    type=AST.ClassReference(
                                        qualified_name_excluding_import=(),
                                        import_=core_utilities.get_xml_utility("XmlNode").import_,
                                    )
                                ),
                            ),
                        )
                    ],
                    return_type=AST.TypeHint(type=pydantic_model.to_reference()),
                ),
                body=AST.CodeWriter(write_body),
                docstring=AST.CodeWriter(
                    f"Parses a `<{xml.name}>` XML element from a document string or a parsed node.\n\n"
                    "Raises `ValueError` for malformed XML, an unexpected root element or invalid values. "
                    "Unknown attributes are kept as extra attributes; text segments and child elements "
                    "(declared or not) are preserved in document order."
                ),
            ),
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
        )

    def _child_type_map(
        self, pydantic_model: FernAwarePydanticModel, type_reference: ir_types.TypeReference
    ) -> Dict[str, AST.ClassReference]:
        """Maps each xml-encoded object type reachable from the reference to its class, keyed by XML tag."""
        result: Dict[str, AST.ClassReference] = {}
        for type_id in self._get_xml_object_type_ids(type_reference):
            declaration = self._context.get_declaration_for_type_id(type_id)
            if declaration.encoding is None or declaration.encoding.xml is None:
                continue
            # See _add_child_builder_method: cyclic imports have resolved by the time the method body runs.
            result[declaration.encoding.xml.name] = dataclasses.replace(
                pydantic_model.get_class_reference_for_type_id(type_id), has_been_dynamically_imported=True
            )
        return result

    def _add_add_text_method(self, pydantic_model: FernAwarePydanticModel) -> None:
        def write_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"self.{_CONTENT}.append(text)")
            writer.write_line("return self")

        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="add_text",
                signature=AST.FunctionSignature(
                    parameters=[AST.FunctionParameter(name="text", type_hint=AST.TypeHint.str_())],
                    return_type=AST.TypeHint(type=pydantic_model.to_reference()),
                ),
                body=AST.CodeWriter(write_body),
                docstring=AST.CodeWriter(
                    "Appends a text segment after the children added so far and returns this element, "
                    "so text and child elements can be interleaved."
                ),
            )
        )

    def _add_add_child_method(self, pydantic_model: FernAwarePydanticModel) -> None:
        def write_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"self.{_CONTENT}.append(child)")
            writer.write_line("return self")

        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="add_child",
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(name="child", type_hint=AST.TypeHint(type=self._xml_element_class()))
                    ],
                    return_type=AST.TypeHint(type=pydantic_model.to_reference()),
                ),
                body=AST.CodeWriter(write_body),
                docstring=AST.CodeWriter(
                    "Appends an arbitrary child element (one the schema does not define) after the content "
                    "added so far and returns this element."
                ),
            )
        )

    def _add_xml_init(self, pydantic_model: FernAwarePydanticModel, *, properties: List[ObjectProperty]) -> None:
        """Lets the text body be passed positionally (`Say("Hello", voice=...)`), accepts extra attributes and
        seeds the ordered content with the children passed to the constructor."""
        core_utilities = self._context.core_utilities
        text_property = next((p for p in properties if _is_xml_text(p)), None)
        inline_properties = self._inline_child_properties(properties)
        if text_property is None and not inline_properties:
            return
        keyword_properties = self._order_optional_last([p for p in properties if p is not text_property])
        all_properties = [text_property, *keyword_properties] if text_property is not None else keyword_properties

        def write_body(writer: AST.NodeWriter) -> None:
            # Fields go through a dict: the pydantic mypy plugin only knows this class's `__init__`, not the base's.
            fields = ", ".join(f"{_field_name(p)}={_field_name(p)}" for p in all_properties)
            writer.write_line(f"super().__init__(**dict({fields}), **{_EXTRA_ATTRIBUTES})")
            if inline_properties:
                writer.write(f"self.{_CONTENT}.extend(")
                writer.write_reference(core_utilities.get_xml_utility("order_xml_content"))
                writer.write("([]")
                for property in inline_properties:
                    writer.write(f", self.{_field_name(property)}")
                writer.write_line("))")

        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="__init__",
                signature=AST.FunctionSignature(
                    parameters=[self._parameter(pydantic_model, text_property)] if text_property is not None else [],
                    named_parameters=[self._parameter(pydantic_model, p) for p in keyword_properties],
                    include_kwargs=True,
                    kwargs_name=_EXTRA_ATTRIBUTES,
                    kwargs_type_hint=AST.TypeHint.str_(),
                    return_type=AST.TypeHint.none(),
                ),
                body=AST.CodeWriter(write_body),
                docstring=_docstring_with_parameters(
                    None, [self._parameter(pydantic_model, p) for p in all_properties]
                ),
            )
        )

    def _add_xml_list_coercion(
        self, pydantic_model: FernAwarePydanticModel, *, properties: List[ObjectProperty]
    ) -> None:
        """Lets list-valued attributes and text be passed as one delimited string (`input="speech dtmf"`)."""
        separators: Dict[str, str] = {}
        for p in properties:
            if not (_is_xml_attribute(p) or _is_xml_text(p)) or _unwrap_list_item_type(p.value_type) is None:
                continue
            separator = p.xml.list_separator if p.xml is not None and p.xml.list_separator else " "
            separators[_field_name(p)] = separator
            separators[get_wire_value(p.name)] = separator
        if not separators:
            return
        core_utilities = self._context.core_utilities

        def write_body(writer: AST.NodeWriter) -> None:
            entries = ", ".join(f"{_quote(name)}: {_quote(separator)}" for name, separator in separators.items())
            writer.write("return ")
            writer.write_reference(core_utilities.get_xml_utility("coerce_xml_list_fields"))
            writer.write_line(f"({PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME}, {{{entries}}})")

        pydantic_model.add_root_validator(validator_name="_coerce_xml_lists", body=AST.CodeWriter(write_body), pre=True)

    def _parameter(
        self, pydantic_model: FernAwarePydanticModel, property: ObjectProperty
    ) -> AST.NamedFunctionParameter:
        return AST.NamedFunctionParameter(
            name=_field_name(property),
            docs=property.docs,
            type_hint=pydantic_model.get_type_hint_for_type_reference(property.value_type),
            initializer=self._context.get_initializer_for_type_reference(property.value_type),
        )

    def _order_optional_last(self, properties: Sequence[ObjectProperty]) -> List[ObjectProperty]:
        return sorted(
            properties, key=lambda p: self._context.get_initializer_for_type_reference(p.value_type) is not None
        )

    def _add_xml_builder_methods(
        self, pydantic_model: FernAwarePydanticModel, *, properties: List[ObjectProperty]
    ) -> None:
        """Emits fluent `append(child)` / `<tag>(...)` methods for list-valued child element properties."""
        list_properties: List[Tuple[ObjectProperty, ir_types.TypeReference]] = []
        for property in properties:
            if not _is_xml_element(property):
                continue
            item_type = _unwrap_list_item_type(property.value_type)
            if item_type is not None:
                list_properties.append((property, item_type))
        if len(list_properties) == 0:
            return

        reserved_names: Set[str] = {_field_name(property) for property in properties} | _RESERVED_METHOD_NAMES
        for property, item_type in list_properties:
            field_name = _field_name(property)
            # Wrapped lists render inside their wrapper element, so they are not part of the ordered content.
            inline = not (property.xml is not None and property.xml.wrapped)
            if len(list_properties) == 1:
                self._add_append_method(pydantic_model, field_name=field_name, item_type=item_type, inline=inline)
            for child_type_id, method_name in self._builder_method_names(item_type, reserved_names).items():
                reserved_names.add(method_name)
                self._add_child_builder_method(
                    pydantic_model,
                    method_name=method_name,
                    field_name=field_name,
                    child_type_id=child_type_id,
                    inline=inline,
                )

    def _add_append_method(
        self,
        pydantic_model: FernAwarePydanticModel,
        *,
        field_name: str,
        item_type: ir_types.TypeReference,
        inline: bool,
    ) -> None:
        core_utilities = self._context.core_utilities

        def write_body(writer: AST.NodeWriter) -> None:
            writer.write_reference(core_utilities.get_xml_utility("append_xml_child"))
            writer.write_line(f"(self, {_quote(field_name)}, child{_inline_argument(inline)})")
            writer.write_line("return self")

        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name="append",
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name="child", type_hint=pydantic_model.get_type_hint_for_type_reference(item_type)
                        )
                    ],
                    return_type=AST.TypeHint(type=pydantic_model.to_reference()),
                ),
                body=AST.CodeWriter(write_body),
                docstring=AST.CodeWriter("Appends a child element and returns this element for chaining."),
            )
        )

    def _builder_method_names(
        self, item_type: ir_types.TypeReference, reserved_names: Set[str]
    ) -> Dict[ir_types.TypeId, str]:
        """Maps each xml-encoded object member of the child type to a unique snake_case method name.

        Names derive from the child's XML tag (`<say-as>` -> `say_as`, `<break>` -> `break_`); on a
        clash with a field or another child they fall back to the class name, then an `add_` prefix.
        """
        candidates: Dict[ir_types.TypeId, str] = {}
        for type_id in self._get_xml_object_type_ids(item_type):
            declaration = self._context.get_declaration_for_type_id(type_id)
            tag = (
                declaration.encoding.xml.name
                if declaration.encoding is not None and declaration.encoding.xml is not None
                else self._context.get_class_name_for_type_id(type_id, as_request=False)
            )
            candidates[type_id] = _snake_name(tag)

        tag_counts: Dict[str, int] = {}
        for name in candidates.values():
            tag_counts[name] = tag_counts.get(name, 0) + 1

        result: Dict[ir_types.TypeId, str] = {}
        taken = set(reserved_names)
        for type_id, name in candidates.items():
            if tag_counts[name] > 1:
                name = _snake_name(self._context.get_class_name_for_type_id(type_id, as_request=False))
            while name in taken:
                name = f"add_{name}"
            taken.add(name)
            result[type_id] = name
        return result

    def _get_xml_object_type_ids(self, type_reference: ir_types.TypeReference) -> List[ir_types.TypeId]:
        type_ids = self._context.maybe_get_type_ids_for_type_reference(type_reference)
        if type_ids is None:
            return []
        result: List[ir_types.TypeId] = []
        for type_id in type_ids:
            declaration = self._context.get_declaration_for_type_id(type_id)
            has_xml = declaration.encoding is not None and declaration.encoding.xml is not None
            result.extend(
                declaration.shape.visit(
                    alias=lambda _: [],
                    enum=lambda _: [],
                    object=lambda _: [type_id] if has_xml else [],
                    union=lambda _: [],
                    undiscriminated_union=lambda union: [
                        member_id
                        for member in union.members
                        for member_id in self._get_xml_object_type_ids(member.type)
                    ],
                )
            )
        return result

    def _add_child_builder_method(
        self,
        pydantic_model: FernAwarePydanticModel,
        *,
        method_name: str,
        field_name: str,
        child_type_id: ir_types.TypeId,
        inline: bool,
    ) -> None:
        core_utilities = self._context.core_utilities
        child_class = pydantic_model.get_class_reference_for_type_id(child_type_id)
        # Cyclic child types are imported at the bottom of the module; that import has already run by
        # the time the method body executes, so the constructor call must not be string-quoted.
        child_constructor = dataclasses.replace(child_class, has_been_dynamically_imported=True)
        child_declaration = self._context.get_declaration_for_type_id(child_type_id)
        child_tag = (
            child_declaration.encoding.xml.name
            if child_declaration.encoding is not None and child_declaration.encoding.xml is not None
            else None
        )
        child_properties = [
            ObjectProperty(name=p.name, value_type=p.value_type, docs=p.docs, xml=p.xml)
            for p in self._context.get_all_properties_including_extensions(child_type_id)
        ]

        # The text body is the leading positional parameter (`response.say("Hello", voice=...)`);
        # attributes are keyword-only; nested child lists are populated via the child's own builders.
        text_property = next((p for p in child_properties if _is_xml_text(p)), None)
        keyword_properties = [
            p
            for p in child_properties
            if p is not text_property and not (_is_xml_element(p) and _unwrap_list_item_type(p.value_type) is not None)
        ]

        ordered_keyword_properties = self._order_optional_last(keyword_properties)
        forwarded_properties: Sequence[ObjectProperty] = (
            [text_property, *ordered_keyword_properties] if text_property is not None else ordered_keyword_properties
        )

        def write_body(writer: AST.NodeWriter) -> None:
            writer.write("child = ")
            writer.write_reference(child_constructor)
            writer.write("(")
            # Child lists are passed explicitly so `**extra_attributes: str` can't be mistaken for them.
            arguments = [f"{_field_name(p)}={_field_name(p)}" for p in forwarded_properties] + [
                f"{_field_name(p)}={'None' if _is_optional(p.value_type) else '[]'}"
                for p in child_properties
                if p not in forwarded_properties
            ]
            writer.write_line(", ".join([*arguments, f"**{_EXTRA_ATTRIBUTES}"]) + ")")
            writer.write_reference(core_utilities.get_xml_utility("append_xml_child"))
            writer.write_line(f"(self, {_quote(field_name)}, child{_inline_argument(inline)})")
            writer.write_line("return child")

        summary = f"Appends a `<{child_tag}>` child element and returns it." if child_tag is not None else None
        if child_declaration.docs is not None:
            summary = f"{summary}\n\n{child_declaration.docs}" if summary is not None else child_declaration.docs

        positional_parameters = [self._parameter(pydantic_model, text_property)] if text_property is not None else []
        named_parameters = [self._parameter(pydantic_model, p) for p in ordered_keyword_properties]
        pydantic_model.add_method_unsafe(
            AST.FunctionDeclaration(
                name=method_name,
                signature=AST.FunctionSignature(
                    parameters=positional_parameters,
                    named_parameters=named_parameters,
                    include_kwargs=True,
                    kwargs_name=_EXTRA_ATTRIBUTES,
                    kwargs_type_hint=AST.TypeHint.str_(),
                    return_type=AST.TypeHint(type=child_class),
                ),
                body=AST.CodeWriter(write_body),
                docstring=_docstring_with_parameters(summary, [*positional_parameters, *named_parameters]),
            )
        )


_EXTRA_ATTRIBUTES = "extra_attributes"
_CONTENT = "_content"


def _inline_argument(inline: bool) -> str:
    return "" if inline else ", inline=False"


def _docstring_with_parameters(
    summary: Optional[str], parameters: Sequence[AST.NamedFunctionParameter]
) -> Optional[AST.CodeWriter]:
    """numpydoc-style docstring: optional summary followed by a `Parameters` section (same layout as endpoint methods)."""
    if summary is None and len(parameters) == 0:
        return None

    def write(writer: AST.NodeWriter) -> None:
        if summary is not None:
            writer.write_line(escape_docstring(summary))
        if len(parameters) == 0:
            return
        if summary is not None:
            writer.write_line()
        writer.write_line("Parameters")
        writer.write_line("----------")
        for i, parameter in enumerate(parameters):
            if i > 0:
                writer.write_line()
                writer.write_line()
            writer.write(f"{parameter.name} : ")
            if parameter.type_hint is not None:
                writer.write_node(parameter.type_hint)
            if parameter.docs is not None:
                lines = parameter.docs.split("\n")
                with writer.indent():
                    for j, line in enumerate(lines):
                        writer.write(escape_docstring(line))
                        if j < len(lines) - 1:
                            writer.write_line()
        writer.write_line()
        writer.write_line()
        writer.write(f"**{_EXTRA_ATTRIBUTES} : str")
        with writer.indent():
            writer.write("Additional XML attributes not declared in the API definition.")
        writer.write_line()

    return AST.CodeWriter(write)


# Builder method names that would shadow generated or pydantic model API.
_RESERVED_METHOD_NAMES = {"to_xml", "from_xml", "append", "add_child"} | BASE_MODEL_PROPERTIES


def _set_literal(names: Sequence[str]) -> str:
    unique = list(dict.fromkeys(names))
    return "{" + ", ".join(_quote(name) for name in unique) + "}" if unique else "()"


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
    return sanitize_field_name(resolve_name(get_name_from_wire_value(property.name)).snake_case.safe_name)


def _snake_name(name: str) -> str:
    return resolve_name(get_name_from_wire_value(name)).snake_case.safe_name


def _unwrap_list_item_type(type_reference: ir_types.TypeReference) -> Optional[ir_types.TypeReference]:
    """Returns the item type of a (possibly optional/nullable) list, or None if not a list."""

    def visit_container(container: ir_types.ContainerType) -> Optional[ir_types.TypeReference]:
        return container.visit(
            list_=lambda item: item,
            map_=lambda _: None,
            nullable=_unwrap_list_item_type,
            optional=_unwrap_list_item_type,
            set_=lambda _: None,
            literal=lambda _: None,
        )

    return type_reference.visit(
        container=visit_container,
        named=lambda _: None,
        primitive=lambda _: None,
        unknown=lambda: None,
    )


def _is_optional(type_reference: ir_types.TypeReference) -> bool:
    return type_reference.visit(
        container=lambda container: container.visit(
            optional=lambda _: True,
            nullable=lambda _: True,
            list_=lambda _: False,
            map_=lambda _: False,
            set_=lambda _: False,
            literal=lambda _: False,
        ),
        named=lambda _: False,
        primitive=lambda _: False,
        unknown=lambda: False,
    )


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

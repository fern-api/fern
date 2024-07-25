from dataclasses import dataclass
from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.generators.pydantic_model.typeddict import FernTypedDict
from fern_python.snippet import SnippetWriter

from ...context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from ..fern_aware_pydantic_model import FernAwarePydanticModel
from .abstract_type_generator import AbstractTypeGenerator


@dataclass
class ObjectProperty:
    name: ir_types.NameAndWireValue
    value_type: ir_types.TypeReference
    docs: Optional[str]


class ObjectGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: Optional[ir_types.DeclaredTypeName],
        extends: List[ir_types.DeclaredTypeName],
        properties: List[ObjectProperty],
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        maybe_requests_source_file: Optional[SourceFile],
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        class_name: Optional[str] = None,
        snippet: Optional[str] = None,
    ):
        super().__init__(
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            maybe_requests_source_file=maybe_requests_source_file,
            docs=docs,
            snippet=snippet,
        )
        self._name = name
        self._extends = extends
        self._properties = properties
        self._class_name = class_name

    def generate(self) -> None:
        if self._class_name is None and self._name is None:
            raise ValueError("Either class_name or name must be provided")
        elif self._class_name is not None:
            class_name = self._class_name
        elif self._name is not None:
            class_name = self._context.get_class_name_for_type_id(self._name.type_id, as_request=False)

        with FernAwarePydanticModel(
            class_name=class_name,
            type_name=self._name,
            extends=self._extends,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
            docstring=self._docs,
            snippet=self._snippet,
        ) as pydantic_model:
            for property in self._properties:
                pydantic_model.add_field(
                    name=property.name.name.snake_case.safe_name,
                    pascal_case_field_name=property.name.name.pascal_case.safe_name,
                    type_reference=property.value_type,
                    json_field_name=property.name.wire_value,
                    description=property.docs,
                )

        if self._maybe_requests_source_file is not None:
            if self._name is not None:
                with FernTypedDict(
                    context=self._context,
                    source_file=self._maybe_requests_source_file,
                    type_name=self._name,
                    should_export=True,
                    extended_types=self._extends,
                    docstring=self._docs,
                ) as typed_dict:
                    for property in self._properties:
                        typed_dict.add_field(
                            name=property.name.name.snake_case.safe_name,
                            type_reference=property.value_type,
                            json_field_name=property.name.wire_value,
                            description=property.docs,
                        )
            else:
                raise ValueError("name must be provided to generate a typed dict")


class ObjectSnippetGenerator:
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleObjectType,
    ):
        self.name = name
        self.example = example
        self.snippet_writer = snippet_writer

    def generate_snippet(self) -> AST.Expression:
        return AST.Expression(
            AST.ClassInstantiation(
                class_=self.snippet_writer.get_class_reference_for_declared_type_name(
                    name=self.name,
                ),
                args=self.snippet_writer.get_snippet_for_object_properties(
                    example=self.example, request_parameter_names={}
                ),
            ),
        )
